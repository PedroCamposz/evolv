package com.evolv.gamificacao;

import com.evolv.usuario.Usuario;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/** Registro de que um usuario obteve uma conquista (cada uma so uma vez). */
@Entity
@Table(name = "conquista_usuario",
        uniqueConstraints = @UniqueConstraint(columnNames = {"usuario_id", "conquista"}))
public class ConquistaUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private Conquista conquista;

    @Column(nullable = false, updatable = false)
    private LocalDateTime obtidaEm = LocalDateTime.now();

    public ConquistaUsuario() {
    }

    public ConquistaUsuario(Usuario usuario, Conquista conquista) {
        this.usuario = usuario;
        this.conquista = conquista;
    }

    public Long getId() { return id; }
    public Usuario getUsuario() { return usuario; }
    public Conquista getConquista() { return conquista; }
    public LocalDateTime getObtidaEm() { return obtidaEm; }
}
