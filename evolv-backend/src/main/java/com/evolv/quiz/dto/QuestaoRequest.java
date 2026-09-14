package com.evolv.quiz.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public class QuestaoRequest {

    @NotBlank(message = "O enunciado da questão é obrigatório.")
    private String enunciado;

    @Size(min = 2, message = "Cada questão precisa de pelo menos 2 alternativas.")
    @Valid
    private List<AlternativaRequest> alternativas;

    public String getEnunciado() {
        return enunciado;
    }

    public void setEnunciado(String enunciado) {
        this.enunciado = enunciado;
    }

    public List<AlternativaRequest> getAlternativas() {
        return alternativas;
    }

    public void setAlternativas(List<AlternativaRequest> alternativas) {
        this.alternativas = alternativas;
    }
}
