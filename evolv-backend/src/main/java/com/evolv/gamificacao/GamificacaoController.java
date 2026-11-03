package com.evolv.gamificacao;

import com.evolv.usuario.Usuario;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** RF09 - Consulta de ranking e do perfil de gamificacao (qualquer usuario logado). */
@RestController
@RequestMapping("/api/gamificacao")
public class GamificacaoController {

    private final GamificacaoService service;

    public GamificacaoController(GamificacaoService service) {
        this.service = service;
    }

    @GetMapping("/ranking")
    public List<RankingItemDTO> ranking(@RequestParam(defaultValue = "geral") String periodo) {
        return service.ranking(periodo);
    }

    @GetMapping("/meu-perfil")
    public PerfilGamificacaoDTO meuPerfil(@AuthenticationPrincipal Usuario usuario) {
        return service.perfil(usuario);
    }
}
