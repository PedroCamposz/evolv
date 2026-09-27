package com.evolv.integracao;

import com.evolv.integracao.dto.CategoriaOpenTdbDTO;
import com.evolv.integracao.dto.QuestaoImportadaDTO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Integracao externa: importacao de questoes prontas da Open Trivia
 * Database (OpenTDB) para dentro do EVOLV.
 *
 * Acesso restrito a PROFESSOR/ADMIN via SecurityConfig
 * (.requestMatchers("/api/integracao/**").hasAnyRole("PROFESSOR", "ADMIN")).
 *
 * Este controller so devolve a previa das questoes - a gravacao no banco
 * acontece pelo endpoint ja existente POST /api/quizzes (QuizController),
 * reaproveitando a mesma estrutura de Quiz/Questao/Alternativa.
 */
@RestController
@RequestMapping("/api/integracao/opentdb")
public class OpenTdbController {

    private final OpenTdbService service;

    public OpenTdbController(OpenTdbService service) {
        this.service = service;
    }

    /**
     * GET /api/integracao/opentdb/questoes?quantidade=5&categoria=18&dificuldade=easy&tipo=multiple
     * Todos os parametros sao opcionais.
     */
    @GetMapping("/questoes")
    public List<QuestaoImportadaDTO> buscarQuestoes(
            @RequestParam(required = false) Integer quantidade,
            @RequestParam(required = false) Integer categoria,
            @RequestParam(required = false) String dificuldade,
            @RequestParam(required = false) String tipo) {
        return service.buscarQuestoes(quantidade, categoria, dificuldade, tipo);
    }

    /**
     * GET /api/integracao/opentdb/categorias
     * Lista as categorias oficiais da OpenTDB, para popular o <select> do
     * front-end (evita o professor precisar saber o ID numerico).
     */
    @GetMapping("/categorias")
    public List<CategoriaOpenTdbDTO> listarCategorias() {
        return service.listarCategorias();
    }
}
