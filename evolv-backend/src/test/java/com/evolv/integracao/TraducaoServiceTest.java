package com.evolv.integracao;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

/** Categorias da OpenTDB traduzidas sem depender da API externa. Rodar com: mvn test */
class TraducaoServiceTest {

    private final TraducaoService service = new TraducaoService("");

    @Test
    @DisplayName("Categorias conhecidas da OpenTDB usam a traducao fixa")
    void categoriasFixas() {
        assertEquals("Política", service.traduzirCategoria("Politics"));
        assertEquals("Ciência: Computação", service.traduzirCategoria("Science: Computers"));
        assertEquals("Entretenimento: Anime e Mangá", service.traduzirCategoria("Entertainment: Japanese Anime & Manga"));
    }

    @Test
    @DisplayName("Texto vazio nao chama a API")
    void textoVazio() {
        assertEquals("", service.traduzirParaPtBr(""));
    }
}
