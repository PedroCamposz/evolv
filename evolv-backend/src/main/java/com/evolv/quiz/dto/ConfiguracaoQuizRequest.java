package com.evolv.quiz.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Edicao das configuracoes de um quiz ja criado (titulo, descricao e limite de tentativas). */
public class ConfiguracaoQuizRequest {

    @NotBlank(message = "O título do quiz é obrigatório.")
    @Size(max = 150, message = "O título deve ter no máximo 150 caracteres.")
    private String titulo;

    @Size(max = 500, message = "A descrição deve ter no máximo 500 caracteres.")
    private String descricao;

    @Min(value = 1, message = "O limite de tentativas deve ser no mínimo 1.")
    @Max(value = 20, message = "O limite de tentativas deve ser no máximo 20.")
    private Integer maxTentativas;

    /** Tempo por questao em segundos (10 a 600). Vazio = sem limite. */
    @Min(value = 10, message = "O tempo por questão deve ser de pelo menos 10 segundos.")
    @Max(value = 600, message = "O tempo por questão deve ser de no máximo 10 minutos.")
    private Integer tempoPorQuestao;

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public Integer getMaxTentativas() { return maxTentativas; }
    public Integer getTempoPorQuestao() { return tempoPorQuestao; }
    public void setTempoPorQuestao(Integer tempoPorQuestao) { this.tempoPorQuestao = tempoPorQuestao; }
    public void setMaxTentativas(Integer maxTentativas) { this.maxTentativas = maxTentativas; }
}
