package com.evolv.tentativa;

import com.evolv.quiz.Alternativa;
import com.evolv.quiz.Questao;
import jakarta.persistence.*;

/**
 * Resposta dada pelo aluno a uma questao dentro de uma tentativa.
 * O campo "correta" e gravado no momento da correcao (RF07), para que a
 * analise de erros (RF11) nao dependa de recalcular nada depois.
 */
@Entity
@Table(name = "resposta")
public class Resposta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tentativa_id", nullable = false)
    private Tentativa tentativa;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "questao_id", nullable = false)
    private Questao questao;

    /** null = tempo esgotado sem resposta (conta como erro). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alternativa_id")
    private Alternativa alternativaEscolhida;

    @Column(nullable = false)
    private boolean correta;

    public Resposta() {
    }

    public Resposta(Questao questao, Alternativa alternativaEscolhida) {
        this.questao = questao;
        this.alternativaEscolhida = alternativaEscolhida;
        this.correta = alternativaEscolhida != null && alternativaEscolhida.isCorreta();
    }

    public Long getId() { return id; }
    public Tentativa getTentativa() { return tentativa; }
    public void setTentativa(Tentativa tentativa) { this.tentativa = tentativa; }
    public Questao getQuestao() { return questao; }
    public Alternativa getAlternativaEscolhida() { return alternativaEscolhida; }
    public boolean isCorreta() { return correta; }
}
