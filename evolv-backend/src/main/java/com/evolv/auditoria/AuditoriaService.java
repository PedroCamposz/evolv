package com.evolv.auditoria;

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
        String email = usuarioAtual();
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
        if (auth == null || !auth.isAuthenticated()) {
            return "sistema";
        }
        return auth.getName();
    }
}
