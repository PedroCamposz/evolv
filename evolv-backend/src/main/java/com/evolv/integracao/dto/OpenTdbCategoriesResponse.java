package com.evolv.integracao.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Envelope da resposta de GET https://opentdb.com/api_category.php.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class OpenTdbCategoriesResponse {

    @JsonProperty("trivia_categories")
    private List<OpenTdbCategoryItem> categorias;

    public List<OpenTdbCategoryItem> getCategorias() {
        return categorias;
    }

    public void setCategorias(List<OpenTdbCategoryItem> categorias) {
        this.categorias = categorias;
    }
}
