package com.evolv.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.evolv.usuario.Usuario;

import java.io.IOException;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;

/**
 * Roda uma vez a cada requisicao: le o header "Authorization: Bearer <token>",
 * valida o JWT e, se for valido, autentica o usuario para o Spring Security
 * (permitindo que os controllers saibam quem esta fazendo a chamada).
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                     @NonNull HttpServletResponse response,
                                     @NonNull FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            String email = jwtService.extrairEmail(token);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                // isEnabled(): conta desativada pelo admin (RF13) perde o acesso na hora,
                // mesmo que ainda tenha um token valido.
                Usuario usuario = (Usuario) userDetails;

                // Token emitido antes da ultima troca de senha nao vale mais
                // (ex.: o admin gerou uma senha temporaria para esta conta).
                boolean tokenAntigo = usuario.getSenhaAlteradaEm() != null
                        && jwtService.extrairEmissao(token).toInstant()
                        .isBefore(usuario.getSenhaAlteradaEm().truncatedTo(ChronoUnit.SECONDS)
                                .atZone(ZoneId.systemDefault()).toInstant());

                // Com senha temporaria, o usuario so pode trocar a senha.
                if (!tokenAntigo && usuario.isEnabled() && usuario.isSenhaTemporaria()
                        && !usuario.senhaTemporariaExpirada()
                        && !request.getRequestURI().equals("/api/auth/trocar-senha")
                        && jwtService.tokenValido(token, userDetails)) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"mensagem\":\"Troque sua senha temporária para continuar.\",\"codigo\":\"TROCAR_SENHA\"}");
                    return;
                }

                if (!tokenAntigo && userDetails.isEnabled() && !usuario.senhaTemporariaExpirada()
                        && jwtService.tokenValido(token, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Token invalido/expirado: segue sem autenticar; o Spring Security
            // vai bloquear o acesso a rotas protegidas mais adiante.
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
