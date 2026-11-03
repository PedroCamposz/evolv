package com.evolv.auditoria;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LogAuditoriaRepository extends JpaRepository<LogAuditoria, Long> {

    List<LogAuditoria> findAllByOrderByDataHoraDesc();

    Optional<LogAuditoria> findFirstByUsuarioEmailIgnoreCaseAndAcaoOrderByDataHoraDesc(String usuarioEmail, String acao);
}
