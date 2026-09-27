package com.evolv.auditoria;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * RF - Logs de auditoria.
 * Registra quem fez o que e quando, para rastreabilidade das operacoes
 * sensiveis do sistema (criacao/edicao/exclusao de dados, login, aceite
 * de termos LGPD, etc).
 */
@Entity
@Table(name = "log_auditoria")
public class LogAuditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String usuarioEmail;

    @Column(nullable = false, length = 60)
    private String acao;

    @Column(nullable = false, length = 60)
    private String entidade;

    private String entidadeId;

    @Column(length = 500)
    private String detalhes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dataHora = LocalDateTime.now();

    public LogAuditoria() {
    }

    public LogAuditoria(String usuarioEmail, String acao, String entidade, String entidadeId, String detalhes) {
        this.usuarioEmail = usuarioEmail;
        this.acao = acao;
        this.entidade = entidade;
        this.entidadeId = entidadeId;
        this.detalhes = detalhes;
    }

    public Long getId() {
        return id;
    }

    public String getUsuarioEmail() {
        return usuarioEmail;
    }

    public String getAcao() {
        return acao;
    }

    public String getEntidade() {
        return entidade;
    }

    public String getEntidadeId() {
        return entidadeId;
    }

    public String getDetalhes() {
        return detalhes;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }
}
