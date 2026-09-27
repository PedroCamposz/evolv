package com.evolv.integracao.dto;

/**
 * Alternativa de uma questao importada da OpenTDB, com o texto ja
 * decodificado (sem HTML entities) e pronta para ser exibida/selecionada
 * no front-end.
 */
public class AlternativaImportadaDTO {

    private final String texto;
    private final boolean correta;

    public AlternativaImportadaDTO(String texto, boolean correta) {
        this.texto = texto;
        this.correta = correta;
    }

    public String getTexto() {
        return texto;
    }

    public boolean isCorreta() {
        return correta;
    }
}
