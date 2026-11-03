package com.evolv.gamificacao;

import java.time.LocalDateTime;
import java.util.List;

public record PerfilGamificacaoDTO(
        String nome,
        String email,
        String perfil,
        int xpTotal,
        int nivel,
        int xpNoNivel,
        int xpPorNivel,
        Integer posicaoRanking,
        List<ConquistaStatusDTO> conquistas) {

    public record ConquistaStatusDTO(
            String codigo,
            String nome,
            String descricao,
            boolean obtida,
            LocalDateTime obtidaEm,
            int progresso,
            int meta) {
    }
}
