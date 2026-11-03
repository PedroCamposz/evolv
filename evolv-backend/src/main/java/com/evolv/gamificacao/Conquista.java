package com.evolv.gamificacao;

/**
 * RF09 - Conquistas disponiveis na plataforma e suas condicoes.
 * As condicoes sao verificadas em GamificacaoService.verificarConquistas
 * sempre que o aluno conclui uma tentativa.
 */
public enum Conquista {

    PRIMEIROS_PASSOS("Primeiros passos", "Concluir o primeiro quiz."),
    GABARITOU("Gabaritou!", "Acertar 100% das questões de um quiz."),
    DEDICADO("Dedicado", "Concluir 10 quizzes diferentes."),
    EM_EVOLUCAO("Em evolução", "Alcançar o nível 5.");

    private final String nome;
    private final String descricao;

    Conquista(String nome, String descricao) {
        this.nome = nome;
        this.descricao = descricao;
    }

    public String getNome() { return nome; }
    public String getDescricao() { return descricao; }
}
