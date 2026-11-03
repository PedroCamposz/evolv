package com.evolv.tentativa.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class TentativaRequest {

    @NotEmpty(message = "Responda as questões antes de concluir o quiz.")
    @Valid
    private List<RespostaRequest> respostas;

    /** Opcional: tempo gasto no quiz, em segundos. */
    @Min(value = 0, message = "Tempo inválido.")
    @Max(value = 86400, message = "Tempo inválido.")
    private Integer tempoSegundos;

    public List<RespostaRequest> getRespostas() { return respostas; }
    public void setRespostas(List<RespostaRequest> respostas) { this.respostas = respostas; }
    public Integer getTempoSegundos() { return tempoSegundos; }
    public void setTempoSegundos(Integer tempoSegundos) { this.tempoSegundos = tempoSegundos; }
}
