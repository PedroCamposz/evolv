package com.evolv.quiz;

import com.evolv.quiz.dto.ConfiguracaoQuizRequest;
import com.evolv.quiz.dto.QuizRequest;
import com.evolv.quiz.dto.QuizResumoDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * RF04 - Criacao de quizzes (professor cria o quiz com questoes e
 * alternativas em uma unica requisicao).
 */
@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    private final QuizService service;

    public QuizController(QuizService service) {
        this.service = service;
    }

    @GetMapping
    public List<Quiz> listar() {
        return service.listarTodos();
    }

    /** Lista de quizzes com status e estatisticas (tela "Meus quizzes"). */
    @GetMapping("/resumo")
    public List<QuizResumoDTO> resumo() {
        return service.resumo();
    }

    @GetMapping("/{id}")
    public Quiz buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<Quiz> criar(@Valid @RequestBody QuizRequest request) {
        Quiz criado = service.criar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    /** RF05 - Disponibilizar ou recolher o quiz. Corpo: { "disponibilizado": true } */
    @PatchMapping("/{id}/disponibilizacao")
    public Quiz alterarDisponibilizacao(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        return service.alterarDisponibilizacao(id, Boolean.TRUE.equals(body.get("disponibilizado")));
    }

    /** Edita titulo, descricao e limite de tentativas. */
    @PutMapping("/{id}/configuracoes")
    public Quiz atualizarConfiguracoes(@PathVariable Long id, @Valid @RequestBody ConfiguracaoQuizRequest request) {
        return service.atualizarConfiguracoes(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
