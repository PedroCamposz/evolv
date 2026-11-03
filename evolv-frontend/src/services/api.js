// Em desenvolvimento (npm run dev) o front fala com o back em localhost:8080.
// No site publicado, front e back ficam no mesmo endereco, entao usa "/api".
// Pode ser sobrescrito com a variavel VITE_API_URL.
const BASE_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:8080/api" : "/api");
const TOKEN_KEY = "evolv_token";
const USUARIO_KEY = "evolv_usuario";

// ---- Sessão (token JWT) ----
export const sessao = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getUsuario: () => JSON.parse(localStorage.getItem(USUARIO_KEY) || "null"),
  salvar: (authResponse) => {
    localStorage.setItem(TOKEN_KEY, authResponse.token);
    localStorage.setItem(
      USUARIO_KEY,
      JSON.stringify({
        id: authResponse.usuarioId,
        nome: authResponse.nome,
        email: authResponse.email,
        perfil: authResponse.perfil,
        // Login com senha temporária: precisa criar uma senha nova antes de usar o sistema.
        trocarSenha: !!authResponse.trocarSenha,
        senhaExpiraEm: authResponse.senhaExpiraEm || null,
        aceiteTermosPendente: !!authResponse.aceiteTermosPendente,
      })
    );
  },
  precisaTrocarSenha: () => !!JSON.parse(localStorage.getItem(USUARIO_KEY) || "null")?.trocarSenha,
  limpar: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
  },
  estaLogado: () => !!localStorage.getItem(TOKEN_KEY),
  atualizarPerfil: (perfil) => {
    const u = JSON.parse(localStorage.getItem(USUARIO_KEY) || "null");
    if (u) localStorage.setItem(USUARIO_KEY, JSON.stringify({ ...u, perfil }));
  },
};

async function request(path, options = {}) {
  const token = sessao.getToken();

  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  if (response.status === 204) return null;

  // Token expirado/inválido: desloga e manda pro login.
  if (response.status === 401 && token) {
    sessao.limpar();
    window.location.href = "/login";
    return null;
  }

  const data = await response.json().catch(() => null);

  // Senha temporária: o back-end só libera a troca de senha.
  if (response.status === 403 && data?.codigo === "TROCAR_SENHA") {
    if (window.location.pathname !== "/trocar-senha") window.location.href = "/trocar-senha";
    const erro = new Error(data.mensagem);
    throw erro;
  }

  if (!response.ok) {
    const erros = data?.erros;
    // Erros de validação por campo (ex.: "E-mail inválido.") aparecem por extenso.
    const mensagem =
      (erros && Object.values(erros).join(" ")) || data?.mensagem || "Não foi possível completar a operação.";
    const erro = new Error(mensagem);
    erro.erros = erros;
    throw erro;
  }

  return data;
}

// ---- Autenticação (RF - Login e controle de acesso) ----
export const authApi = {
  registrar: (payload) => request("/auth/registrar", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  trocarSenha: (senhaAtual, novaSenha, aceitouTermos) =>
    request("/auth/trocar-senha", { method: "POST", body: JSON.stringify({ senhaAtual, novaSenha, aceitouTermos }) }),
};

// ---- Categorias (RF03) ----
export const categoriasApi = {
  listar: () => request("/categorias"),
  criar: (payload) => request("/categorias", { method: "POST", body: JSON.stringify(payload) }),
  atualizar: (id, payload) =>
    request(`/categorias/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  excluir: (id) => request(`/categorias/${id}`, { method: "DELETE" }),
};

// ---- Quizzes (RF04) ----
export const quizzesApi = {
  listar: () => request("/quizzes"),
  resumo: () => request("/quizzes/resumo"),
  buscar: (id) => request(`/quizzes/${id}`),
  // Edita título, descrição e limite de tentativas.
  configurar: (id, payload) =>
    request(`/quizzes/${id}/configuracoes`, { method: "PUT", body: JSON.stringify(payload) }),
  // RF05 - Disponibilizar / recolher o quiz para os alunos.
  disponibilizar: (id, disponibilizado) =>
    request(`/quizzes/${id}/disponibilizacao`, {
      method: "PATCH",
      body: JSON.stringify({ disponibilizado }),
    }),
  criar: (payload) => request("/quizzes", { method: "POST", body: JSON.stringify(payload) }),
  excluir: (id) => request(`/quizzes/${id}`, { method: "DELETE" }),
};

// ---- Aluno: realizar quizzes e histórico (RF06, RF07, RF08) ----
export const alunoApi = {
  quizzesDisponiveis: () => request("/aluno/quizzes"),
  quizParaResponder: (id) => request(`/aluno/quizzes/${id}`),
  responder: (id, respostas, tempoSegundos) =>
    request(`/aluno/quizzes/${id}/tentativas`, {
      method: "POST",
      body: JSON.stringify({ respostas, tempoSegundos }),
    }),
  historico: () => request("/aluno/historico"),
};

// ---- Gamificação (RF09) ----
export const gamificacaoApi = {
  ranking: (periodo = "geral") => request(`/gamificacao/ranking?periodo=${periodo}`),
  meuPerfil: () => request("/gamificacao/meu-perfil"),
};

// ---- Dashboards (RF10) e análise de erros (RF11) ----
export const dashboardApi = {
  aluno: () => request("/dashboard/aluno"),
  professor: () => request("/dashboard/professor"),
  admin: () => request("/dashboard/admin"),
};

// ---- Administração de usuários (RF13) ----
export const adminApi = {
  usuarios: () => request("/admin/usuarios"),
  detalhar: (id) => request(`/admin/usuarios/${id}`),
  senhaTemporaria: (id, validadeHoras) =>
    request(`/admin/usuarios/${id}/senha-temporaria`, { method: "POST", body: JSON.stringify({ validadeHoras }) }),
  criar: (payload) => request("/admin/usuarios", { method: "POST", body: JSON.stringify(payload) }),
  alterarPerfil: (id, perfil) =>
    request(`/admin/usuarios/${id}/perfil`, { method: "PATCH", body: JSON.stringify({ perfil }) }),
  alterarAtivo: (id, ativo) =>
    request(`/admin/usuarios/${id}/ativo`, { method: "PATCH", body: JSON.stringify({ ativo }) }),
};

// ---- Auditoria (RF - Logs de auditoria) ----
export const auditoriaApi = {
  listar: () => request("/auditoria"),
};

// ---- Integração externa: importação de questões da OpenTDB ----
// Fluxo: React -> Spring Boot -> OpenTDB -> Spring Boot -> React.
// O front nunca fala com opentdb.com diretamente.
export const integracaoApi = {
  categoriasOpenTdb: () => request("/integracao/opentdb/categorias"),
  buscarQuestoesOpenTdb: ({ quantidade, categoriaId, dificuldade, tipo } = {}) => {
    const params = new URLSearchParams();
    if (quantidade) params.set("quantidade", quantidade);
    if (categoriaId) params.set("categoria", categoriaId);
    if (dificuldade) params.set("dificuldade", dificuldade);
    if (tipo) params.set("tipo", tipo);
    const query = params.toString();
    return request(`/integracao/opentdb/questoes${query ? `?${query}` : ""}`);
  },
};
