package com.evolv.auth;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * RF - Login e controle de acesso.
 *
 * Define: quais rotas sao publicas, quais exigem apenas estar logado, e
 * quais exigem um perfil especifico (PROFESSOR/ADMIN). A API e "stateless"
 * (sem sessao de servidor) - a autenticacao acontece via JWT a cada request.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsService userDetailsService;
    private final SecurityResponseHandler securityResponseHandler;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                           UserDetailsService userDetailsService,
                           SecurityResponseHandler securityResponseHandler) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.userDetailsService = userDetailsService;
        this.securityResponseHandler = securityResponseHandler;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt: criptografia de senha com "salt" automatico - nunca guardamos
        // a senha em texto puro (requisito de criptografia).
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Rotas publicas: login/registro, paginas de LGPD e o console do H2.
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/lgpd/**").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()

                        // Consulta (GET) de categorias: qualquer usuario logado.
                        .requestMatchers(HttpMethod.GET, "/api/categorias/**").authenticated()

                        // /api/quizzes devolve o quiz COM gabarito: so PROFESSOR ou ADMIN.
                        // O aluno usa /api/aluno/quizzes, que nao expoe a resposta correta.
                        .requestMatchers("/api/quizzes/**").hasAnyRole("PROFESSOR", "ADMIN")

                        // Criar/editar/excluir categorias: so PROFESSOR ou ADMIN.
                        .requestMatchers(HttpMethod.POST, "/api/categorias/**").hasAnyRole("PROFESSOR", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/categorias/**").hasAnyRole("PROFESSOR", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/categorias/**").hasAnyRole("PROFESSOR", "ADMIN")

                        // Realizar quizzes e ver o proprio historico: so ALUNO.
                        .requestMatchers("/api/aluno/**").hasRole("ALUNO")

                        // Dashboards: cada perfil ve o seu.
                        .requestMatchers("/api/dashboard/aluno").hasRole("ALUNO")
                        .requestMatchers("/api/dashboard/professor").hasAnyRole("PROFESSOR", "ADMIN")
                        .requestMatchers("/api/dashboard/admin").hasRole("ADMIN")

                        // Administracao de usuarios: so ADMIN.
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Logs de auditoria: so ADMIN.
                        .requestMatchers("/api/auditoria/**").hasRole("ADMIN")

                        // Integracao externa (importar perguntas prontas): PROFESSOR ou ADMIN.
                        .requestMatchers("/api/integracao/**").hasAnyRole("PROFESSOR", "ADMIN")

                        // Tudo que nao e /api sao as telas do React (index.html, JS, CSS)
                        // servidas pelo proprio Spring Boot no site publicado. A protecao
                        // dos dados continua nas rotas /api acima.
                        .requestMatchers(request -> !request.getRequestURI().startsWith("/api")).permitAll()

                        .anyRequest().authenticated())
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(securityResponseHandler)
                        .accessDeniedHandler(securityResponseHandler))
                // Permite que o console do H2 (usa <frame>) funcione durante o desenvolvimento.
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
