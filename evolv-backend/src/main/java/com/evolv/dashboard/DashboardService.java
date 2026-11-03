package com.evolv.dashboard;

import com.evolv.auditoria.LogAuditoria;
import com.evolv.auditoria.LogAuditoriaRepository;
import com.evolv.gamificacao.GamificacaoService;
import com.evolv.gamificacao.PerfilGamificacaoDTO;
import com.evolv.gamificacao.RankingItemDTO;
import com.evolv.quiz.Questao;
import com.evolv.quiz.QuizRepository;
import com.evolv.tentativa.Resposta;
import com.evolv.tentativa.RespostaRepository;
import com.evolv.tentativa.Tentativa;
import com.evolv.tentativa.TentativaRepository;
import com.evolv.tentativa.TentativaService;
import com.evolv.tentativa.dto.QuizDisponivelDTO;
import com.evolv.usuario.Perfil;
import com.evolv.usuario.Usuario;
import com.evolv.usuario.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

import static com.evolv.gamificacao.GamificacaoService.arredondar;

/**
 * RF10 - Dashboards (um para o aluno, outro para o professor/admin) e
 * RF11 - Analise de erros (questoes e categorias com mais erros).
 *
 * Todos os numeros sao calculados a partir das tentativas e respostas
 * realmente gravadas no banco.
 */
@Service
public class DashboardService {

    private static final DateTimeFormatter DIA = DateTimeFormatter.ofPattern("dd/MM");

    private final TentativaRepository tentativaRepository;
    private final RespostaRepository respostaRepository;
    private final QuizRepository quizRepository;
    private final UsuarioRepository usuarioRepository;
    private final GamificacaoService gamificacaoService;
    private final TentativaService tentativaService;
    private final LogAuditoriaRepository logAuditoriaRepository;

    public DashboardService(TentativaRepository tentativaRepository, RespostaRepository respostaRepository,
                            QuizRepository quizRepository, UsuarioRepository usuarioRepository,
                            GamificacaoService gamificacaoService, TentativaService tentativaService,
                            LogAuditoriaRepository logAuditoriaRepository) {
        this.logAuditoriaRepository = logAuditoriaRepository;
        this.tentativaRepository = tentativaRepository;
        this.respostaRepository = respostaRepository;
        this.quizRepository = quizRepository;
        this.usuarioRepository = usuarioRepository;
        this.gamificacaoService = gamificacaoService;
        this.tentativaService = tentativaService;
    }

    // ------------------------------------------------------------------ aluno

    @Transactional(readOnly = true)
    public Map<String, Object> dashboardAluno(Usuario aluno) {
        List<Tentativa> tentativas = tentativaRepository.findByAlunoIdOrderByConcluidaEmAsc(aluno.getId());
        PerfilGamificacaoDTO perfil = gamificacaoService.perfil(aluno);

        double media = tentativas.stream().mapToDouble(Tentativa::getPercentual).average().orElse(0);
        long quizzesDistintos = tentativas.stream().map(t -> t.getQuiz().getId()).distinct().count();

        // Evolucao: percentual das ultimas 10 tentativas, em ordem cronologica.
        List<Map<String, Object>> evolucao = new ArrayList<>();
        int inicio = Math.max(0, tentativas.size() - 10);
        for (int i = inicio; i < tentativas.size(); i++) {
            Tentativa t = tentativas.get(i);
            evolucao.add(linha("rotulo", "#" + (i + 1), "quiz", t.getQuiz().getTitulo(),
                    "percentual", t.getPercentual(), "data", t.getConcluidaEm().format(DIA)));
        }

        // Desempenho por categoria a partir das respostas do proprio aluno.
        List<Map<String, Object>> porCategoria = agruparPorCategoria(respostaRepository.findByTentativaAlunoId(aluno.getId()));

        String maiorDificuldade = porCategoria.stream()
                .min(Comparator.comparingDouble(m -> (double) m.get("percentualAcerto")))
                .map(m -> (String) m.get("categoria")).orElse(null);

        List<QuizDisponivelDTO> pendentes = tentativaService.listarDisponiveis(aluno.getId()).stream()
                .filter(q -> !q.jaRespondido()).toList();

        List<RankingItemDTO> ranking = gamificacaoService.ranking();

        Map<String, Object> resposta = new LinkedHashMap<>();
        resposta.put("bigNumbers", linha(
                "xpTotal", perfil.xpTotal(),
                "nivel", perfil.nivel(),
                "xpNoNivel", perfil.xpNoNivel(),
                "xpPorNivel", perfil.xpPorNivel(),
                "quizzesConcluidos", quizzesDistintos,
                "tentativas", tentativas.size(),
                "mediaAcertos", arredondar(media),
                "melhorPercentual", tentativas.stream().mapToDouble(Tentativa::getPercentual).max().orElse(0),
                "posicaoRanking", perfil.posicaoRanking(),
                "totalAlunosRanking", ranking.size(),
                "quizzesPendentes", pendentes.size(),
                "maiorDificuldade", maiorDificuldade));
        resposta.put("evolucao", evolucao);
        resposta.put("desempenhoPorCategoria", porCategoria);
        resposta.put("quizzesPendentes", pendentes.stream().limit(5).toList());
        resposta.put("rankingTop5", ranking.stream().limit(5).toList());
        resposta.put("conquistas", perfil.conquistas());
        return resposta;
    }

