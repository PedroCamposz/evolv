package com.evolv.tentativa;

import com.evolv.auditoria.AuditoriaService;
import com.evolv.gamificacao.Conquista;
import com.evolv.gamificacao.GamificacaoService;
import com.evolv.quiz.Alternativa;
import com.evolv.quiz.Questao;
import com.evolv.quiz.Quiz;
import com.evolv.quiz.QuizRepository;
import com.evolv.tentativa.dto.*;
import com.evolv.usuario.Usuario;
import com.evolv.usuario.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.*;

/**
 * RF06 (execucao), RF07 (correcao automatica) e RF08 (historico).
 *
 * Fluxo de registrar(): valida as respostas -> corrige comparando com o
 * gabarito -> calcula acertos e percentual -> grava a tentativa e as
 * respostas -> aplica XP/nivel/conquistas (RF09) -> registra auditoria ->
 * devolve o resultado com o gabarito comentado.
 */
@Service
public class TentativaService {

    private final QuizRepository quizRepository;
    private final TentativaRepository tentativaRepository;
    private final UsuarioRepository usuarioRepository;
    private final GamificacaoService gamificacaoService;
    private final AuditoriaService auditoriaService;

    public TentativaService(QuizRepository quizRepository,
                            TentativaRepository tentativaRepository,
                            UsuarioRepository usuarioRepository,
                            GamificacaoService gamificacaoService,
                            AuditoriaService auditoriaService) {
        this.quizRepository = quizRepository;
        this.tentativaRepository = tentativaRepository;
        this.usuarioRepository = usuarioRepository;
        this.gamificacaoService = gamificacaoService;
        this.auditoriaService = auditoriaService;
    }

    /** RF06 - Lista os quizzes disponibilizados, com tentativas usadas e melhor resultado. */
    @Transactional(readOnly = true)
    public List<QuizDisponivelDTO> listarDisponiveis(Long alunoId) {
        Map<Long, Double> melhorPorQuiz = new HashMap<>();
        Map<Long, Integer> usadasPorQuiz = new HashMap<>();
        for (Tentativa t : tentativaRepository.findByAlunoIdOrderByConcluidaEmDesc(alunoId)) {
            melhorPorQuiz.merge(t.getQuiz().getId(), t.getPercentual(), Math::max);
            usadasPorQuiz.merge(t.getQuiz().getId(), 1, Integer::sum);
        }
        return quizRepository.findByDisponibilizadoTrueOrderByCriadoEmDesc().stream()
                .map(q -> {
                    int usadas = usadasPorQuiz.getOrDefault(q.getId(), 0);
                    return new QuizDisponivelDTO(q.getId(), q.getTitulo(), q.getDescricao(),
                            q.getCategoria().getNome(), q.getQuestoes().size(),
                            usadas > 0, melhorPorQuiz.get(q.getId()), usadas, q.getMaxTentativas(),
                            q.getTempoPorQuestao(), podeResponder(q, usadas), xpMaximo(q));
                })
                .toList();
    }

    /** RF06 - Devolve o quiz para o aluno responder, sem o gabarito. */
    @Transactional(readOnly = true)
    public QuizParaResponderDTO buscarParaResponder(Long alunoId, Long quizId) {
        Quiz quiz = buscarQuizDisponivel(quizId);
        int usadas = (int) tentativaRepository.countByAlunoIdAndQuizId(alunoId, quizId);
        List<QuizParaResponderDTO.QuestaoDTO> questoes = quiz.getQuestoes().stream()
                .map(q -> new QuizParaResponderDTO.QuestaoDTO(q.getId(), q.getEnunciado(),
                        q.getAlternativas().stream()
                                .map(a -> new QuizParaResponderDTO.AlternativaDTO(a.getId(), a.getTexto()))
                                .toList()))
                .toList();
        return new QuizParaResponderDTO(quiz.getId(), quiz.getTitulo(), quiz.getDescricao(),
                quiz.getCategoria().getNome(), usadas, quiz.getMaxTentativas(), quiz.getTempoPorQuestao(),
                podeResponder(quiz, usadas), xpMaximo(quiz), questoes);
    }

    /** Regra: o aluno so pode responder enquanto nao atingir o limite definido pelo professor. */
    public static boolean podeResponder(Quiz quiz, int usadas) {
        return quiz.getMaxTentativas() == null || usadas < quiz.getMaxTentativas();
    }

    private static int xpMaximo(Quiz quiz) {
        return GamificacaoService.calcularXp(quiz.getQuestoes().size());
    }

