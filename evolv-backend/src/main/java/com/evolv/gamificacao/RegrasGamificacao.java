package com.evolv.gamificacao;

/**
 * RF09 - Regras de gamificacao do EVOLV, reunidas em um so lugar para
 * ficarem faceis de conferir, testar (GamificacaoServiceTest) e citar na
 * monografia.
 *
 *  - XP por participacao: 10 XP ao concluir um quiz (valoriza o esforco,
 *    mesmo quando o aluno erra tudo).
 *  - XP por acerto: +5 XP por questao correta.
 *  - Toda tentativa gera XP (participacao + acertos). Quem controla quantas
 *    vezes o aluno pode refazer um quiz e o professor, pelo limite de
 *    tentativas do quiz.
 *  - Nivel: a cada 100 XP o aluno sobe um nivel (nivel = XP / 100 + 1).
 *  - Ranking: alunos ativos ordenados por XP (geral = XP total; mensal,
 *    semestral e anual = XP ganho no mes, semestre ou ano atual); empate
 *    desempatado pela maior media de acertos e, depois, pelo nome.
 *  - Conquista "Dedicado": concluir 10 quizzes diferentes.
 */
public final class RegrasGamificacao {

    public static final int XP_PARTICIPACAO = 10;
    public static final int XP_POR_ACERTO = 5;
    public static final int XP_POR_NIVEL = 100;
    public static final int QUIZZES_PARA_DEDICADO = 10;
    public static final int NIVEL_EM_EVOLUCAO = 5;

    private RegrasGamificacao() {
    }
}
