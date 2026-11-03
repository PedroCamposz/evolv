package com.evolv.tentativa.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Resultado de uma tentativa ja corrigida (RF07), com o que mudou na
 * gamificacao (RF09) e o gabarito comentado questao por questao.
 */
public record ResultadoDTO(
        Long tentativaId,
        Long quizId,
        String quizTitulo,
        String categoria,
        int totalQuestoes,
        int acertos,
        double percentual,
        int xpGanho,
        boolean primeiraTentativa,
        int xpTotal,
        int nivel,
        boolean subiuDeNivel,
        List<ConquistaDTO> novasConquistas,
        LocalDateTime concluidaEm,
        Integer tempoSegundos,
        Integer tentativasRestantes,
        List<CorrecaoQuestaoDTO> correcao) {

    public record CorrecaoQuestaoDTO(
            Long questaoId,
            String enunciado,
            String respostaEscolhida,
            String respostaCorreta,
            boolean acertou) {
    }

    public record ConquistaDTO(String codigo, String nome, String descricao) {
    }
}
