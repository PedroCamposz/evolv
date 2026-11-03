package com.evolv.quiz.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public class QuizRequest {

    @NotBlank(message = "O título do quiz é obrigatório.")
    private String titulo;

    private String descricao;

    @NotNull(message = "A categoria é obrigatória.")
    private Long categoriaId;

    @NotNull(message = "O quiz precisa de pelo menos 1 questão.")
    @Size(min = 1, message = "O quiz precisa de pelo menos 1 questão.")
    @Valid
    private List<QuestaoRequest> questoes;

    /** Limite de tentativas por aluno (1 a 20). Vazio = ilimitado. */
    @Min(value = 1, message = "O limite de tentativas deve ser no mínimo 1.")
    @Max(value = 20, message = "O limite de tentativas deve ser no máximo 20.")
    private Integer maxTentativas;

    /** Tempo por questao em segundos (10 a 600). Vazio = sem limite. */
    @Min(value = 10, message = "O tempo por questão deve ser de pelo menos 10 segundos.")
    @Max(value = 600, message = "O tempo por questão deve ser de no máximo 10 minutos.")
    private Integer tempoPorQuestao;

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Long getCategoriaId() {
        return categoriaId;
    }

    public void setCategoriaId(Long categoriaId) {
        this.categoriaId = categoriaId;
    }

    public List<QuestaoRequest> getQuestoes() {
        return questoes;
    }

    public void setQuestoes(List<QuestaoRequest> questoes) {
        this.questoes = questoes;
    }

    public Integer getMaxTentativas() {
        return maxTentativas;
    }

    public void setMaxTentativas(Integer maxTentativas) {
        this.maxTentativas = maxTentativas;
    }

    public Integer getTempoPorQuestao() {
        return tempoPorQuestao;
    }

    public void setTempoPorQuestao(Integer tempoPorQuestao) {
        this.tempoPorQuestao = tempoPorQuestao;
    }
}
