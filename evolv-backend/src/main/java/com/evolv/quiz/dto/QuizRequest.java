package com.evolv.quiz.dto;

import jakarta.validation.Valid;
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

    @Size(min = 1, message = "O quiz precisa de pelo menos 1 questão.")
    @Valid
    private List<QuestaoRequest> questoes;

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
}
