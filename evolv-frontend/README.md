# EVOLV — Frontend

Início do frontend em React (Vite) do EVOLV: plataforma web educacional
gamificada para quizzes e análise de desempenho.

## O que já está pronto

- **Login** (`/login`) — formulário de autenticação, pronto para plugar no
  endpoint `POST /api/auth/login` do backend (Spring Boot).
- **Cadastro** (`/cadastro`) — formulário com seleção de perfil
  (Aluno / Professor), pronto para `POST /api/auth/cadastro`.
- **Dashboard do aluno** (`/dashboard`) — nível/XP, quizzes pendentes,
  desempenho por categoria e ranking da turma, com dados de exemplo
  (mock) prontos para serem substituídos por chamadas à API.

Os pontos marcados com `// TODO` em `Login.jsx` e `Register.jsx` são onde
entra a chamada real ao backend.

## Como rodar

```bash
npm install
npm run dev
```

Acesse http://localhost:5173.

## Próximos passos sugeridos

1. Criar o `AuthContext` para guardar o token JWT e o usuário logado.
2. Trocar os dados mockados do Dashboard por chamadas à API
   (`GET /api/dashboard/aluno`).
3. Criar as telas de **Quizzes** (listagem + execução) e **Professor**
   (criação de quiz).
4. Adicionar proteção de rotas (redirecionar para `/login` se não
   autenticado).
5. Criar o dashboard do **professor** e do **administrador** (auditoria,
   gestão de usuários — conforme a Ficha do PFC).

## Estrutura

```
src/
  components/   Sidebar, StatCard, Logo, AuthBrandPanel
  pages/        Login, Register, Dashboard
  theme.css     tokens de cor/tipografia
  index.css     layout e estilos das telas
```
