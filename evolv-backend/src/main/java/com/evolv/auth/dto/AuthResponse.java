package com.evolv.auth.dto;

import com.evolv.usuario.Perfil;

import java.time.LocalDateTime;

public class AuthResponse {

    private String token;
    private Long usuarioId;
    private String nome;
    private String email;
    private Perfil perfil;
    /** true quando o login foi feito com senha temporaria: o front leva para a troca de senha. */
    private boolean trocarSenha;
    private LocalDateTime senhaExpiraEm;
    /** Conta criada pelo admin: o usuario ainda precisa aceitar os termos (LGPD). */
    private boolean aceiteTermosPendente;

    public AuthResponse(String token, Long usuarioId, String nome, String email, Perfil perfil) {
        this(token, usuarioId, nome, email, perfil, false, null);
    }

    public AuthResponse(String token, Long usuarioId, String nome, String email, Perfil perfil,
                        boolean trocarSenha, LocalDateTime senhaExpiraEm) {
        this.token = token;
        this.usuarioId = usuarioId;
        this.nome = nome;
        this.email = email;
        this.perfil = perfil;
        this.trocarSenha = trocarSenha;
        this.senhaExpiraEm = senhaExpiraEm;
    }

    public AuthResponse comAceitePendente(boolean pendente) {
        this.aceiteTermosPendente = pendente;
        return this;
    }

    public boolean isAceiteTermosPendente() {
        return aceiteTermosPendente;
    }

    public boolean isTrocarSenha() {
        return trocarSenha;
    }

    public LocalDateTime getSenhaExpiraEm() {
        return senhaExpiraEm;
    }

    public String getToken() {
        return token;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public String getNome() {
        return nome;
    }

    public String getEmail() {
        return email;
    }

    public Perfil getPerfil() {
        return perfil;
    }
}
