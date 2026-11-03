package com.evolv.tentativa.dto;

import jakarta.validation.constraints.NotNull;

public class RespostaRequest {

    @NotNull(message = "A questão é obrigatória.")
    private Long questaoId;

    /**
     * Alternativa escolhida. Pode ser null somente em quiz com tempo por
     * questao, quando o tempo acabou sem resposta (conta como erro).
     */
    private Long alternativaId;

    public Long getQuestaoId() { return questaoId; }
    public void setQuestaoId(Long questaoId) { this.questaoId = questaoId; }
    public Long getAlternativaId() { return alternativaId; }
    public void setAlternativaId(Long alternativaId) { this.alternativaId = alternativaId; }
}
