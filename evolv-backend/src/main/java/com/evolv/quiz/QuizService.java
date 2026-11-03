package com.evolv.quiz;

import com.evolv.auditoria.AuditoriaService;
import com.evolv.categoria.Categoria;
import com.evolv.categoria.CategoriaRepository;
import com.evolv.quiz.dto.AlternativaRequest;
import com.evolv.quiz.dto.QuestaoRequest;
import com.evolv.quiz.dto.QuizRequest;
import com.evolv.gamificacao.GamificacaoService;
import com.evolv.quiz.dto.ConfiguracaoQuizRequest;
import com.evolv.quiz.dto.QuizResumoDTO;
import com.evolv.tentativa.Tentativa;
import com.evolv.tentativa.TentativaRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final CategoriaRepository categoriaRepository;
    private final AuditoriaService auditoriaService;
    private final TentativaRepository tentativaRepository;

    public QuizService(QuizRepository quizRepository, CategoriaRepository categoriaRepository,
                        AuditoriaService auditoriaService, TentativaRepository tentativaRepository) {
        this.quizRepository = quizRepository;
        this.categoriaRepository = categoriaRepository;
        this.auditoriaService = auditoriaService;
        this.tentativaRepository = tentativaRepository;
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
        quiz.setTitulo(request.getTitulo().trim());
        quiz.setDescricao(request.getDescricao() == null ? null : request.getDescricao().trim());
        quiz.setCategoria(categoria);
        quiz.setMaxTentativas(request.getMaxTentativas());
        quiz.setTempoPorQuestao(request.getTempoPorQuestao());

        for (QuestaoRequest questaoRequest : request.getQuestoes()) {
            Questao questao = new Questao(questaoRequest.getEnunciado().trim());
            if (questaoRequest.getOrigem() != null && !questaoRequest.getOrigem().isBlank()) {
                questao.setOrigem(questaoRequest.getOrigem().toUpperCase());
            }
            for (AlternativaRequest alternativaRequest : questaoRequest.getAlternativas()) {
                questao.adicionarAlternativa(
                        new Alternativa(alternativaRequest.getTexto(), alternativaRequest.isCorreta()));
            }
            quiz.adicionarQuestao(questao);
        }

        quiz = quizRepository.save(quiz);
        auditoriaService.registrar("CRIAR", "Quiz", quiz.getId(), quiz.getTitulo());
        return quiz;
    }

    /**
     * RF05 - Disponibilizacao: libera (ou recolhe) o quiz para os alunos.
     * Regra: so pode ser disponibilizado se tiver questoes validas, ou seja,
     * cada questao com pelo menos 2 alternativas e exatamente 1 correta.
     */
    public Quiz alterarDisponibilizacao(Long id, boolean disponibilizar) {
        Quiz quiz = buscarPorId(id);
        if (disponibilizar) {
            if (quiz.getQuestoes().isEmpty()) {
                throw new ResponseStatusException(BAD_REQUEST, "O quiz precisa ter pelo menos 1 questão para ser disponibilizado.");
            }
            for (Questao questao : quiz.getQuestoes()) {
                long corretas = questao.getAlternativas().stream().filter(Alternativa::isCorreta).count();
                if (questao.getAlternativas().size() < 2 || corretas != 1) {
                    throw new ResponseStatusException(BAD_REQUEST,
                            "A questão \"" + questao.getEnunciado() + "\" precisa de pelo menos 2 alternativas e exatamente 1 correta.");
                }
            }
        }
        quiz.setDisponibilizado(disponibilizar);
        quiz = quizRepository.save(quiz);
        auditoriaService.registrar(disponibilizar ? "DISPONIBILIZAR" : "RECOLHER", "Quiz", quiz.getId(), quiz.getTitulo());
        return quiz;
    }

    /** Edita titulo, descricao e limite de tentativas (as questoes nao mudam). */
    public Quiz atualizarConfiguracoes(Long id, ConfiguracaoQuizRequest request) {
        Quiz quiz = buscarPorId(id);
        quiz.setTitulo(request.getTitulo().trim());
        quiz.setDescricao(request.getDescricao());
        quiz.setMaxTentativas(request.getMaxTentativas());
        quiz.setTempoPorQuestao(request.getTempoPorQuestao());
        quiz = quizRepository.save(quiz);
        auditoriaService.registrar("ATUALIZAR", "Quiz", quiz.getId(), quiz.getTitulo()
                + " (tentativas: " + (quiz.getMaxTentativas() == null ? "ilimitadas" : quiz.getMaxTentativas())
                + "; tempo por questão: " + (quiz.getTempoPorQuestao() == null ? "sem limite" : quiz.getTempoPorQuestao() + "s") + ")");
        return quiz;
    }

    /** Lista de quizzes com status e estatisticas, para a tela do professor. */
    @Transactional(readOnly = true)
    public List<QuizResumoDTO> resumo() {
        Map<Long, List<Tentativa>> porQuiz = tentativaRepository.findAll().stream()
                .collect(Collectors.groupingBy(t -> t.getQuiz().getId()));
        return quizRepository.findAll().stream()
                .sorted(Comparator.comparing(Quiz::getCriadoEm).reversed())
                .map(q -> {
                    List<Tentativa> ts = porQuiz.getOrDefault(q.getId(), List.of());
                    String status = q.isDisponibilizado() ? "PUBLICADO" : (ts.isEmpty() ? "RASCUNHO" : "ENCERRADO");
                    Double media = ts.isEmpty() ? null
                            : GamificacaoService.arredondar(ts.stream().mapToDouble(Tentativa::getPercentual).average().orElse(0));
                    long alunos = ts.stream().map(t -> t.getAluno().getId()).distinct().count();
                    return new QuizResumoDTO(q.getId(), q.getTitulo(), q.getDescricao(), q.getCategoria().getId(),
                            q.getCategoria().getNome(), q.getQuestoes().size(), status, q.getMaxTentativas(), q.getTempoPorQuestao(),
                            alunos, ts.size(), media, q.getCriadoEm());
                })
                .toList();
    }

    public void excluir(Long id) {
        Quiz quiz = buscarPorId(id);
        try {
            quizRepository.delete(quiz);
            quizRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(CONFLICT,
                    "Este quiz já foi respondido por alunos e não pode ser excluído, para não apagar o histórico. "
                            + "Recolha o quiz (deixe-o indisponível) em vez de excluir.");
        }
        auditoriaService.registrar("EXCLUIR", "Quiz", id, quiz.getTitulo());
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
