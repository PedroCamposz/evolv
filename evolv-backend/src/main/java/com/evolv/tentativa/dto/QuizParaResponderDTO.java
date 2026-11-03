package com.evolv.tentativa.dto;

import java.util.List;

/**
 * Versao do quiz enviada ao aluno: SEM o gabarito (o campo "correta" das
 * alternativas nao e exposto), para que a resposta certa nao possa ser
 * descoberta pelo navegador antes da correcao. Inclui as informacoes da
 * tela de instrucoes (tentativas e XP possivel).
 */
public record QuizParaResponderDTO(
        Long id,
        String titulo,
        String descricao,
        String categoria,
        int tentativasUsadas,
        Integer maxTentativas,
        Integer tempoPorQuestao,
        boolean podeResponder,
        int xpMaximo,
        List<QuestaoDTO> questoes) {

    public record QuestaoDTO(Long id, String enunciado, List<AlternativaDTO> alternativas) {
    }

    public record AlternativaDTO(Long id, String texto) {
    }
}
