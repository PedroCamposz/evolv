package com.evolv.usuario;

import com.evolv.auditoria.AuditoriaService;
import com.evolv.auditoria.LogAuditoria;
import com.evolv.auditoria.LogAuditoriaRepository;
import com.evolv.gamificacao.ConquistaUsuarioRepository;
import com.evolv.tentativa.Tentativa;
import com.evolv.tentativa.TentativaRepository;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.transaction.annotation.Transactional;
import com.evolv.gamificacao.GamificacaoService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

/**
 * RF13 - Administracao de usuarios (somente ADMIN, ver SecurityConfig).
 * O administrador consulta os usuarios, altera o perfil de acesso e
 * ativa/desativa contas. Nao ha exclusao fisica para nao apagar o
 * historico de tentativas; a conta desativada simplesmente nao faz login.
 */
@RestController
@RequestMapping("/api/admin/usuarios")
public class AdminUsuarioController {

    private final UsuarioRepository repository;
    private final AuditoriaService auditoriaService;
    private final PasswordEncoder passwordEncoder;
    private final TentativaRepository tentativaRepository;
    private final ConquistaUsuarioRepository conquistaRepository;
    private final LogAuditoriaRepository logRepository;

    public AdminUsuarioController(UsuarioRepository repository, AuditoriaService auditoriaService,
                                  PasswordEncoder passwordEncoder, TentativaRepository tentativaRepository,
                                  ConquistaUsuarioRepository conquistaRepository, LogAuditoriaRepository logRepository) {
        this.repository = repository;
        this.auditoriaService = auditoriaService;
        this.passwordEncoder = passwordEncoder;
        this.tentativaRepository = tentativaRepository;
        this.conquistaRepository = conquistaRepository;
        this.logRepository = logRepository;
    }

    public record UsuarioAdminDTO(Long id, String nome, String email, Perfil perfil, boolean ativo,
                                  int xpTotal, int nivel, LocalDateTime criadoEm) {
        static UsuarioAdminDTO de(Usuario u) {
            return new UsuarioAdminDTO(u.getId(), u.getNome(), u.getEmail(), u.getPerfil(), u.isAtivo(),
                    u.getXpTotal(), GamificacaoService.calcularNivel(u.getXpTotal()), u.getCriadoEm());
        }
    }

    public record NovoUsuarioRequest(
            @NotBlank(message = "O nome é obrigatório.") @Size(max = 120, message = "Nome muito longo.") String nome,
            @NotBlank(message = "O e-mail é obrigatório.") @Email(message = "E-mail inválido.") String email,
            @NotBlank(message = "A senha é obrigatória.") @Size(min = 8, message = "A senha precisa ter pelo menos 8 caracteres.") String senha,
            @NotNull(message = "O perfil é obrigatório.") Perfil perfil) {
    }

    /**
     * Cria um usuario de qualquer perfil, inclusive ADMIN (unico jeito de
     * criar um administrador pelo sistema). A senha inicial funciona como
     * senha temporaria (72h) e o aceite dos termos e feito pelo proprio
     * usuario no primeiro acesso.
     */
    @PostMapping
    public ResponseEntity<UsuarioAdminDTO> criar(@Valid @RequestBody NovoUsuarioRequest request) {
        String email = request.email().trim().toLowerCase();
        if (repository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(CONFLICT, "Já existe um usuário cadastrado com esse e-mail.");
        }
        Usuario novo = new Usuario(request.nome().trim(), email, passwordEncoder.encode(request.senha()), request.perfil());
        // A senha inicial e conhecida pelo admin, entao vale como temporaria:
        // no primeiro acesso a pessoa cria a propria senha e aceita os termos (LGPD).
        novo.setSenhaTemporaria(true);
        novo.setSenhaTemporariaExpiraEm(LocalDateTime.now().plusHours(72));
        Usuario usuario = repository.save(novo);
        auditoriaService.registrar("CRIAR_USUARIO", "Usuario", usuario.getId(),
                usuario.getEmail() + " criado pelo administrador com perfil " + usuario.getPerfil());
        return ResponseEntity.status(HttpStatus.CREATED).body(UsuarioAdminDTO.de(usuario));
    }

