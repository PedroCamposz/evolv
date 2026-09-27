package com.evolv.auth.dto;

import com.evolv.usuario.Perfil;

public class AuthResponse {

    private String token;
    private Long usuarioId;
    private String nome;
    private String email;
    private Perfil perfil;

    public AuthResponse(String token, Long usuarioId, String nome, String email, Perfil perfil) {
        this.token = token;
        this.usuarioId = usuarioId;
        this.nome = nome;
        this.email = email;
        this.perfil = perfil;
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
