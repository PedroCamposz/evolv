const BASE_URL = "http://localhost:8080/api";
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
      })
    );
  },
  limpar: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
  },
  estaLogado: () => !!localStorage.getItem(TOKEN_KEY),
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

  if (!response.ok) {
    const mensagem = data?.mensagem || "Não foi possível completar a operação.";
    const erros = data?.erros;
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
  criar: (payload) => request("/quizzes", { method: "POST", body: JSON.stringify(payload) }),
  excluir: (id) => request(`/quizzes/${id}`, { method: "DELETE" }),
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
