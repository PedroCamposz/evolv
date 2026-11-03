package com.evolv.config;

import com.evolv.categoria.Categoria;
import com.evolv.categoria.CategoriaRepository;
import com.evolv.quiz.Alternativa;
import com.evolv.quiz.Questao;
import com.evolv.quiz.Quiz;
import com.evolv.quiz.QuizRepository;
import com.evolv.tentativa.TentativaService;
import com.evolv.tentativa.dto.RespostaRequest;
import com.evolv.tentativa.dto.TentativaRequest;
import com.evolv.usuario.Perfil;
import com.evolv.usuario.Usuario;
import com.evolv.usuario.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Popula o banco com dados de demonstracao quando ele esta vazio.
 *
 * Como o H2 e em memoria (os dados somem a cada reinicio), isto garante que
 * o sistema sempre sobe com usuarios de teste, quizzes e algumas tentativas,
 * deixando dashboards e ranking preenchidos para a apresentacao.
 *
 * Desligar: evolv.demo.dados=false no application.properties.
 *
 * Usuarios criados (senha de todos: evolv123):
 *   admin@evolv.com (ADMIN), professor@evolv.com (PROFESSOR),
 *   aluno@evolv.com (ALUNO, sem tentativas - use para demonstrar ao vivo),
 *   beatriz@evolv.com e lucas@evolv.com (ALUNOS com tentativas ja feitas).
 */
