package com.evolv.integracao.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Envelope da resposta de GET https://api.mymemory.translated.net/get.
 * Usada apenas internamente pelo TraducaoService - o front-end nunca ve
 * esta classe, ele so recebe o texto ja traduzido dentro de
 * QuestaoImportadaDTO/AlternativaImportadaDTO.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class MyMemoryResponse {

    @JsonProperty("responseData")
    private ResponseData responseData;

    @JsonProperty("responseStatus")
    private Object responseStatus;

    public ResponseData getResponseData() {
        return responseData;
    }

    public void setResponseData(ResponseData responseData) {
        this.responseData = responseData;
    }

    public Object getResponseStatus() {
        return responseStatus;
    }

    public void setResponseStatus(Object responseStatus) {
        this.responseStatus = responseStatus;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ResponseData {

        @JsonProperty("translatedText")
        private String translatedText;

        public String getTranslatedText() {
            return translatedText;
        }

        public void setTranslatedText(String translatedText) {
            this.translatedText = translatedText;
        }
    }
}
