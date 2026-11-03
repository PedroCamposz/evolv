package com.evolv.tentativa.dto;

import java.time.LocalDateTime;

public record HistoricoItemDTO(
        Long tentativaId,
        Long quizId,
        String quizTitulo,
        String categoria,
        int acertos,
        int totalQuestoes,
        double percentual,
        int xpGanho,
        boolean primeiraTentativa,
        LocalDateTime concluidaEm,
        Integer tempoSegundos) {
}
