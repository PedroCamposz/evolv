package com.evolv.integracao;

import com.evolv.integracao.dto.MyMemoryResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.HtmlUtils;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

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
 *
 * Limite da API gratuita: a MyMemory limita a quantidade de texto traduzido
 * por dia para cada endereco IP. Em hospedagens compartilhadas (ex.: Render)
 * varios sites usam o mesmo IP e o limite acaba rapido. Por isso:
 *  - os nomes das categorias da OpenTDB tem traducao fixa (nao usam a API);
 *  - traducoes ja feitas ficam guardadas em memoria e nao sao repetidas;
 *  - informando um e-mail em evolv.traducao.email (variavel de ambiente
 *    EVOLV_TRADUCAO_EMAIL), a MyMemory aumenta o limite diario.
 */
@Service
public class TraducaoService {

    private static final String BASE_URL = "https://api.mymemory.translated.net";
    private static final String PAR_IDIOMAS = "en|pt-BR";
    private static final int TIMEOUT_MS = 6000;
    private static final int TAMANHO_MAXIMO_CACHE = 5000;

    /** Nomes oficiais das categorias da OpenTDB, traduzidos sem usar a API. */
    private static final Map<String, String> CATEGORIAS = Map.ofEntries(
            Map.entry("General Knowledge", "Conhecimentos Gerais"),
            Map.entry("Entertainment: Books", "Entretenimento: Livros"),
            Map.entry("Entertainment: Film", "Entretenimento: Filmes"),
            Map.entry("Entertainment: Music", "Entretenimento: Música"),
            Map.entry("Entertainment: Musicals & Theatres", "Entretenimento: Musicais e Teatro"),
            Map.entry("Entertainment: Television", "Entretenimento: Televisão"),
            Map.entry("Entertainment: Video Games", "Entretenimento: Videogames"),
            Map.entry("Entertainment: Board Games", "Entretenimento: Jogos de Tabuleiro"),
            Map.entry("Science & Nature", "Ciência e Natureza"),
            Map.entry("Science: Computers", "Ciência: Computação"),
            Map.entry("Science: Mathematics", "Ciência: Matemática"),
            Map.entry("Mythology", "Mitologia"),
            Map.entry("Sports", "Esportes"),
            Map.entry("Geography", "Geografia"),
            Map.entry("History", "História"),
            Map.entry("Politics", "Política"),
            Map.entry("Art", "Arte"),
            Map.entry("Celebrities", "Celebridades"),
            Map.entry("Animals", "Animais"),
            Map.entry("Vehicles", "Veículos"),
            Map.entry("Entertainment: Comics", "Entretenimento: Quadrinhos"),
            Map.entry("Science: Gadgets", "Ciência: Aparelhos Eletrônicos"),
            Map.entry("Entertainment: Japanese Anime & Manga", "Entretenimento: Anime e Mangá"),
            Map.entry("Entertainment: Cartoon & Animations", "Entretenimento: Desenhos Animados"));

    private final RestClient restClient;
    private final String email;
    private final Map<String, String> cache = new ConcurrentHashMap<>();

    public TraducaoService(@Value("${evolv.traducao.email:}") String email) {
        this.email = email == null ? "" : email.trim();
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
        String jaTraduzido = cache.get(texto);
        if (jaTraduzido != null) {
            return jaTraduzido;
        }

        try {
            MyMemoryResponse resposta = restClient.get()
                    .uri(uriBuilder -> {
                        uriBuilder.path("/get")
                                .queryParam("q", texto)
                                .queryParam("langpair", PAR_IDIOMAS);
                        if (!email.isEmpty()) {
                            uriBuilder.queryParam("de", email);
                        }
                        return uriBuilder.build();
                    })
                    .retrieve()
                    .body(MyMemoryResponse.class);

            // A MyMemory responde 200 mesmo quando o limite diario acabou,
            // indicando o problema em responseStatus e colocando um aviso no
            // lugar da traducao. Nesse caso, mantemos o texto original.
            if (resposta == null || resposta.getResponseData() == null
                    || !"200".equals(String.valueOf(resposta.getResponseStatus()))) {
                return texto;
            }
            String traduzido = resposta.getResponseData().getTranslatedText();
            if (traduzido == null || traduzido.isBlank() || pareceAviso(traduzido)) {
                return texto;
            }
            traduzido = HtmlUtils.htmlUnescape(traduzido);
            if (cache.size() < TAMANHO_MAXIMO_CACHE) {
                cache.put(texto, traduzido);
            }
            return traduzido;
        } catch (Exception e) {
            // Falha silenciosa e proposital (rede, timeout, limite diario da
            // API gratuita etc.): preferimos importar a questao em ingles a
            // quebrar a importacao inteira por causa da traducao.
            return texto;
        }
    }

    /**
     * Traduz o nome de uma categoria da OpenTDB. Usa a traducao fixa quando
     * a categoria e conhecida, e a API so para nomes novos.
     */
    public String traduzirCategoria(String nome) {
        if (nome == null) {
            return null;
        }
        String fixo = CATEGORIAS.get(nome.trim());
        return fixo != null ? fixo : traduzirParaPtBr(nome);
    }

    /** Mensagens que a MyMemory devolve no lugar da traducao quando ha problema. */
    private static boolean pareceAviso(String texto) {
        String t = texto.toUpperCase();
        return t.contains("MYMEMORY WARNING") || t.contains("QUERY LENGTH LIMIT")
                || t.contains("INVALID LANGUAGE PAIR") || t.contains("PLEASE SELECT TWO DISTINCT LANGUAGES");
    }
}
