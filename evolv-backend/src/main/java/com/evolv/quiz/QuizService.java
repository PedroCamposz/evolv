package com.evolv.quiz;

import com.evolv.categoria.Categoria;
import com.evolv.categoria.CategoriaRepository;
import com.evolv.quiz.dto.AlternativaRequest;
import com.evolv.quiz.dto.QuestaoRequest;
import com.evolv.quiz.dto.QuizRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final CategoriaRepository categoriaRepository;

    public QuizService(QuizRepository quizRepository, CategoriaRepository categoriaRepository) {
        this.quizRepository = quizRepository;
        this.categoriaRepository = categoriaRepository;
    }

    public List<Quiz> listarTodos() {
        return quizRepository.findAll();
    }

    public Quiz buscarPorId(Long id) {
        return quizRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Quiz não encontrado."));
    }

    /**
     * RF04 - Criacao de quizzes: monta o quiz com suas questoes e
     * alternativas em uma unica operacao (transacional via cascade),
     * validando as regras de negocio antes de persistir.
     */
    public Quiz criar(QuizRequest request) {
        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Categoria não encontrada."));

        validarRegrasDeNegocio(request);

        Quiz quiz = new Quiz();
        quiz.setTitulo(request.getTitulo());
        quiz.setDescricao(request.getDescricao());
        quiz.setCategoria(categoria);

        for (QuestaoRequest questaoRequest : request.getQuestoes()) {
            Questao questao = new Questao(questaoRequest.getEnunciado());
            for (AlternativaRequest alternativaRequest : questaoRequest.getAlternativas()) {
                questao.adicionarAlternativa(
                        new Alternativa(alternativaRequest.getTexto(), alternativaRequest.isCorreta()));
            }
            quiz.adicionarQuestao(questao);
        }

        return quizRepository.save(quiz);
    }

    public void excluir(Long id) {
        Quiz quiz = buscarPorId(id);
        quizRepository.delete(quiz);
    }

    private void validarRegrasDeNegocio(QuizRequest request) {
        for (int i = 0; i < request.getQuestoes().size(); i++) {
            QuestaoRequest questao = request.getQuestoes().get(i);
            long corretas = questao.getAlternativas().stream()
                    .filter(AlternativaRequest::isCorreta)
                    .count();

            if (corretas == 0) {
                throw new ResponseStatusException(BAD_REQUEST,
                        "A questão " + (i + 1) + " precisa ter uma alternativa correta.");
            }
            if (corretas > 1) {
                throw new ResponseStatusException(BAD_REQUEST,
                        "A questão " + (i + 1) + " deve ter apenas uma alternativa correta.");
            }
        }
    }
}
