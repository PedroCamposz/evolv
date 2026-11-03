package com.evolv.tentativa;

import com.evolv.quiz.Quiz;
import com.evolv.usuario.Usuario;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * RF06/RF07/RF08 - Uma tentativa e cada vez que um aluno responde um quiz.
 * Guarda o resultado ja corrigido (acertos, percentual) e o XP que gerou,
 * alem das respostas questao por questao (usadas na analise de erros - RF11).
 */
@Entity
@Table(name = "tentativa")
public class Tentativa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "aluno_id", nullable = false)
    private Usuario aluno;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(nullable = false)
    private int totalQuestoes;

    @Column(nullable = false)
    private int acertos;

    /** Percentual de acertos de 0 a 100 (arredondado para 1 casa). */
    @Column(nullable = false)
    private double percentual;

    @Column(nullable = false)
    private int xpGanho;

    /** true quando e a primeira vez que o aluno conclui este quiz. */
    @Column(nullable = false)
    private boolean primeiraTentativa;

    @Column(nullable = false, updatable = false)
    private LocalDateTime concluidaEm = LocalDateTime.now();

    /** Tempo que o aluno levou para responder, em segundos (informado pelo front). */
    private Integer tempoSegundos;

    @OneToMany(mappedBy = "tentativa", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Resposta> respostas = new ArrayList<>();

    public Tentativa() {
    }

    public Tentativa(Usuario aluno, Quiz quiz) {
        this.aluno = aluno;
        this.quiz = quiz;
    }

    public void adicionarResposta(Resposta resposta) {
        respostas.add(resposta);
        resposta.setTentativa(this);
    }

    public Long getId() { return id; }
    public Usuario getAluno() { return aluno; }
    public Quiz getQuiz() { return quiz; }
    public int getTotalQuestoes() { return totalQuestoes; }
    public void setTotalQuestoes(int totalQuestoes) { this.totalQuestoes = totalQuestoes; }
    public int getAcertos() { return acertos; }
    public void setAcertos(int acertos) { this.acertos = acertos; }
    public double getPercentual() { return percentual; }
    public void setPercentual(double percentual) { this.percentual = percentual; }
    public int getXpGanho() { return xpGanho; }
    public void setXpGanho(int xpGanho) { this.xpGanho = xpGanho; }
    public boolean isPrimeiraTentativa() { return primeiraTentativa; }
    public void setPrimeiraTentativa(boolean primeiraTentativa) { this.primeiraTentativa = primeiraTentativa; }
    public LocalDateTime getConcluidaEm() { return concluidaEm; }
    public void setConcluidaEm(LocalDateTime concluidaEm) { this.concluidaEm = concluidaEm; }
    public List<Resposta> getRespostas() { return respostas; }
    public Integer getTempoSegundos() { return tempoSegundos; }
    public void setTempoSegundos(Integer tempoSegundos) { this.tempoSegundos = tempoSegundos; }
}
