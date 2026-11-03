package com.evolv.tentativa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TentativaRepository extends JpaRepository<Tentativa, Long> {

    List<Tentativa> findByAlunoIdOrderByConcluidaEmDesc(Long alunoId);

    List<Tentativa> findByAlunoIdOrderByConcluidaEmAsc(Long alunoId);

    boolean existsByAlunoIdAndQuizId(Long alunoId, Long quizId);

    long countByAlunoId(Long alunoId);

    long countByQuizId(Long quizId);

    long countByAlunoIdAndQuizId(Long alunoId, Long quizId);

    List<Tentativa> findTop8ByOrderByConcluidaEmDesc();

    List<Tentativa> findByConcluidaEmAfter(LocalDateTime data);

    /** Media de percentual e quantidade de tentativas por aluno (usado no ranking). */
    @Query("select t.aluno.id, avg(t.percentual), count(t) from Tentativa t group by t.aluno.id")
    List<Object[]> estatisticasPorAluno();

    @Query("select count(distinct t.quiz.id) from Tentativa t where t.aluno.id = :alunoId")
    long countQuizzesDistintosPorAluno(@Param("alunoId") Long alunoId);

    @Query("select avg(t.percentual) from Tentativa t")
    Double mediaGeralPercentual();

    @Query("select count(distinct t.aluno.id) from Tentativa t")
    long countAlunosQueResponderam();
}
