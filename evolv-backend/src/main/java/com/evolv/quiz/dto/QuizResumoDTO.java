package com.evolv.quiz.dto;

import java.time.LocalDateTime;

/**
 * Cartao de quiz na tela "Meus quizzes" do professor.
 * status: PUBLICADO (disponivel), RASCUNHO (nunca respondido e indisponivel)
 * ou ENCERRADO (ja respondido e recolhido pelo professor).
 */
public record QuizResumoDTO(
        Long id,
        String titulo,
        String descricao,
        Long categoriaId,
        String categoria,
        int totalQuestoes,
        String status,
        Integer maxTentativas,
        Integer tempoPorQuestao,
        long alunosConcluiram,
        long tentativas,
        Double mediaPercentual,
        LocalDateTime criadoEm) {
}
