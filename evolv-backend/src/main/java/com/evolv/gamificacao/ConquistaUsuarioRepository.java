package com.evolv.gamificacao;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConquistaUsuarioRepository extends JpaRepository<ConquistaUsuario, Long> {

    List<ConquistaUsuario> findByUsuarioId(Long usuarioId);

    boolean existsByUsuarioIdAndConquista(Long usuarioId, Conquista conquista);
}
