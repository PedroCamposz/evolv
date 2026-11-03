package com.evolv.usuario;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

/** Regras da senha temporaria gerada pelo administrador. Rodar com: mvn test */
class SenhaTemporariaTest {

    @Test
    @DisplayName("Senha gerada tem 10 caracteres sem os que confundem (0, O, 1, l, I)")
    void formatoDaSenha() {
        for (int i = 0; i < 50; i++) {
            String senha = AdminUsuarioController.gerarSenhaAleatoria();
            assertEquals(10, senha.length());
            assertFalse(senha.matches(".*[0O1lI].*"), senha);
        }
    }

    @Test
    @DisplayName("Senha temporaria vencida deixa de valer")
    void expiracao() {
        Usuario u = new Usuario("Teste", "t@t.com", "hash", Perfil.ALUNO);
        u.setSenhaTemporaria(true);
        u.setSenhaTemporariaExpiraEm(LocalDateTime.now().plusHours(1));
        assertFalse(u.senhaTemporariaExpirada());
        u.setSenhaTemporariaExpiraEm(LocalDateTime.now().minusMinutes(1));
        assertTrue(u.senhaTemporariaExpirada());
        u.setSenhaTemporaria(false);
        assertFalse(u.senhaTemporariaExpirada());
    }
}
