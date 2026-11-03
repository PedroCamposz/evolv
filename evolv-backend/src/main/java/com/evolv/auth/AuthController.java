package com.evolv.auth;

import com.evolv.auditoria.AuditoriaService;
import com.evolv.auth.dto.AuthResponse;
import com.evolv.auth.dto.LoginRequest;
import com.evolv.auth.dto.RegistroRequest;
import com.evolv.auth.dto.TrocarSenhaRequest;
import com.evolv.usuario.Perfil;
import com.evolv.usuario.Usuario;
import com.evolv.usuario.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

/**
 * RF - Login e controle de acesso (registro e autenticacao).
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AuditoriaService auditoriaService;

    public AuthController(UsuarioRepository usuarioRepository,
                           PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager,
                           JwtService jwtService,
                           AuditoriaService auditoriaService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.auditoriaService = auditoriaService;
    }

    @PostMapping("/registrar")
    public ResponseEntity<AuthResponse> registrar(@Valid @RequestBody RegistroRequest request) {
        // Regra de seguranca: ninguem se cadastra sozinho como administrador.
        // O perfil ADMIN so pode ser atribuido por outro admin (RF13).
        if (request.getPerfil() == Perfil.ADMIN) {
            throw new ResponseStatusException(BAD_REQUEST,
                    "O perfil de administrador só pode ser atribuído por outro administrador.");
        }
        request.setEmail(request.getEmail().trim().toLowerCase());
        request.setNome(request.getNome().trim());
        if (usuarioRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new ResponseStatusException(CONFLICT, "Já existe um usuário cadastrado com esse e-mail.");
        }

        Usuario usuario = new Usuario(
                request.getNome(),
                request.getEmail(),
                passwordEncoder.encode(request.getSenha()), // criptografia da senha (BCrypt)
                request.getPerfil());

        // LGPD: registra o aceite dos termos com data/hora.
        usuario.setAceitouTermos(true);
        usuario.setDataAceiteTermos(LocalDateTime.now());

        usuario = usuarioRepository.save(usuario);

        auditoriaService.registrarComo(usuario.getEmail(), "CADASTRO_USUARIO", "Usuario", usuario.getId(),
                "Novo usuário cadastrado com perfil " + usuario.getPerfil());
        auditoriaService.registrarComo(usuario.getEmail(), "ACEITE_TERMOS_LGPD", "Usuario", usuario.getId(),
                "Termos de uso e política de privacidade aceitos no cadastro");

        String token = jwtService.gerarToken(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new AuthResponse(token, usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getPerfil()));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        request.setEmail(request.getEmail().trim());
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getSenha()));
        } catch (BadCredentialsException e) {
            throw new ResponseStatusException(UNAUTHORIZED, "E-mail ou senha inválidos.");
        } catch (DisabledException e) {
            // RF13 - conta desativada pelo administrador.
            throw new ResponseStatusException(FORBIDDEN, "Sua conta está desativada. Procure o administrador.");
        }

        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "E-mail ou senha inválidos."));

        // Senha temporaria vencida: deixa de valer (o admin precisa gerar outra).
        if (usuario.senhaTemporariaExpirada()) {
            auditoriaService.registrarComo(usuario.getEmail(), "LOGIN_NEGADO", "Usuario", usuario.getId(),
                    "Tentativa de login com senha temporária expirada");
            throw new ResponseStatusException(FORBIDDEN,
                    "Sua senha temporária expirou. Peça uma nova ao administrador.");
        }

        auditoriaService.registrarComo(usuario.getEmail(), "LOGIN", "Usuario", usuario.getId(),
                usuario.isSenhaTemporaria() ? "Login com senha temporária" : "Login realizado com sucesso");

        String token = jwtService.gerarToken(usuario);
        return new AuthResponse(token, usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getPerfil(),
                usuario.isSenhaTemporaria(), usuario.getSenhaTemporariaExpiraEm())
                .comAceitePendente(!usuario.isAceitouTermos());
    }

    /**
     * Troca de senha pelo proprio usuario (logado). Obrigatoria depois de
     * entrar com senha temporaria. Devolve um token novo, porque os tokens
     * antigos deixam de valer apos a troca.
     */
    @PostMapping("/trocar-senha")
    public AuthResponse trocarSenha(@AuthenticationPrincipal Usuario logado,
                                    @Valid @RequestBody TrocarSenhaRequest request) {
        if (logado == null) {
            throw new ResponseStatusException(UNAUTHORIZED, "É necessário estar autenticado para trocar a senha.");
        }
        Usuario usuario = usuarioRepository.findById(logado.getId())
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Usuário não encontrado."));
        // Troca normal: confirma a senha atual. Troca da senha temporaria: o
        // usuario ja se autenticou com ela neste login, entao nao pedimos de novo.
        boolean trocaDaTemporaria = usuario.isSenhaTemporaria() && !usuario.senhaTemporariaExpirada();
        if (!trocaDaTemporaria) {
            if (request.getSenhaAtual() == null || request.getSenhaAtual().isBlank()) {
                throw new ResponseStatusException(BAD_REQUEST, "Informe a senha atual.");
            }
            if (!passwordEncoder.matches(request.getSenhaAtual(), usuario.getPassword())) {
                throw new ResponseStatusException(BAD_REQUEST, "A senha atual está incorreta.");
            }
        }
        if (passwordEncoder.matches(request.getNovaSenha(), usuario.getPassword())) {
            throw new ResponseStatusException(BAD_REQUEST, "A nova senha precisa ser diferente da atual.");
        }
        // LGPD: conta criada pelo admin aceita os termos no primeiro acesso.
        boolean registrarAceite = false;
        if (!usuario.isAceitouTermos()) {
            if (!Boolean.TRUE.equals(request.getAceitouTermos())) {
                throw new ResponseStatusException(BAD_REQUEST,
                        "É necessário aceitar os Termos de Uso e a Política de Privacidade.");
            }
            usuario.setAceitouTermos(true);
            usuario.setDataAceiteTermos(LocalDateTime.now());
            registrarAceite = true;
        }
        usuario.setSenhaHash(passwordEncoder.encode(request.getNovaSenha()));
        usuario.setSenhaTemporaria(false);
        usuario.setSenhaTemporariaExpiraEm(null);
        usuario.setSenhaAlteradaEm(LocalDateTime.now());
        usuarioRepository.save(usuario);
        auditoriaService.registrarComo(usuario.getEmail(), "TROCAR_SENHA", "Usuario", usuario.getId(),
                "Senha alterada pelo próprio usuário");
        if (registrarAceite) {
            auditoriaService.registrarComo(usuario.getEmail(), "ACEITE_TERMOS_LGPD", "Usuario", usuario.getId(),
                    "Termos de uso e política de privacidade aceitos no primeiro acesso");
        }

        String token = jwtService.gerarToken(usuario);
        return new AuthResponse(token, usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getPerfil());
    }
}
