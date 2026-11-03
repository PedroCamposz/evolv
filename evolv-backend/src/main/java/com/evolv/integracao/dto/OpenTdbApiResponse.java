package com.evolv.integracao.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Envelope da resposta de GET https://opentdb.com/api.php.
 * response_code: 0 = sucesso; outros codigos indicam algum problema
 * (ver OpenTdbService.tratarCodigoResposta).
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class OpenTdbApiResponse {

    @JsonProperty("response_code")
    private int responseCode;

    private List<OpenTdbApiQuestion> results;

    public int getResponseCode() {
        return responseCode;
    }

    public void setResponseCode(int responseCode) {
        this.responseCode = responseCode;
    }

    public List<OpenTdbApiQuestion> getResults() {
        return results;
    }

    public void setResults(List<OpenTdbApiQuestion> results) {
        this.results = results;
    }
}
