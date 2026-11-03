package com.evolv.usuario;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<Usuario> findByPerfilAndAtivoTrue(Perfil perfil);

    long countByPerfilAndAtivoTrue(Perfil perfil);

    List<Usuario> findAllByOrderByNomeAsc();
}
