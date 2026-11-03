package com.evolv.gamificacao;

import com.evolv.tentativa.Tentativa;
import com.evolv.tentativa.TentativaRepository;
import com.evolv.usuario.Perfil;
import com.evolv.usuario.Usuario;
import com.evolv.usuario.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static com.evolv.gamificacao.RegrasGamificacao.*;

/**
 * RF09 - Aplica as regras de XP, nivel, ranking e conquistas.
 */
@Service
public class GamificacaoService {

    private final ConquistaUsuarioRepository conquistaRepository;
    private final TentativaRepository tentativaRepository;
    private final UsuarioRepository usuarioRepository;

    public GamificacaoService(ConquistaUsuarioRepository conquistaRepository,
                              TentativaRepository tentativaRepository,
                              UsuarioRepository usuarioRepository) {
        this.conquistaRepository = conquistaRepository;
        this.tentativaRepository = tentativaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // ---------- Regras puras (sem banco) - testadas em GamificacaoServiceTest ----------

    /**
     * XP ganho em uma tentativa: participacao + acertos. Vale para toda
     * tentativa; o limite de tentativas definido pelo professor e o que evita
     * repeticoes sem fim.
     */
    public static int calcularXp(int acertos) {
        return XP_PARTICIPACAO + Math.max(0, acertos) * XP_POR_ACERTO;
    }

    /** Nivel a partir do XP total: comeca no nivel 1 e sobe a cada 100 XP. */
    public static int calcularNivel(int xpTotal) {
        return Math.max(0, xpTotal) / XP_POR_NIVEL + 1;
    }

    /** Quanto XP o aluno ja tem dentro do nivel atual (0 a 99). */
    public static int xpNoNivelAtual(int xpTotal) {
        return Math.max(0, xpTotal) % XP_POR_NIVEL;
    }

    // ---------- Regras com banco ----------

    /**
     * Verifica e concede as conquistas cujas condicoes foram atingidas.
     * Devolve apenas as conquistas NOVAS (para mostrar na tela de resultado).
     */
    public List<Conquista> verificarConquistas(Usuario aluno, double percentualUltimaTentativa) {
        long tentativas = tentativaRepository.countByAlunoId(aluno.getId());
        long quizzesDistintos = tentativaRepository.countQuizzesDistintosPorAluno(aluno.getId());
        int nivel = calcularNivel(aluno.getXpTotal());

        List<Conquista> atingidas = new ArrayList<>();
        if (tentativas >= 1) atingidas.add(Conquista.PRIMEIROS_PASSOS);
        if (percentualUltimaTentativa >= 100.0) atingidas.add(Conquista.GABARITOU);
        if (quizzesDistintos >= QUIZZES_PARA_DEDICADO) atingidas.add(Conquista.DEDICADO);
        if (nivel >= NIVEL_EM_EVOLUCAO) atingidas.add(Conquista.EM_EVOLUCAO);

        List<Conquista> novas = new ArrayList<>();
        for (Conquista c : atingidas) {
            if (!conquistaRepository.existsByUsuarioIdAndConquista(aluno.getId(), c)) {
                conquistaRepository.save(new ConquistaUsuario(aluno, c));
                novas.add(c);
            }
        }
        return novas;
    }

    /** Ranking geral (XP total). */
    @Transactional(readOnly = true)
    public List<RankingItemDTO> ranking() {
        return ranking("geral");
    }

    /**
     * Inicio do periodo do ranking: mensal = dia 1 do mes atual; semestral =
     * 1/jan ou 1/jul; anual = 1/jan. "geral" (ou qualquer outro valor) = sem
     * inicio, usa o XP total.
     */
    public static LocalDateTime inicioDoPeriodo(String periodo, LocalDate hoje) {
        return switch (periodo == null ? "geral" : periodo.toLowerCase()) {
            case "mensal" -> hoje.withDayOfMonth(1).atStartOfDay();
            case "semestral" -> LocalDate.of(hoje.getYear(), hoje.getMonthValue() <= 6 ? 1 : 7, 1).atStartOfDay();
            case "anual" -> LocalDate.of(hoje.getYear(), 1, 1).atStartOfDay();
            default -> null;
        };
    }

    /** Ranking de alunos ativos: XP desc, media de acertos desc, nome asc. */
    @Transactional(readOnly = true)
    public List<RankingItemDTO> ranking(String periodo) {
        LocalDateTime desde = inicioDoPeriodo(periodo, LocalDate.now());
        boolean geral = desde == null;

        Map<Long, int[]> xpPeriodo = new HashMap<>();   // [xp, tentativas]
        Map<Long, double[]> somaPercentual = new HashMap<>(); // [soma, qtd]
        for (Tentativa t : tentativaRepository.findAll()) {
            if (desde != null && t.getConcluidaEm().isBefore(desde)) continue;
            Long id = t.getAluno().getId();
            int[] x = xpPeriodo.computeIfAbsent(id, k -> new int[2]);
            x[0] += t.getXpGanho();
            x[1]++;
            double[] p = somaPercentual.computeIfAbsent(id, k -> new double[2]);
            p[0] += t.getPercentual();
            p[1]++;
        }

        Map<Long, Integer> xpUsado = new HashMap<>();
        Map<Long, Double> mediaUsada = new HashMap<>();
        List<Usuario> alunos = new ArrayList<>(usuarioRepository.findByPerfilAndAtivoTrue(Perfil.ALUNO));
        for (Usuario u : alunos) {
            int[] x = xpPeriodo.get(u.getId());
            xpUsado.put(u.getId(), geral ? u.getXpTotal() : (x == null ? 0 : x[0]));
            double[] p = somaPercentual.get(u.getId());
            mediaUsada.put(u.getId(), p == null ? 0.0 : p[0] / p[1]);
        }
        alunos.sort(Comparator
                .comparingInt((Usuario u) -> xpUsado.get(u.getId())).reversed()
                .thenComparingDouble(u -> -mediaUsada.get(u.getId()))
                .thenComparing(Usuario::getNome, String.CASE_INSENSITIVE_ORDER));

        List<RankingItemDTO> ranking = new ArrayList<>();
        int posicao = 1;
        for (Usuario u : alunos) {
            int[] x = xpPeriodo.get(u.getId());
            ranking.add(new RankingItemDTO(posicao++, u.getId(), u.getNome(), xpUsado.get(u.getId()),
                    calcularNivel(u.getXpTotal()), arredondar(mediaUsada.get(u.getId())), x == null ? 0 : x[1]));
        }
        return ranking;
    }

    /** Perfil de gamificacao do usuario: XP, nivel e todas as conquistas (obtidas ou nao). */
    @Transactional(readOnly = true)
    public PerfilGamificacaoDTO perfil(Usuario usuario) {
        Map<Conquista, ConquistaUsuario> obtidas = new EnumMap<>(Conquista.class);
        for (ConquistaUsuario cu : conquistaRepository.findByUsuarioId(usuario.getId())) {
            obtidas.put(cu.getConquista(), cu);
        }

        // Progresso de cada conquista (para a barra de progresso das bloqueadas).
        List<Tentativa> minhas = tentativaRepository.findByAlunoIdOrderByConcluidaEmAsc(usuario.getId());
        int tentativas = minhas.size();
        int quizzesDistintos = (int) minhas.stream().map(t -> t.getQuiz().getId()).distinct().count();
        boolean gabaritou = minhas.stream().anyMatch(t -> t.getPercentual() >= 100.0);
        int nivelAtual = calcularNivel(usuario.getXpTotal());

        List<PerfilGamificacaoDTO.ConquistaStatusDTO> conquistas = new ArrayList<>();
        for (Conquista c : Conquista.values()) {
            ConquistaUsuario cu = obtidas.get(c);
            int meta;
            int atual;
            switch (c) {
                case PRIMEIROS_PASSOS -> { meta = 1; atual = Math.min(tentativas, 1); }
                case GABARITOU -> { meta = 1; atual = gabaritou ? 1 : 0; }
                case DEDICADO -> { meta = QUIZZES_PARA_DEDICADO; atual = Math.min(quizzesDistintos, meta); }
                default -> { meta = NIVEL_EM_EVOLUCAO; atual = Math.min(nivelAtual, meta); }
            }
            if (cu != null) atual = meta;
            conquistas.add(new PerfilGamificacaoDTO.ConquistaStatusDTO(
                    c.name(), c.getNome(), c.getDescricao(), cu != null, cu == null ? null : cu.getObtidaEm(),
                    atual, meta));
        }

        Integer posicao = null;
        if (usuario.getPerfil() == Perfil.ALUNO) {
            posicao = ranking().stream()
                    .filter(r -> r.usuarioId().equals(usuario.getId()))
                    .map(RankingItemDTO::posicao)
                    .findFirst().orElse(null);
        }

        int xp = usuario.getXpTotal();
        return new PerfilGamificacaoDTO(usuario.getNome(), usuario.getEmail(), usuario.getPerfil().name(),
                xp, calcularNivel(xp), xpNoNivelAtual(xp), XP_POR_NIVEL, posicao, conquistas);
    }

    public static double arredondar(double valor) {
        return Math.round(valor * 10.0) / 10.0;
    }
}