@Component
public class DadosDemonstracao implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final QuizRepository quizRepository;
    private final TentativaService tentativaService;
    private final PasswordEncoder passwordEncoder;
    private final boolean habilitado;

    public DadosDemonstracao(UsuarioRepository usuarioRepository, CategoriaRepository categoriaRepository,
                             QuizRepository quizRepository, TentativaService tentativaService,
                             PasswordEncoder passwordEncoder,
                             @Value("${evolv.demo.dados:true}") boolean habilitado) {
        this.usuarioRepository = usuarioRepository;
        this.categoriaRepository = categoriaRepository;
        this.quizRepository = quizRepository;
        this.tentativaService = tentativaService;
        this.passwordEncoder = passwordEncoder;
        this.habilitado = habilitado;
    }

    @Override
    public void run(String... args) {
        if (!habilitado || usuarioRepository.count() > 0) {
            return;
        }

        usuario("Administrador EVOLV", "admin@evolv.com", Perfil.ADMIN);
        usuario("Prof. Oscar", "professor@evolv.com", Perfil.PROFESSOR);
        usuario("Aluno Demonstração", "aluno@evolv.com", Perfil.ALUNO);
        Usuario beatriz = usuario("Beatriz Alves", "beatriz@evolv.com", Perfil.ALUNO);
        Usuario lucas = usuario("Lucas Ferreira", "lucas@evolv.com", Perfil.ALUNO);

        Categoria mat = categoriaRepository.save(new Categoria("Matemática", "Operações, frações e porcentagem"));
        Categoria cie = categoriaRepository.save(new Categoria("Ciências", "Corpo humano, sistema solar e natureza"));
        Categoria his = categoriaRepository.save(new Categoria("História", "História do Brasil"));

        // Antes das questoes: limite de tentativas e tempo por questao em segundos (null = sem limite).
        Quiz q1 = quiz("Frações e porcentagem", "Revisão rápida de frações e porcentagem.", mat, true, 3, null,
                questao("Quanto é 1/2 + 1/4?", 1, "1/6", "3/4", "2/6", "1/8"),
                questao("Quanto é 25% de 80?", 2, "15", "25", "20", "40"),
                questao("Qual fração equivale a 0,5?", 0, "1/2", "1/5", "5/1", "2/5"),
                questao("Quanto é 3 × 0,2?", 3, "0,5", "6", "0,06", "0,6"));
        Quiz q2 = quiz("Sistema solar", "Planetas e características do sistema solar.", cie, true, null, 30,
                questao("Qual é o maior planeta do sistema solar?", 2, "Saturno", "Terra", "Júpiter", "Netuno"),
                questao("Qual planeta é conhecido como planeta vermelho?", 0, "Marte", "Vênus", "Mercúrio", "Urano"),
                questao("Quantos planetas existem no sistema solar?", 1, "7", "8", "9", "10"),
                questao("Qual é a estrela do nosso sistema?", 3, "Sirius", "Polaris", "Alfa Centauri", "Sol"));
        Quiz q3 = quiz("Brasil Colônia", "Principais fatos do período colonial.", his, true, 2, 60,
                questao("Em que ano os portugueses chegaram ao Brasil?", 1, "1492", "1500", "1530", "1822"),
                questao("Qual foi o primeiro produto explorado em larga escala?", 0, "Pau-brasil", "Café", "Ouro", "Borracha"),
                questao("Qual era a capital do Brasil no período colonial até 1763?", 2, "Rio de Janeiro", "São Paulo", "Salvador", "Recife"));
        quiz("Equações do 1º grau", "Rascunho - ainda não liberado para os alunos.", mat, false, 1, null,
                questao("Se x + 3 = 7, quanto vale x?", 0, "4", "10", "3", "7"));

        // Tentativas de exemplo (indices das alternativas escolhidas em cada questao).
        responder(beatriz, q1, 1, 2, 0, 3);   // 4/4
        responder(beatriz, q2, 2, 0, 1, 3);   // 4/4
        responder(beatriz, q3, 1, 0, 0);      // 2/3
        responder(lucas, q1, 1, 0, 0, 2);     // 2/4
        responder(lucas, q2, 2, 1, 2, 3);     // 2/4
        responder(lucas, q3, 0, 0, 0);        // 1/3
        responder(lucas, q3, 1, 0, 0);        // refez: 2/3 (sem XP)
    }

    private Usuario usuario(String nome, String email, Perfil perfil) {
        Usuario u = new Usuario(nome, email, passwordEncoder.encode("evolv123"), perfil);
        u.setAceitouTermos(true);
        u.setDataAceiteTermos(LocalDateTime.now());
        return usuarioRepository.save(u);
    }

    private record QuestaoSeed(String enunciado, int correta, String[] alternativas) {
    }

    private QuestaoSeed questao(String enunciado, int correta, String... alternativas) {
        return new QuestaoSeed(enunciado, correta, alternativas);
    }

    private Quiz quiz(String titulo, String descricao, Categoria categoria, boolean disponivel, Integer maxTentativas,
                      Integer tempoPorQuestao, QuestaoSeed... questoes) {
        Quiz quiz = new Quiz();
        quiz.setTitulo(titulo);
        quiz.setDescricao(descricao);
        quiz.setCategoria(categoria);
        quiz.setDisponibilizado(disponivel);
        quiz.setMaxTentativas(maxTentativas);
        quiz.setTempoPorQuestao(tempoPorQuestao);
        for (QuestaoSeed qs : questoes) {
            Questao q = new Questao(qs.enunciado());
            for (int i = 0; i < qs.alternativas().length; i++) {
                q.adicionarAlternativa(new Alternativa(qs.alternativas()[i], i == qs.correta()));
            }
            quiz.adicionarQuestao(q);
        }
        return quizRepository.save(quiz);
    }

    private void responder(Usuario aluno, Quiz quiz, int... escolhas) {
        List<RespostaRequest> respostas = new ArrayList<>();
        for (int i = 0; i < quiz.getQuestoes().size(); i++) {
            Questao q = quiz.getQuestoes().get(i);
            RespostaRequest r = new RespostaRequest();
            r.setQuestaoId(q.getId());
            r.setAlternativaId(q.getAlternativas().get(escolhas[i]).getId());
            respostas.add(r);
        }
        TentativaRequest req = new TentativaRequest();
        req.setRespostas(respostas);
        req.setTempoSegundos(40 + respostas.size() * 25);
        tentativaService.registrar(aluno.getId(), quiz.getId(), req);
    }
}
