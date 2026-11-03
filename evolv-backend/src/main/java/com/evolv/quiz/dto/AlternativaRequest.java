package com.evolv.quiz.dto;

import jakarta.validation.constraints.NotBlank;

public class AlternativaRequest {

    @NotBlank(message = "O texto da alternativa é obrigatório.")
    private String texto;

    private boolean correta;

    public String getTexto() {
        return texto;
    }

    public void setTexto(String texto) {
        this.texto = texto;
    }

    public boolean isCorreta() {
        return correta;
    }

    public void setCorreta(boolean correta) {
        this.correta = correta;
    }
}
