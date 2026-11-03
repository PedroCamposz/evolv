package com.evolv.dashboard;

import com.evolv.usuario.Usuario;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * RF10 - Dashboards. /aluno e restrito ao ALUNO; /professor ao
 * PROFESSOR e ADMIN (ver SecurityConfig).
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService service;

    public DashboardController(DashboardService service) {
        this.service = service;
    }

    @GetMapping("/aluno")
    public Map<String, Object> aluno(@AuthenticationPrincipal Usuario aluno) {
        return service.dashboardAluno(aluno);
    }

    @GetMapping("/admin")
    public Map<String, Object> admin() {
        return service.dashboardAdmin();
    }

    @GetMapping("/professor")
    public Map<String, Object> professor() {
        return service.dashboardProfessor();
    }
}
