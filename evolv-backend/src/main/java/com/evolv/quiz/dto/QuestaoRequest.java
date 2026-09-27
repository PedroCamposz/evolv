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

    /**
     * Opcional. "OPENTDB" quando a questão veio da importação da Open
     * Trivia Database; se não informado, é tratada como "MANUAL".
     */
    private String origem;

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

    public String getOrigem() {
        return origem;
    }

    public void setOrigem(String origem) {
        this.origem = origem;
    }
}
