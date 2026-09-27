package com.evolv.integracao.dto;

/**
 * Categoria da OpenTDB, ja com o nome decodificado (sem HTML entities),
 * usada para popular o <select> de categorias no front-end.
 */
public class CategoriaOpenTdbDTO {

    private final Integer id;
    private final String nome;

    public CategoriaOpenTdbDTO(Integer id, String nome) {
        this.id = id;
        this.nome = nome;
    }

    public Integer getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }
}
