package com.evolv.integracao.dto;

import java.util.List;

/**
 * Questao vinda da OpenTDB ja tratada para o professor visualizar na
 * previa: HTML entities decodificadas e alternativas embaralhadas (a
 * OpenTDB sempre manda a resposta correta separada das incorretas).
 *
 * O formato dos campos "enunciado" e "alternativas" e compativel com
 * QuestaoRequest/AlternativaRequest (usados na criacao normal de quiz),
 * entao o front-end consegue reaproveitar exatamente essa estrutura ao
 * montar o quiz, sem precisar de um endpoint de persistencia separado.
 */
public class QuestaoImportadaDTO {

    private final String enunciado;
    private final String categoriaOriginal;
    private final String dificuldade;
    private final String tipo;
    private final List<AlternativaImportadaDTO> alternativas;

    public QuestaoImportadaDTO(String enunciado, String categoriaOriginal, String dificuldade,
                                String tipo, List<AlternativaImportadaDTO> alternativas) {
        this.enunciado = enunciado;
        this.categoriaOriginal = categoriaOriginal;
        this.dificuldade = dificuldade;
        this.tipo = tipo;
        this.alternativas = alternativas;
    }

    public String getEnunciado() {
        return enunciado;
    }

    public String getCategoriaOriginal() {
        return categoriaOriginal;
    }

    public String getDificuldade() {
        return dificuldade;
    }

    public String getTipo() {
        return tipo;
    }

    public List<AlternativaImportadaDTO> getAlternativas() {
        return alternativas;
    }
}
