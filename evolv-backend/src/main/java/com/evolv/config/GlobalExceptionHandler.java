package com.evolv.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Converte erros de validacao (@Valid), de autenticacao/autorizacao e
 * ResponseStatusException em um JSON simples e previsivel para o
 * front-end exibir na tela.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        Map<String, String> erros = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(erro ->
                erros.put(erro.getField(), erro.getDefaultMessage()));
        body.put("mensagem", "Dados inválidos.");
        body.put("erros", erros);
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatus(ResponseStatusException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("mensagem", ex.getReason());
        return ResponseEntity.status(ex.getStatusCode()).body(body);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("mensagem", "Você não tem permissão para realizar esta ação.");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthentication(AuthenticationException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("mensagem", "É necessário estar autenticado para acessar este recurso.");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    /** JSON mal formado ou valor invalido (ex.: perfil "XYZ") -> 400, nao 500. */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleNotReadable(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest().body(Map.of("mensagem", "Dados enviados em formato inválido."));
    }

    /** Parametro de tipo errado (ex.: /api/quizzes/abc) -> 400. */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return ResponseEntity.badRequest().body(Map.of("mensagem", "Parâmetro inválido: " + ex.getName() + "."));
    }

    /** Conflito no banco (ex.: dois cadastros simultaneos com o mesmo e-mail) -> 409. */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleIntegridade(DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("mensagem", "A operação conflita com dados já existentes."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        // Erros do proprio Spring (rota inexistente = 404, metodo errado = 405...)
        // ja trazem o codigo HTTP certo.
        if (ex instanceof ErrorResponse erro) {
            body.put("mensagem", erro.getStatusCode().value() == 404
                    ? "Recurso não encontrado." : "Requisição inválida.");
            return ResponseEntity.status(erro.getStatusCode()).body(body);
        }
        // Nao expoe detalhes internos para o usuario; o detalhe fica no log do servidor.
        log.error("Erro inesperado", ex);
        body.put("mensagem", "Erro interno. Tente novamente em instantes.");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
