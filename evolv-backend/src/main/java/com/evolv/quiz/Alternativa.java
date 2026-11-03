package com.evolv.quiz;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "alternativa")
public class Alternativa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String texto;

    @Column(nullable = false)
    private boolean correta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "questao_id")
    @JsonBackReference
    private Questao questao;

    public Alternativa() {
    }

    public Alternativa(String texto, boolean correta) {
        this.texto = texto;
        this.correta = correta;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTexto() {
        return texto;
    }

    public void setTexto(String texto) {
        this.texto = texto;
    }

    public boolean isCorreta() {
        return correta;
    }

    public void setCorreta(boolean correta) {
        this.correta = correta;
    }

    public Questao getQuestao() {
        return questao;
    }

    public void setQuestao(Questao questao) {
        this.questao = questao;
    }
}
