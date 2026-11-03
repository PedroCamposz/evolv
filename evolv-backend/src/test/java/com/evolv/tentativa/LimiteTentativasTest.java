package com.evolv.tentativa;

import com.evolv.quiz.Quiz;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Regra do limite de tentativas definido pelo professor. Rodar com: mvn test */
class LimiteTentativasTest {

    @Test
    @DisplayName("Sem limite definido, o aluno sempre pode responder")
    void semLimite() {
        Quiz quiz = new Quiz();
        assertTrue(TentativaService.podeResponder(quiz, 0));
        assertTrue(TentativaService.podeResponder(quiz, 50));
    }

    @Test
    @DisplayName("Com limite 2, a terceira tentativa e bloqueada")
    void comLimite() {
        Quiz quiz = new Quiz();
        quiz.setMaxTentativas(2);
        assertTrue(TentativaService.podeResponder(quiz, 0));
        assertTrue(TentativaService.podeResponder(quiz, 1));
        assertFalse(TentativaService.podeResponder(quiz, 2));
    }
}