    /** RF06 + RF07 + RF09 - Conclui a tentativa, corrige e aplica a gamificacao. */
    @Transactional
    public ResultadoDTO registrar(Long alunoId, Long quizId, TentativaRequest request) {
        Usuario aluno = usuarioRepository.findById(alunoId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Usuário não encontrado."));
        Quiz quiz = buscarQuizDisponivel(quizId);

        Map<Long, Questao> questoesDoQuiz = quiz.getQuestoes().stream()
                .collect(Collectors.toMap(Questao::getId, Function.identity()));

        // Regra: cada questao aparece uma unica vez e todas precisam vir na tentativa.
        // Sem resposta (alternativaId nulo) so e aceito em quiz com tempo por
        // questao, quando o tempo acabou - e conta como erro.
        boolean temTempo = quiz.getTempoPorQuestao() != null;
        Map<Long, Long> escolhas = new LinkedHashMap<>();
        for (RespostaRequest r : request.getRespostas()) {
            if (!questoesDoQuiz.containsKey(r.getQuestaoId())) {
                throw new ResponseStatusException(BAD_REQUEST, "Questão não pertence a este quiz.");
            }
            if (escolhas.containsKey(r.getQuestaoId())) {
                throw new ResponseStatusException(BAD_REQUEST, "Cada questão deve ser respondida apenas uma vez.");
            }
            escolhas.put(r.getQuestaoId(), r.getAlternativaId());
        }
        long respondidas = escolhas.values().stream().filter(java.util.Objects::nonNull).count();
        if (escolhas.size() != questoesDoQuiz.size() || (!temTempo && respondidas != questoesDoQuiz.size())) {
            throw new ResponseStatusException(BAD_REQUEST,
                    "Responda todas as questões antes de concluir (" + respondidas + " de "
                            + questoesDoQuiz.size() + " respondidas).");
        }

        // Regra: limite de tentativas definido pelo professor.
        int usadas = (int) tentativaRepository.countByAlunoIdAndQuizId(alunoId, quizId);
        if (!podeResponder(quiz, usadas)) {
            throw new ResponseStatusException(CONFLICT,
                    "Você já usou todas as " + quiz.getMaxTentativas() + " tentativa(s) permitidas para este quiz.");
        }
        boolean primeira = usadas == 0;
        Tentativa tentativa = new Tentativa(aluno, quiz);
        List<ResultadoDTO.CorrecaoQuestaoDTO> correcao = new ArrayList<>();
        int acertos = 0;

        // RF07 - Correcao: compara a alternativa escolhida com o gabarito.
        for (Questao questao : quiz.getQuestoes()) {
            Long alternativaId = escolhas.get(questao.getId());
            Alternativa escolhida = alternativaId == null ? null : questao.getAlternativas().stream()
                    .filter(a -> a.getId().equals(alternativaId))
                    .findFirst()
                    .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST,
                            "Alternativa inválida para a questão \"" + questao.getEnunciado() + "\"."));
            Resposta resposta = new Resposta(questao, escolhida);
            tentativa.adicionarResposta(resposta);
            if (resposta.isCorreta()) acertos++;

            String textoCorreta = questao.getAlternativas().stream()
                    .filter(Alternativa::isCorreta).map(Alternativa::getTexto).findFirst().orElse("-");
            correcao.add(new ResultadoDTO.CorrecaoQuestaoDTO(questao.getId(), questao.getEnunciado(),
                    escolhida == null ? null : escolhida.getTexto(), textoCorreta, resposta.isCorreta()));
        }

        int total = quiz.getQuestoes().size();
        double percentual = GamificacaoService.arredondar(acertos * 100.0 / total);
        int xp = GamificacaoService.calcularXp(acertos);

        tentativa.setTotalQuestoes(total);
        tentativa.setAcertos(acertos);
        tentativa.setPercentual(percentual);
        tentativa.setXpGanho(xp);
        tentativa.setPrimeiraTentativa(primeira);
        tentativa.setTempoSegundos(request.getTempoSegundos());
        tentativa = tentativaRepository.save(tentativa);

        // RF09 - Gamificacao: XP, nivel e conquistas.
        int nivelAntes = GamificacaoService.calcularNivel(aluno.getXpTotal());
        aluno.setXpTotal(aluno.getXpTotal() + xp);
        usuarioRepository.save(aluno);
        int nivelDepois = GamificacaoService.calcularNivel(aluno.getXpTotal());
        List<Conquista> novas = gamificacaoService.verificarConquistas(aluno, percentual);

        auditoriaService.registrar("CONCLUIR_QUIZ", "Tentativa", tentativa.getId(),
                "Quiz \"" + quiz.getTitulo() + "\": " + acertos + "/" + total + " acertos, +" + xp + " XP");

        return new ResultadoDTO(tentativa.getId(), quiz.getId(), quiz.getTitulo(), quiz.getCategoria().getNome(),
                total, acertos, percentual, xp, primeira, aluno.getXpTotal(), nivelDepois,
                nivelDepois > nivelAntes,
                novas.stream().map(c -> new ResultadoDTO.ConquistaDTO(c.name(), c.getNome(), c.getDescricao())).toList(),
                tentativa.getConcluidaEm(), tentativa.getTempoSegundos(),
                quiz.getMaxTentativas() == null ? null : quiz.getMaxTentativas() - (usadas + 1),
                correcao);
    }

    /** RF08 - Historico de tentativas do aluno (mais recentes primeiro). */
    @Transactional(readOnly = true)
    public List<HistoricoItemDTO> historico(Long alunoId) {
        return tentativaRepository.findByAlunoIdOrderByConcluidaEmDesc(alunoId).stream()
                .map(t -> new HistoricoItemDTO(t.getId(), t.getQuiz().getId(), t.getQuiz().getTitulo(),
                        t.getQuiz().getCategoria().getNome(), t.getAcertos(), t.getTotalQuestoes(),
                        t.getPercentual(), t.getXpGanho(), t.isPrimeiraTentativa(), t.getConcluidaEm(),
                        t.getTempoSegundos()))
                .toList();
    }

    private Quiz buscarQuizDisponivel(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Quiz não encontrado."));
        if (!quiz.isDisponibilizado()) {
            throw new ResponseStatusException(FORBIDDEN, "Este quiz ainda não foi disponibilizado pelo professor.");
        }
        return quiz;
    }
}
