package com.evolv.auditoria;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Ponto unico para registrar acoes de auditoria. Os services de negocio
 * (CategoriaService, QuizService, AuthController) chamam registrar(...)
 * apos cada operacao sensivel.
 */
@Service
public class AuditoriaService {

    private final LogAuditoriaRepository repository;

    public AuditoriaService(LogAuditoriaRepository repository) {
        this.repository = repository;
    }

    public void registrar(String acao, String entidade, Object entidadeId, String detalhes) {
        registrarComo(usuarioAtual(), acao, entidade, entidadeId, detalhes);
    }

    /**
     * Registra informando quem fez a acao. Usado no login/cadastro, quando
     * ainda nao existe usuario autenticado na requisicao.
     */
    public void registrarComo(String email, String acao, String entidade, Object entidadeId, String detalhes) {
        LogAuditoria log = new LogAuditoria(
                email,
                acao,
                entidade,
                entidadeId == null ? null : entidadeId.toString(),
                detalhes);
        repository.save(log);
    }

    public List<LogAuditoria> listarTodos() {
        return repository.findAllByOrderByDataHoraDesc();
    }

    private String usuarioAtual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        // AnonymousAuthenticationToken: requisicao sem login (ex.: tela de login).
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            return "sistema";
        }
        return auth.getName();
    }
}
