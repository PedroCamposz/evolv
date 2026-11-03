package com.evolv.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

/**
 * Traduz os bloqueios do Spring Security (nao autenticado / sem permissao)
 * para o mesmo formato de JSON usado pelo resto da API, em vez da resposta
 * padrao (vazia) do Spring Security.
 */
@Component
public class SecurityResponseHandler implements AuthenticationEntryPoint, AccessDeniedHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                          AuthenticationException authException) throws IOException {
        escrever(response, 401, "É necessário estar autenticado para acessar este recurso.");
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                        AccessDeniedException accessDeniedException) throws IOException {
        escrever(response, 403, "Você não tem permissão para realizar esta ação.");
    }

    private void escrever(HttpServletResponse response, int status, String mensagem) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(objectMapper.writeValueAsString(Map.of("mensagem", mensagem)));
    }
}
