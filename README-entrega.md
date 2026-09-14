# EVOLV — Entrega das 2 funcionalidades (14/09)

Este pacote contém duas funcionalidades completas e funcionando, de ponta a
ponta (front-end React + back-end Spring Boot + banco de dados real):

1. **Gerenciamento de Categorias** (RF03) — CRUD completo: criar, listar,
   editar e excluir categorias.
2. **Criação de Quiz** (RF04) — o professor monta um quiz com várias
   questões, cada uma com várias alternativas (marcando qual é a correta),
   e salva tudo no banco em uma única operação.

Nenhuma delas é login, dashboard ou "apenas integração" — são funções
essenciais do sistema, com regras de negócio de verdade (nome de categoria
não pode repetir, quiz precisa de pelo menos 1 questão, cada questão precisa
de pelo menos 2 alternativas com exatamente 1 correta).

## Como rodar

### 1. Back-end (Spring Boot + H2)

Pré-requisitos: Java 17+ e Maven (ou uma IDE como IntelliJ/VS Code, que já
resolve o Maven sozinha).

```bash
cd evolv-backend
mvn spring-boot:run
```

A API sobe em `http://localhost:8080`. O banco é H2 em memória — não precisa
instalar nada, os dados apenas somem quando você reiniciar (o suficiente
para a demonstração). Para inspecionar os dados durante o teste, acesse
`http://localhost:8080/h2-console` (JDBC URL `jdbc:h2:mem:evolvdb`, usuário
`sa`, senha em branco).

> Quando o projeto crescer, trocar para PostgreSQL é só mudar as 4 linhas de
> `spring.datasource.*` em `application.properties` e adicionar o driver do
> Postgres no `pom.xml` — o resto do código não muda.

### 2. Front-end (React + Vite)

Em outro terminal:

```bash
cd evolv-frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`. Vá direto para `/categorias` ou
`/quizzes/novo` (ou use o menu lateral, que já tem os links).

## Roteiro sugerido para o vídeo

**Categorias** (quem apresentar essa):
1. Abra `/categorias` com a lista vazia.
2. Clique em "Nova categoria", crie 2 ou 3 (ex: Matemática, História).
3. Edite uma delas (mude a descrição) e mostre que atualizou na lista.
4. Tente criar uma categoria com o mesmo nome — mostre o erro de validação
   vindo da API.
5. Exclua uma categoria e mostre que sumiu da lista.

**Criação de Quiz** (quem apresentar essa):
1. Abra `/quizzes/novo`.
2. Preencha título, descrição e selecione uma categoria (criada no passo
   anterior).
3. Adicione 2 questões, cada uma com 3-4 alternativas, marcando a correta.
4. Salve e mostre a mensagem de sucesso.
5. Tente salvar uma questão sem marcar nenhuma alternativa como correta (ou
   remova a categoria) para mostrar a validação de regra de negócio vinda
   do back-end.

Em ambos os casos, é importante deixar claro no vídeo que os dados estão
sendo **salvos de verdade no back-end** (dá pra mostrar isso recarregando a
página, ou abrindo o `/h2-console` e rodando `SELECT * FROM CATEGORIA;` /
`SELECT * FROM QUIZ;`).

## O que NÃO está incluso ainda (de propósito)

Login, dashboard e autenticação continuam sendo apenas telas/mocks — o
professor já disse que isso não conta como funcionalidade principal, então
não foi o foco desta entrega. Isso deve ser conectado depois, num próximo
ciclo do projeto.