    // -------------------------------------------------------- professor/admin

    @Transactional(readOnly = true)
    public Map<String, Object> dashboardProfessor() {
        List<Resposta> respostas = respostaRepository.findAll();
        List<Tentativa> tentativas = tentativaRepository.findAll();
        Double media = tentativaRepository.mediaGeralPercentual();

        // Tentativas por dia nos ultimos 14 dias (inclui dias sem tentativa, com 0).
        LocalDate hoje = LocalDate.now();
        Map<LocalDate, Long> porDia = new TreeMap<>();
        for (int i = 13; i >= 0; i--) porDia.put(hoje.minusDays(i), 0L);
        for (Tentativa t : tentativas) {
            porDia.computeIfPresent(t.getConcluidaEm().toLocalDate(), (d, n) -> n + 1);
        }
        List<Map<String, Object>> atividade = new ArrayList<>();
        porDia.forEach((d, n) -> atividade.add(linha("data", d.format(DIA), "tentativas", n)));

        Map<String, Object> resposta = new LinkedHashMap<>();
        resposta.put("bigNumbers", linha(
                "quizzesCriados", quizRepository.count(),
                "quizzesDisponiveis", quizRepository.countByDisponibilizadoTrue(),
                "tentativas", tentativas.size(),
                "alunosAtivos", usuarioRepository.countByPerfilAndAtivoTrue(Perfil.ALUNO),
                "alunosQueResponderam", tentativas.stream().map(Tentativa::getAluno)
                        .filter(a -> a.isAtivo() && a.getPerfil() == Perfil.ALUNO).map(Usuario::getId).distinct().count(),
                "mediaAcertos", media == null ? 0.0 : arredondar(media),
                "totalRespostas", respostas.size()));
        resposta.put("atividadeUltimos14Dias", atividade);
        resposta.put("desempenhoPorCategoria", agruparPorCategoria(respostas));
        resposta.put("questoesComMaisErros", questoesComMaisErros(respostas, 10));
        resposta.put("resultadosRecentes", tentativaRepository.findTop8ByOrderByConcluidaEmDesc().stream()
                .map(t -> linha("tentativaId", t.getId(), "aluno", t.getAluno().getNome(), "quiz", t.getQuiz().getTitulo(),
                        "categoria", t.getQuiz().getCategoria().getNome(), "percentual", t.getPercentual(),
                        "concluidaEm", t.getConcluidaEm()))
                .toList());
        resposta.put("rankingTop5", gamificacaoService.ranking().stream().limit(5).toList());
        return resposta;
    }

    /** Dashboard do administrador: usuarios, uso da plataforma e atividades recentes (auditoria). */
    @Transactional(readOnly = true)
    public Map<String, Object> dashboardAdmin() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        List<Tentativa> tentativas = tentativaRepository.findAll();
        List<LogAuditoria> logs = logAuditoriaRepository.findAllByOrderByDataHoraDesc();
        LocalDate hoje = LocalDate.now();

        Map<Perfil, Long> porPerfil = new EnumMap<>(Perfil.class);
        for (Perfil p : Perfil.values()) porPerfil.put(p, 0L);
        usuarios.forEach(u -> porPerfil.merge(u.getPerfil(), 1L, Long::sum));

