package com.evolv.auth;

import com.evolv.auditoria.AuditoriaService;
import com.evolv.auth.dto.AuthResponse;
import com.evolv.auth.dto.LoginRequest;
import com.evolv.auth.dto.RegistroRequest;
import com.evolv.usuario.Usuario;
import com.evolv.usuario.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

import static org.springframework.http.HttpStatus.CONFLICT;
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

        auditoriaService.registrar("CADASTRO_USUARIO", "Usuario", usuario.getId(),
                "Novo usuário cadastrado com perfil " + usuario.getPerfil());
        auditoriaService.registrar("ACEITE_TERMOS_LGPD", "Usuario", usuario.getId(),
                "Termos de uso e política de privacidade aceitos no cadastro");

        String token = jwtService.gerarToken(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                new AuthResponse(token, usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getPerfil()));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getSenha()));
        } catch (BadCredentialsException e) {
            throw new ResponseStatusException(UNAUTHORIZED, "E-mail ou senha inválidos.");
        }

        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "E-mail ou senha inválidos."));

        auditoriaService.registrar("LOGIN", "Usuario", usuario.getId(), "Login realizado com sucesso");

        String token = jwtService.gerarToken(usuario);
        return new AuthResponse(token, usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getPerfil());
    }
}
