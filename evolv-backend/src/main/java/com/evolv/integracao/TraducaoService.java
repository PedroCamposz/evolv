package com.evolv.integracao;

import com.evolv.integracao.dto.MyMemoryResponse;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.HtmlUtils;

/**
 * Traduz textos curtos de ingles para portugues (Brasil) usando a
 * MyMemory Translation API (https://mymemory.translated.net) - publica,
 * gratuita e sem necessidade de chave de API.
 *
 * A OpenTDB so tem conteudo em ingles, entao esta traducao acontece
 * automaticamente ao importar questoes (RF de importacao), sempre dentro
 * do Spring Boot: o React nunca fala com o servico de traducao.
 *
 * Se a traducao falhar por qualquer motivo (indisponibilidade, limite de
 * uso diario da API gratuita, timeout etc.), o texto original em ingles e
 * devolvido - a importacao nunca deve quebrar por causa da traducao, so
 * "degradar" para o idioma original.
 */
@Service
public class TraducaoService {

    private static final String BASE_URL = "https://api.mymemory.translated.net";
    private static final String PAR_IDIOMAS = "en|pt-BR";
    private static final int TIMEOUT_MS = 4000;

    private final RestClient restClient;

    public TraducaoService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(TIMEOUT_MS);
        factory.setReadTimeout(TIMEOUT_MS);

        this.restClient = RestClient.builder()
                .baseUrl(BASE_URL)
                .requestFactory(factory)
                .build();
    }

    /**
     * Traduz um texto curto (pergunta ou alternativa) de ingles para
     * portugues do Brasil. Nunca lanca excecao: em caso de erro, devolve o
     * texto original recebido.
     */
    public String traduzirParaPtBr(String texto) {
        if (texto == null || texto.isBlank()) {
            return texto;
        }

        try {
            MyMemoryResponse resposta = restClient.get()
                    .uri(uriBuilder -> uriBuilder.path("/get")
                            .queryParam("q", texto)
                            .queryParam("langpair", PAR_IDIOMAS)
                            .build())
                    .retrieve()
                    .body(MyMemoryResponse.class);

            String traduzido = resposta == null || resposta.getResponseData() == null
                    ? null
                    : resposta.getResponseData().getTranslatedText();

            if (traduzido == null || traduzido.isBlank()) {
                return texto;
            }
            return HtmlUtils.htmlUnescape(traduzido);
        } catch (Exception e) {
            // Falha silenciosa e proposital (rede, timeout, limite diario da
            // API gratuita etc.): preferimos importar a questao em ingles a
            // quebrar a importacao inteira por causa da traducao.
            return texto;
        }
    }
}
