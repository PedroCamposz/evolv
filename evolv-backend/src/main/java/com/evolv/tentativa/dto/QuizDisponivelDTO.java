package com.evolv.tentativa.dto;

/**
 * Quiz na lista do aluno. maxTentativas null = ilimitado.
 * podeResponder fica false quando o aluno ja usou todas as tentativas.
 */
public record QuizDisponivelDTO(
        Long id,
        String titulo,
        String descricao,
        String categoria,
        int totalQuestoes,
        boolean jaRespondido,
        Double melhorPercentual,
        int tentativasUsadas,
        Integer maxTentativas,
        Integer tempoPorQuestao,
        boolean podeResponder,
        int xpMaximo) {
}
