import LegalPage from "../components/LegalPage.jsx";

export default function Termos() {
  return (
    <LegalPage title="Termos de Uso" updatedAt="27 de setembro de 2026">
      <p>
        Estes Termos de Uso regulam o acesso e a utilização da plataforma
        EVOLV ("Plataforma"), um sistema gamificado de quizzes educacionais.
        Ao criar uma conta ou utilizar a Plataforma, você declara que leu,
        compreendeu e concorda com as condições abaixo.
      </p>

      <h2>1. Sobre a Plataforma</h2>
      <p>
        A EVOLV permite que professores criem categorias e quizzes
        educacionais, e que alunos respondam a esses quizzes acumulando
        pontuação, progresso e conquistas. A Plataforma possui três perfis de
        acesso: Aluno, Professor e Administrador, cada um com permissões
        específicas dentro do sistema.
      </p>

      <h2>2. Cadastro e conta de usuário</h2>
      <ul>
        <li>
          Para utilizar a Plataforma é necessário criar uma conta,
          informando nome, e-mail e senha.
        </li>
        <li>
          Você é responsável por manter a confidencialidade da sua senha e
          por todas as atividades realizadas em sua conta.
        </li>
        <li>
          As informações fornecidas no cadastro devem ser verdadeiras,
          completas e atualizadas.
        </li>
        <li>
          O perfil de acesso (Aluno, Professor ou Administrador) determina
          quais funcionalidades da Plataforma estarão disponíveis para você.
        </li>
      </ul>

      <h2>3. Uso adequado</h2>
      <p>Ao utilizar a Plataforma, você concorda em não:</p>
      <ul>
        <li>
          Utilizar a Plataforma para fins ilícitos ou não autorizados pelos
          presentes Termos;
        </li>
        <li>
          Tentar acessar áreas, contas ou dados de outros usuários sem
          autorização;
        </li>
        <li>
          Inserir conteúdo ofensivo, discriminatório, ilegal ou que viole
          direitos de terceiros nos quizzes e categorias criados;
        </li>
        <li>
          Utilizar mecanismos automatizados para acessar ou extrair dados da
          Plataforma sem autorização prévia.
        </li>
      </ul>

      <h2>4. Conteúdo criado por professores</h2>
      <p>
        Professores são responsáveis pelo conteúdo dos quizzes, categorias e
        questões que criam na Plataforma, incluindo sua exatidão, adequação
        pedagógica e conformidade com a legislação aplicável.
      </p>

      <h2>5. Registros de auditoria</h2>
      <p>
        Para fins de segurança, rastreabilidade e conformidade, a Plataforma
        mantém registros de auditoria (logs) de ações relevantes, como
        cadastro de usuários, login e alterações de conteúdo. O acesso a
        esses registros é restrito ao perfil de Administrador.
      </p>

      <h2>6. Propriedade intelectual</h2>
      <p>
        A marca EVOLV, o código-fonte, o layout e os demais elementos da
        Plataforma são protegidos por direitos de propriedade intelectual.
        O uso da Plataforma não confere ao usuário qualquer direito sobre
        esses elementos, exceto o direito de uso da Plataforma nos termos
        aqui descritos.
      </p>

      <h2>7. Suspensão e encerramento de conta</h2>
      <p>
        A Plataforma pode suspender ou encerrar contas que violem estes
        Termos de Uso, sem prejuízo de outras medidas cabíveis. O usuário
        pode, a qualquer momento, solicitar o encerramento de sua conta e a
        exclusão de seus dados pessoais, nos termos da nossa{" "}
        <a href="/politica-privacidade">Política de Privacidade</a>.
      </p>

      <h2>8. Alterações destes Termos</h2>
      <p>
        Estes Termos podem ser atualizados periodicamente. Alterações
        relevantes serão comunicadas aos usuários por meio da própria
        Plataforma. O uso continuado da Plataforma após a atualização dos
        Termos representa a aceitação das novas condições.
      </p>

      <h2>9. Legislação aplicável</h2>
      <p>
        Estes Termos são regidos pela legislação brasileira, incluindo a Lei
        nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais - LGPD) e o
        Marco Civil da Internet (Lei nº 12.965/2014), aplicável no que
        couber ao tratamento de dados pessoais descrito na{" "}
        <a href="/politica-privacidade">Política de Privacidade</a>.
      </p>

      <p className="legal-academic-note">
        Este projeto foi desenvolvido para fins acadêmicos (Trabalho de
        Conclusão de Curso). Ainda assim, os Termos de Uso e a Política de
        Privacidade seguem a estrutura e os princípios exigidos pela LGPD
        para demonstrar a adequação da Plataforma a esses requisitos legais.
      </p>
    </LegalPage>
  );
}
