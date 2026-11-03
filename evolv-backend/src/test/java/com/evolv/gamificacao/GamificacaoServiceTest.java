package com.evolv.gamificacao;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

/**
 * Testes unitarios das regras de gamificacao (RF09).
 * Rodar com: mvn test
 */
class GamificacaoServiceTest {

    @Test
    @DisplayName("Toda tentativa: 10 XP de participacao + 5 XP por acerto")
    void xpPorTentativa() {
        assertEquals(10, GamificacaoService.calcularXp(0));   // errou tudo: ainda ganha participacao
        assertEquals(30, GamificacaoService.calcularXp(4));   // 10 + 4*5
    }

    @Test
    @DisplayName("Inicio dos periodos do ranking (mensal, semestral, anual)")
    void periodosDoRanking() {
        LocalDate hoje = LocalDate.of(2026, 11, 3);
        assertEquals(LocalDate.of(2026, 11, 1).atStartOfDay(), GamificacaoService.inicioDoPeriodo("mensal", hoje));
        assertEquals(LocalDate.of(2026, 7, 1).atStartOfDay(), GamificacaoService.inicioDoPeriodo("semestral", hoje));
        assertEquals(LocalDate.of(2026, 1, 1).atStartOfDay(), GamificacaoService.inicioDoPeriodo("semestral", LocalDate.of(2026, 3, 10)));
        assertEquals(LocalDate.of(2026, 1, 1).atStartOfDay(), GamificacaoService.inicioDoPeriodo("anual", hoje));
        assertNull(GamificacaoService.inicioDoPeriodo("geral", hoje));
    }

    @Test
    @DisplayName("Nivel sobe a cada 100 XP, comecando no nivel 1")
    void nivel() {
        assertEquals(1, GamificacaoService.calcularNivel(0));
        assertEquals(1, GamificacaoService.calcularNivel(99));
        assertEquals(2, GamificacaoService.calcularNivel(100));
        assertEquals(5, GamificacaoService.calcularNivel(450));
    }

    @Test
    @DisplayName("XP dentro do nivel atual")
    void xpNoNivel() {
        assertEquals(0, GamificacaoService.xpNoNivelAtual(200));
        assertEquals(45, GamificacaoService.xpNoNivelAtual(145));
    }

    @Test
    @DisplayName("Percentual arredondado com 1 casa decimal")
    void arredondamento() {
        assertEquals(66.7, GamificacaoService.arredondar(200.0 / 3));
    }
}
