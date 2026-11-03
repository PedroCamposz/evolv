# EVOLV

Plataforma web educacional gamificada para quizzes e análise de desempenho.

Projeto Final de Curso (PFC) do Bacharelado em Sistemas de Informação da
Universidade de Mogi das Cruzes (UMC).

- **Integrantes:** Pedro Henrique Campos e Matheus Gende Rodrigues
- **Orientador:** Prof. Oscar Alves Evangelista
- **Protótipo (Figma):** [Evolv - TCC](https://www.figma.com/design/ABJ9zeGMQszU8ovk69MgJv/Evolv---tcc)

## Sobre o projeto

O EVOLV reúne em um só lugar a criação e a realização de quizzes, a correção
automática, a gamificação e a análise de desempenho. O professor cria e publica
os quizzes, o aluno responde e acompanha a própria evolução, e os resultados
ficam registrados para mostrar quais questões e conteúdos têm mais erros.

O sistema tem três perfis de acesso: **aluno**, **professor** e **administrador**.

## Funcionalidades

### Aluno
- Lista de quizzes publicados, com o número de tentativas usadas e o melhor resultado
- Tela de instruções antes de começar e uma questão por vez durante o quiz
- Cronômetro por questão, quando o professor define um tempo
- Resultado com a pontuação, os acertos, os erros, o XP ganho e a correção de cada questão
- Dashboard com XP, nível, média de acertos, posição no ranking e gráficos de evolução
- Desempenho por categoria, conteúdos com mais dificuldade e histórico de tentativas
- Ranking geral, mensal, semestral e anual, junto com as conquistas

### Professor
- Cadastro de categorias
- Criação de quizzes com questões e alternativas, inclusive importando questões da Open Trivia Database (com tradução automática para o português)
- Limite de tentativas por aluno e tempo por questão
- Publicação e encerramento de quizzes (rascunho, publicado e encerrado)
- Dashboard com resultados recentes, acertos por categoria e atividade dos últimos 14 dias
- Análise de erros: questões com maior taxa de erro e categorias em situação crítica

### Administrador
- Dashboard com usuários, uso da plataforma e atividades recentes
- Gerenciamento de usuários: criar, ver os dados completos, alterar o perfil e ativar ou desativar contas
- Senha temporária com prazo de validade para quem esquecer a senha
- Logs de auditoria das ações do sistema

## Regras de gamificação

| Regra | Como funciona |
| --- | --- |
| XP | 10 XP por concluir um quiz + 5 XP por acerto, em cada tentativa |
| Nível | Começa no nível 1 e sobe a cada 100 XP (nível = XP ÷ 100 + 1) |
| Ranking | Ordenado por XP; empate pela maior média de acertos e depois pelo nome. Mensal, semestral e anual consideram só o XP ganho no período atual |
| Conquistas | Primeiros passos (1º quiz), Gabaritou! (100% em um quiz), Dedicado (10 quizzes diferentes) e Em evolução (nível 5) |
| Tentativas | Definidas pelo professor em cada quiz (de 1 a 10 ou ilimitadas) |
| Tempo por questão | Definido pelo professor (de 15 s a 3 min ou sem limite); se o tempo acabar, a questão conta como erro |

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Front-end | React 18, Vite, React Router, JavaScript, HTML5 e CSS3 |
| Back-end | Java 17, Spring Boot 3, Spring Security, JWT e BCrypt |
| Banco de dados | H2 em memória (desenvolvimento); PostgreSQL previsto |
| Integrações | Open Trivia Database (questões) e MyMemory (tradução) |
| Testes | JUnit 5 |
| Outros | Git/GitHub, GitHub Projects (Scrum), Figma e Docker |

## Estrutura do repositório

```
evolv/
├── evolv-backend/      API REST em Spring Boot
│   └── src/main/java/com/evolv/
│       ├── auth/           login, cadastro, JWT e segurança
│       ├── usuario/        usuários e administração
│       ├── categoria/      categorias
│       ├── quiz/           quizzes, questões e alternativas
│       ├── tentativa/      execução, correção e histórico
│       ├── gamificacao/    XP, nível, ranking e conquistas
│       ├── dashboard/      indicadores e análise de erros
│       ├── auditoria/      logs de auditoria
│       ├── integracao/     Open Trivia Database e tradução
│       └── config/         configurações e dados de demonstração
├── evolv-frontend/     interface em React (Vite)
│   └── src/
│       ├── pages/          telas
│       ├── components/     menu, gráficos e componentes reutilizáveis
│       └── services/       comunicação com a API
├── database/
├── docs/
└── Dockerfile          imagem única (front + back) para publicação
```

## Como executar

### Pré-requisitos
- Java 17 ou superior e Maven
- Node.js 18 ou superior

### Back-end

```bash
cd evolv-backend
mvn spring-boot:run
```

A API sobe em `http://localhost:8080`. O banco H2 fica em memória, então os
dados voltam ao estado inicial sempre que o back-end é reiniciado. O console do
H2 fica em `http://localhost:8080/h2-console` (JDBC URL `jdbc:h2:mem:evolvdb`,
usuário `sa`, senha em branco).

### Front-end

```bash
cd evolv-frontend
npm install
npm run dev
```

O sistema abre em `http://localhost:5173`.

### Testes

```bash
cd evolv-backend
mvn test
```

### Usuários de demonstração

Ao iniciar com o banco vazio, o sistema cria usuários, categorias, quizzes e
algumas tentativas para facilitar os testes. A senha de todos é `evolv123`.

| E-mail | Perfil |
| --- | --- |
| admin@evolv.com | Administrador |
| professor@evolv.com | Professor |
| aluno@evolv.com | Aluno (sem tentativas) |
| beatriz@evolv.com | Aluno |
| lucas@evolv.com | Aluno |

Para desligar os dados de demonstração, use `evolv.demo.dados=false` no
`application.properties`.

## API

Todas as rotas, menos as de autenticação, exigem o token JWT no cabeçalho
`Authorization: Bearer <token>`.

| Recurso | Rotas | Acesso |
| --- | --- | --- |
| Autenticação | `POST /api/auth/registrar`, `POST /api/auth/login`, `POST /api/auth/trocar-senha` | Público / usuário logado |
| Categorias | `GET`, `POST`, `PUT`, `DELETE /api/categorias` | Leitura: logado; escrita: professor e admin |
| Quizzes | `GET /api/quizzes`, `GET /api/quizzes/resumo`, `POST /api/quizzes`, `PATCH /api/quizzes/{id}/disponibilizacao`, `PUT /api/quizzes/{id}/configuracoes`, `DELETE /api/quizzes/{id}` | Professor e admin |
| Aluno | `GET /api/aluno/quizzes`, `GET /api/aluno/quizzes/{id}`, `POST /api/aluno/quizzes/{id}/tentativas`, `GET /api/aluno/historico` | Aluno |
| Gamificação | `GET /api/gamificacao/ranking?periodo=geral\|mensal\|semestral\|anual`, `GET /api/gamificacao/meu-perfil` | Usuário logado |
| Dashboards | `GET /api/dashboard/aluno`, `GET /api/dashboard/professor`, `GET /api/dashboard/admin` | Conforme o perfil |
| Usuários | `GET`, `POST /api/admin/usuarios`, `GET /api/admin/usuarios/{id}`, `PATCH .../perfil`, `PATCH .../ativo`, `POST .../senha-temporaria` | Admin |
| Auditoria | `GET /api/auditoria` | Admin |
| Integração | `GET /api/integracao/opentdb/questoes`, `GET /api/integracao/opentdb/categorias` | Professor e admin |

## Segurança e LGPD

- Senhas armazenadas com hash BCrypt, nunca em texto puro
- Autenticação com JWT e permissões por perfil verificadas no back-end
- O aluno recebe o quiz sem o gabarito; a correção acontece no servidor
- Ninguém se cadastra como administrador: esse perfil só é atribuído por outro admin
- Contas desativadas perdem o acesso na hora, mesmo com um token ainda válido
- Senha temporária com prazo e troca obrigatória no primeiro acesso
- Aceite dos Termos de Uso e da Política de Privacidade registrado com data e hora
- Registro das ações relevantes em logs de auditoria

## Situação atual

**Implementado:** cadastro e login, perfis e permissões, categorias, criação e
publicação de quizzes, execução com correção automática, histórico,
gamificação, dashboards, análise de erros, auditoria e administração de
usuários.

**Próximos passos:**
- Migração do banco H2 para PostgreSQL
- Ampliação dos testes unitários e testes de integração
- Edição das questões de um quiz já criado
- Solicitação de exclusão dos próprios dados pelo usuário (LGPD)
- Publicação do sistema
