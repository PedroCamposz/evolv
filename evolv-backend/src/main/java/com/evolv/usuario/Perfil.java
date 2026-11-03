package com.evolv.usuario;

/**
 * Perfis de acesso do sistema.
 * ALUNO: consulta categorias/quizzes, responde quizzes.
 * PROFESSOR: cria/edita/exclui categorias e quizzes.
 * ADMIN: tudo do professor + acesso aos logs de auditoria.
 */
public enum Perfil {
    ALUNO,
    PROFESSOR,
    ADMIN
}
