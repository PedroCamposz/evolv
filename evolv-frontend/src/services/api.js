const BASE_URL = "http://localhost:8080/api";

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (response.status === 204) return null;

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