        // Acessos (logins) e respostas (tentativas) por dia, nos ultimos 30 dias.
        Map<LocalDate, long[]> porDia = new TreeMap<>();
        for (int i = 29; i >= 0; i--) porDia.put(hoje.minusDays(i), new long[2]);
        logs.stream().filter(l -> "LOGIN".equals(l.getAcao()))
                .forEach(l -> { long[] d = porDia.get(l.getDataHora().toLocalDate()); if (d != null) d[0]++; });
        tentativas.forEach(t -> { long[] d = porDia.get(t.getConcluidaEm().toLocalDate()); if (d != null) d[1]++; });
        List<Map<String, Object>> atividade = new ArrayList<>();
        porDia.forEach((d, v) -> atividade.add(linha("data", d.format(DIA), "acessos", v[0], "respostas", v[1])));

        Map<String, Object> resposta = new LinkedHashMap<>();
        resposta.put("bigNumbers", linha(
                "totalUsuarios", usuarios.size(),
                "alunosAtivos", usuarios.stream().filter(u -> u.getPerfil() == Perfil.ALUNO && u.isAtivo()).count(),
                "professores", porPerfil.get(Perfil.PROFESSOR),
                "quizzesAtivos", quizRepository.countByDisponibilizadoTrue(),
                "realizadosHoje", tentativas.stream().filter(t -> t.getConcluidaEm().toLocalDate().equals(hoje)).count()));
        resposta.put("distribuicaoPerfis", linha(
                "ALUNO", porPerfil.get(Perfil.ALUNO),
                "PROFESSOR", porPerfil.get(Perfil.PROFESSOR),
                "ADMIN", porPerfil.get(Perfil.ADMIN)));
        resposta.put("atividade30Dias", atividade);
        resposta.put("atividadesRecentes", logs.stream().limit(8)
                .map(l -> linha("acao", l.getAcao(), "entidade", l.getEntidade(), "usuario", l.getUsuarioEmail(),
                        "detalhes", l.getDetalhes(), "dataHora", l.getDataHora()))
                .toList());
        return resposta;
    }

    /**
     * RF11 - Para cada questao respondida, conta acertos e erros e ordena
     * pela maior taxa de erro (desempate: maior numero absoluto de erros).
     */
    List<Map<String, Object>> questoesComMaisErros(List<Resposta> respostas, int limite) {
        Map<Long, int[]> contagem = new HashMap<>();   // [respostas, erros]
        Map<Long, Questao> questoes = new HashMap<>();
        for (Resposta r : respostas) {
            Questao q = r.getQuestao();
            questoes.putIfAbsent(q.getId(), q);
            int[] c = contagem.computeIfAbsent(q.getId(), k -> new int[2]);
            c[0]++;
            if (!r.isCorreta()) c[1]++;
        }
        List<Map<String, Object>> lista = new ArrayList<>();
        contagem.forEach((id, c) -> {
            if (c[1] == 0) return; // so interessa o que teve erro
            Questao q = questoes.get(id);
            lista.add(linha(
                    "questaoId", id,
                    "enunciado", q.getEnunciado(),
                    "quiz", q.getQuiz().getTitulo(),
                    "categoria", q.getQuiz().getCategoria().getNome(),
                    "respostas", c[0],
                    "erros", c[1],
                    "percentualErro", arredondar(c[1] * 100.0 / c[0])));
        });
        lista.sort(Comparator
                .comparingDouble((Map<String, Object> m) -> (double) m.get("percentualErro")).reversed()
                .thenComparing(m -> -(int) m.get("erros")));
        return lista.stream().limit(limite).toList();
    }

    /** Acertos e erros agrupados por categoria (ordenado do pior para o melhor). */
    private List<Map<String, Object>> agruparPorCategoria(List<Resposta> respostas) {
        Map<String, int[]> porCategoria = new TreeMap<>();  // [respostas, acertos]
        for (Resposta r : respostas) {
            String cat = r.getQuestao().getQuiz().getCategoria().getNome();
            int[] c = porCategoria.computeIfAbsent(cat, k -> new int[2]);
            c[0]++;
            if (r.isCorreta()) c[1]++;
        }
        List<Map<String, Object>> lista = new ArrayList<>();
        porCategoria.forEach((cat, c) -> lista.add(linha(
                "categoria", cat,
                "respostas", c[0],
                "acertos", c[1],
                "erros", c[0] - c[1],
                "percentualAcerto", arredondar(c[1] * 100.0 / c[0]))));
        lista.sort(Comparator.comparingDouble(m -> (double) m.get("percentualAcerto")));
        return lista;
    }

    private static Map<String, Object> linha(Object... chavesEValores) {
        Map<String, Object> m = new LinkedHashMap<>();
        for (int i = 0; i < chavesEValores.length; i += 2) {
            m.put((String) chavesEValores[i], chavesEValores[i + 1]);
        }
        return m;
    }
}
