package com.evolv.tentativa;

import com.evolv.tentativa.dto.*;
import com.evolv.usuario.Usuario;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Rotas do aluno: quizzes disponiveis, responder, historico.
 * Restrito ao perfil ALUNO via SecurityConfig (/api/aluno/**).
 */
@RestController
@RequestMapping("/api/aluno")
public class TentativaController {

    private final TentativaService service;

    public TentativaController(TentativaService service) {
        this.service = service;
    }

    @GetMapping("/quizzes")
    public List<QuizDisponivelDTO> disponiveis(@AuthenticationPrincipal Usuario aluno) {
        return service.listarDisponiveis(aluno.getId());
    }

    @GetMapping("/quizzes/{quizId}")
    public QuizParaResponderDTO paraResponder(@AuthenticationPrincipal Usuario aluno, @PathVariable Long quizId) {
        return service.buscarParaResponder(aluno.getId(), quizId);
    }

    @PostMapping("/quizzes/{quizId}/tentativas")
    public ResponseEntity<ResultadoDTO> responder(@AuthenticationPrincipal Usuario aluno,
                                                  @PathVariable Long quizId,
                                                  @Valid @RequestBody TentativaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.registrar(aluno.getId(), quizId, request));
    }

    @GetMapping("/historico")
    public List<HistoricoItemDTO> historico(@AuthenticationPrincipal Usuario aluno) {
        return service.historico(aluno.getId());
    }
}
