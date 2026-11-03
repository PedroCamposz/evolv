package com.evolv.integracao;

import com.evolv.auditoria.AuditoriaService;
import com.evolv.integracao.dto.AlternativaImportadaDTO;
import com.evolv.integracao.dto.CategoriaOpenTdbDTO;
import com.evolv.integracao.dto.OpenTdbApiQuestion;
import com.evolv.integracao.dto.OpenTdbApiResponse;
import com.evolv.integracao.dto.OpenTdbCategoriesResponse;
import com.evolv.integracao.dto.OpenTdbCategoryItem;
import com.evolv.integracao.dto.QuestaoImportadaDTO;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.HtmlUtils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Integracao com a Open Trivia Database (https://opentdb.com).
 *
 * Responsavel por: montar a consulta, chamar a API externa, tratar erros
 * (rede indisponivel, parametros invalidos, poucos resultados) e converter
 * a resposta bruta (que vem com HTML entities e a resposta correta
 * separada das incorretas) num formato pronto para o front-end exibir e
 * reaproveitar na criacao de quiz.
 *
 * Importante: quem fala com a OpenTDB e sempre o Spring Boot. O React
 * nunca acessa https://opentdb.com diretamente.
 */
@Service
public class OpenTdbService {

    private static final String BASE_URL = "https://opentdb.com";
    private static final int QUANTIDADE_PADRAO = 5;
    private static final int QUANTIDADE_MINIMA = 1;
    private static final int QUANTIDADE_MAXIMA = 50;
    private static final List<String> DIFICULDADES_VALIDAS = List.of("easy", "medium", "hard");
    private static final List<String> TIPOS_VALIDOS = List.of("multiple", "boolean");

    private final RestClient restClient;
    private final AuditoriaService auditoriaService;
    private final TraducaoService traducaoService;

    // Cache simples em memoria: as ~24 categorias da OpenTDB praticamente
    // nunca mudam, entao evitamos re-traduzir a lista inteira toda vez que
    // o professor abre o modal de importação.
    private volatile List<CategoriaOpenTdbDTO> categoriasCache;

    public OpenTdbService(AuditoriaService auditoriaService, TraducaoService traducaoService) {
        this.restClient = RestClient.builder().baseUrl(BASE_URL).build();
        this.auditoriaService = auditoriaService;
        this.traducaoService = traducaoService;
    }

    /**
     * Busca questoes na OpenTDB de acordo com os filtros informados.
     * Nao salva nada no banco - apenas devolve a previa para o professor
     * escolher o que importar (RF de importacao, passo de previa).
     */
    public List<QuestaoImportadaDTO> buscarQuestoes(Integer quantidade, Integer categoriaId,
                                                      String dificuldade, String tipo) {
        int qtd = validarQuantidade(quantidade);
        String dificuldadeNormalizada = validarDificuldade(dificuldade);
        String tipoNormalizado = validarTipo(tipo);

        String uri = montarUri(qtd, categoriaId, dificuldadeNormalizada, tipoNormalizado);

        OpenTdbApiResponse resposta;
        try {
            resposta = restClient.get().uri(uri).retrieve().body(OpenTdbApiResponse.class);
        } catch (RestClientException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Não foi possível conectar à Open Trivia Database no momento. "
                            + "Verifique sua conexão e tente novamente em instantes.");
        }

        if (resposta == null || resposta.getResults() == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "A Open Trivia Database não retornou uma resposta válida.");
        }

        tratarCodigoResposta(resposta.getResponseCode());

        // Cache simples por categoria: varias questoes do mesmo lote costumam
        // repetir a categoria, entao evitamos traduzir o mesmo nome varias vezes.
        Map<String, String> categoriasTraduzidas = new HashMap<>();

        List<QuestaoImportadaDTO> questoes = new ArrayList<>();
        for (OpenTdbApiQuestion bruta : resposta.getResults()) {
            questoes.add(converter(bruta, categoriasTraduzidas));
        }

        auditoriaService.registrar("BUSCAR_EXTERNO", "Questao", null,
                questoes.size() + " questão(ões) buscada(s) na OpenTDB (categoria="
                        + categoriaId + ", dificuldade=" + dificuldadeNormalizada
                        + ", tipo=" + tipoNormalizado + ").");

        return questoes;
    }

    /**
     * Lista as categorias oficiais da OpenTDB, ja traduzidas para
     * portugues (Brasil), para popular o filtro no front-end (evita o
     * professor ter que digitar um ID numerico ou ler os nomes em ingles).
     * Resultado fica em cache em memoria (a lista de categorias da OpenTDB
     * e praticamente estatica).
     */
    public List<CategoriaOpenTdbDTO> listarCategorias() {
        if (categoriasCache != null) {
            return categoriasCache;
        }

        OpenTdbCategoriesResponse resposta;
        try {
            resposta = restClient.get().uri("/api_category.php").retrieve()
                    .body(OpenTdbCategoriesResponse.class);
        } catch (RestClientException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Não foi possível carregar as categorias da Open Trivia Database no momento.");
        }

        if (resposta == null || resposta.getCategorias() == null) {
            return Collections.emptyList();
        }

        List<CategoriaOpenTdbDTO> categorias = new ArrayList<>();
        for (OpenTdbCategoryItem item : resposta.getCategorias()) {
            String nomeOriginal = HtmlUtils.htmlUnescape(item.getName());
            String nomeTraduzido = traducaoService.traduzirParaPtBr(nomeOriginal);
            categorias.add(new CategoriaOpenTdbDTO(item.getId(), nomeTraduzido));
        }

        categoriasCache = categorias;
        return categorias;
    }

    private int validarQuantidade(Integer quantidade) {
        int qtd = quantidade == null ? QUANTIDADE_PADRAO : quantidade;
        if (qtd < QUANTIDADE_MINIMA || qtd > QUANTIDADE_MAXIMA) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "A quantidade de questões deve estar entre " + QUANTIDADE_MINIMA
                            + " e " + QUANTIDADE_MAXIMA + " (limite da OpenTDB).");
        }
        return qtd;
    }

    private String validarDificuldade(String dificuldade) {
        if (dificuldade == null || dificuldade.isBlank()) {
            return null;
        }
        String normalizada = dificuldade.trim().toLowerCase();
        if (!DIFICULDADES_VALIDAS.contains(normalizada)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Dificuldade inválida. Use easy, medium ou hard.");
        }
        return normalizada;
    }

    private String validarTipo(String tipo) {
        if (tipo == null || tipo.isBlank()) {
            return null;
        }
        String normalizado = tipo.trim().toLowerCase();
        if (!TIPOS_VALIDOS.contains(normalizado)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Tipo inválido. Use multiple (múltipla escolha) ou boolean (verdadeiro/falso).");
        }
        return normalizado;
    }

    private String montarUri(int quantidade, Integer categoriaId, String dificuldade, String tipo) {
        StringBuilder uri = new StringBuilder("/api.php?amount=").append(quantidade);
        if (categoriaId != null) {
            uri.append("&category=").append(categoriaId);
        }
        if (dificuldade != null) {
            uri.append("&difficulty=").append(dificuldade);
        }
        if (tipo != null) {
            uri.append("&type=").append(tipo);
        }
        return uri.toString();
    }

    /**
     * A OpenTDB nunca retorna erro HTTP - ela sempre responde 200 com um
     * "response_code" indicando o resultado real da consulta.
     * https://opentdb.com/api_config.php
     */
    private void tratarCodigoResposta(int codigo) {
        switch (codigo) {
            case 0 -> {
                // sucesso
            }
            case 1 -> throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Não há questões suficientes na OpenTDB para os filtros escolhidos. "
                            + "Tente reduzir a quantidade ou usar outra categoria/dificuldade.");
            case 2 -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Parâmetros inválidos enviados à Open Trivia Database.");
            case 3, 4 -> throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Sessão de consulta à OpenTDB expirada. Tente buscar novamente.");
            default -> throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "A Open Trivia Database retornou um erro inesperado (código " + codigo + ").");
        }
    }

    /**
     * Decodifica HTML entities (a OpenTDB manda "&quot;", "&#039;" etc.),
     * traduz o conteudo de ingles para portugues (Brasil) via
     * TraducaoService e embaralha as alternativas, ja que a API sempre
     * manda a correta separada das incorretas.
     */
    private QuestaoImportadaDTO converter(OpenTdbApiQuestion bruta, Map<String, String> categoriasTraduzidas) {
        String enunciadoOriginal = HtmlUtils.htmlUnescape(bruta.getQuestion());
        String enunciado = traducaoService.traduzirParaPtBr(enunciadoOriginal);

        String categoriaOriginal = HtmlUtils.htmlUnescape(bruta.getCategory());
        String categoriaTraduzida = categoriasTraduzidas.computeIfAbsent(
                categoriaOriginal, traducaoService::traduzirParaPtBr);

        String respostaCorretaOriginal = HtmlUtils.htmlUnescape(bruta.getCorrectAnswer());
        String respostaCorreta = traducaoService.traduzirParaPtBr(respostaCorretaOriginal);

        List<AlternativaImportadaDTO> alternativas = new ArrayList<>();
        alternativas.add(new AlternativaImportadaDTO(respostaCorreta, true));
        if (bruta.getIncorrectAnswers() != null) {
            for (String incorreta : bruta.getIncorrectAnswers()) {
                String incorretaOriginal = HtmlUtils.htmlUnescape(incorreta);
                alternativas.add(new AlternativaImportadaDTO(
                        traducaoService.traduzirParaPtBr(incorretaOriginal), false));
            }
        }
        Collections.shuffle(alternativas);

        return new QuestaoImportadaDTO(
                enunciado,
                categoriaTraduzida,
                bruta.getDifficulty(),
                bruta.getType(),
                alternativas);
    }
}
