package com.evolv.gamificacao;

public record RankingItemDTO(
        int posicao,
        Long usuarioId,
        String nome,
        int xpTotal,
        int nivel,
        double mediaAcertos,
        long tentativas) {
}