    /** Dados completos de um usuario (cadastro, LGPD, gamificacao e acesso). */
    public record UsuarioDetalheDTO(Long id, String nome, String email, Perfil perfil, boolean ativo,
                                    LocalDateTime criadoEm, boolean aceitouTermos, LocalDateTime dataAceiteTermos,
                                    int xpTotal, int nivel, long tentativas, long quizzesConcluidos,
                                    Double mediaAcertos, long conquistas, LocalDateTime ultimoLogin,
                                    boolean senhaTemporaria, LocalDateTime senhaTemporariaExpiraEm) {
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public UsuarioDetalheDTO detalhar(@PathVariable Long id) {
        Usuario u = buscar(id);
        List<Tentativa> tentativas = tentativaRepository.findByAlunoIdOrderByConcluidaEmDesc(id);
        Double media = tentativas.isEmpty() ? null
                : GamificacaoService.arredondar(tentativas.stream().mapToDouble(Tentativa::getPercentual).average().orElse(0));
        LocalDateTime ultimoLogin = logRepository.findFirstByUsuarioEmailIgnoreCaseAndAcaoOrderByDataHoraDesc(u.getEmail(), "LOGIN")
                .map(LogAuditoria::getDataHora).orElse(null);
        return new UsuarioDetalheDTO(u.getId(), u.getNome(), u.getEmail(), u.getPerfil(), u.isAtivo(), u.getCriadoEm(),
                u.isAceitouTermos(), u.getDataAceiteTermos(), u.getXpTotal(), GamificacaoService.calcularNivel(u.getXpTotal()),
                tentativas.size(), tentativas.stream().map(t -> t.getQuiz().getId()).distinct().count(), media,
                conquistaRepository.findByUsuarioId(id).size(), ultimoLogin,
                u.isSenhaTemporaria() && !u.senhaTemporariaExpirada(), u.getSenhaTemporariaExpiraEm());
    }

    public record SenhaTemporariaRequest(
            @NotNull(message = "Informe a validade.") @Min(value = 1, message = "Validade mínima de 1 hora.")
            @Max(value = 72, message = "Validade máxima de 72 horas.") Integer validadeHoras) {
    }

    public record SenhaTemporariaDTO(String senhaTemporaria, LocalDateTime expiraEm) {
    }

    /**
     * Gera uma senha temporaria (ex.: o usuario esqueceu a senha). A senha e
     * mostrada uma unica vez ao administrador, que a repassa ao usuario. No
     * primeiro acesso o usuario e obrigado a criar a propria senha, e a
     * temporaria deixa de valer depois do prazo. Sessoes abertas com a senha
     * antiga sao encerradas.
     */
    @PostMapping("/{id}/senha-temporaria")
    public SenhaTemporariaDTO gerarSenhaTemporaria(@PathVariable Long id, @Valid @RequestBody SenhaTemporariaRequest request,
                                                   @AuthenticationPrincipal Usuario admin) {
        Usuario usuario = buscar(id);
        protegerPropriaConta(usuario, admin);
        String senha = gerarSenhaAleatoria();
        LocalDateTime expira = LocalDateTime.now().plusHours(request.validadeHoras());
        usuario.setSenhaHash(passwordEncoder.encode(senha));
        usuario.setSenhaTemporaria(true);
        usuario.setSenhaTemporariaExpiraEm(expira);
        usuario.setSenhaAlteradaEm(LocalDateTime.now());
        repository.save(usuario);
        // A senha em si nunca vai para o log.
        auditoriaService.registrar("SENHA_TEMPORARIA", "Usuario", id,
                usuario.getEmail() + ": senha temporária gerada, válida por " + request.validadeHoras() + "h");
        return new SenhaTemporariaDTO(senha, expira);
    }

    private static final String CARACTERES = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    /** 10 caracteres sem os que confundem na leitura (0/O, 1/l/I). */
    static String gerarSenhaAleatoria() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 10; i++) {
            sb.append(CARACTERES.charAt(RANDOM.nextInt(CARACTERES.length())));
        }
        return sb.toString();
    }

    @GetMapping
    public List<UsuarioAdminDTO> listar() {
        return repository.findAllByOrderByNomeAsc().stream().map(UsuarioAdminDTO::de).toList();
    }

    /** Corpo: { "perfil": "PROFESSOR" } */
    @PatchMapping("/{id}/perfil")
    public UsuarioAdminDTO alterarPerfil(@PathVariable Long id, @RequestBody Map<String, String> body,
                                         @AuthenticationPrincipal Usuario admin) {
        Usuario usuario = buscar(id);
        protegerPropriaConta(usuario, admin);
        Perfil novo;
        try {
            novo = Perfil.valueOf(String.valueOf(body.get("perfil")).toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(BAD_REQUEST, "Perfil inválido. Use ALUNO, PROFESSOR ou ADMIN.");
        }
        Perfil anterior = usuario.getPerfil();
        usuario.setPerfil(novo);
        repository.save(usuario);
        auditoriaService.registrar("ALTERAR_PERFIL", "Usuario", id, usuario.getEmail() + ": " + anterior + " -> " + novo);
        return UsuarioAdminDTO.de(usuario);
    }

    /** Corpo: { "ativo": false } */
    @PatchMapping("/{id}/ativo")
    public UsuarioAdminDTO alterarAtivo(@PathVariable Long id, @RequestBody Map<String, Boolean> body,
                                        @AuthenticationPrincipal Usuario admin) {
        Usuario usuario = buscar(id);
        protegerPropriaConta(usuario, admin);
        boolean ativo = Boolean.TRUE.equals(body.get("ativo"));
        usuario.setAtivo(ativo);
        repository.save(usuario);
        auditoriaService.registrar(ativo ? "ATIVAR_USUARIO" : "DESATIVAR_USUARIO", "Usuario", id, usuario.getEmail());
        return UsuarioAdminDTO.de(usuario);
    }

    private Usuario buscar(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Usuário não encontrado."));
    }

    /** Regra: o administrador nao pode rebaixar, desativar nem gerar senha temporaria para a propria conta. */
    private void protegerPropriaConta(Usuario alvo, Usuario admin) {
        if (alvo.getId().equals(admin.getId())) {
            throw new ResponseStatusException(BAD_REQUEST,
                    "Você não pode alterar o perfil, desativar ou redefinir a senha da sua própria conta por aqui.");
        }
    }
}
