import { useEffect, useState } from "react";
import { FileQuestion, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import { quizzesApi } from "../services/api.js";

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [expandido, setExpandido] = useState(null);

  function carregar() {
    setCarregando(true);
    setErro("");
    quizzesApi
      .listar()
      .then(setQuizzes)
      .catch((err) =>
        setErro(
          err.message ||
            "Não foi possível conectar à API (http://localhost:8080). Verifique se o back-end está rodando."
        )
      )
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregar();
  }, []);

  async function excluir(quiz, e) {
    e.stopPropagation();
    if (!confirm(`Excluir o quiz "${quiz.titulo}"? Essa ação não pode ser desfeita.`)) return;
    try {
      await quizzesApi.excluir(quiz.id);
      carregar();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="dash-shell">
      <Sidebar />

      <main className="dash-main">
        <div className="page-header">
          <div>
            <h1>Quizzes criados</h1>
            <p>Lista de quizzes já cadastrados, com suas questões e alternativas.</p>
          </div>
        </div>

        <div className="panel">
          {erro && <p className="alert-error">{erro}</p>}

          {carregando ? (
            <p className="empty-state">Carregando quizzes...</p>
          ) : quizzes.length === 0 && !erro ? (
            <p className="empty-state">
              Nenhum quiz criado ainda. Vá em "Criar quiz" para cadastrar o primeiro.
            </p>
          ) : (
            quizzes.map((quiz) => {
              const aberto = expandido === quiz.id;
              return (
                <div className="question-card" key={quiz.id}>
                  <div
                    className="question-card-header"
                    style={{ cursor: "pointer" }}
                    onClick={() => setExpandido(aberto ? null : quiz.id)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <FileQuestion size={18} strokeWidth={2.2} />
                      <div>
                        <h4 style={{ marginBottom: 2 }}>{quiz.titulo}</h4>
                        <span className="panel-sub">
                          {quiz.categoria?.nome} · {quiz.questoes?.length || 0} questão(ões)
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={(e) => excluir(quiz, e)}
                        aria-label={`Excluir ${quiz.titulo}`}
                      >
                        <Trash2 size={14} />
                      </button>
                      {aberto ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {quiz.descricao && (
                    <p className="panel-sub" style={{ marginBottom: 10 }}>
                      {quiz.descricao}
                    </p>
                  )}

                  {aberto && (
                    <div style={{ marginTop: 12 }}>
                      {quiz.questoes.map((questao, qi) => (
                        <div key={questao.id} style={{ marginBottom: 14 }}>
                          <strong style={{ fontSize: 13.5 }}>
                            {qi + 1}. {questao.enunciado}
                          </strong>
                          <ul style={{ margin: "8px 0 0 0", paddingLeft: 20 }}>
                            {questao.alternativas.map((alt) => (
                              <li
                                key={alt.id}
                                style={{
                                  fontSize: 13.5,
                                  color: alt.correta
                                    ? "var(--color-success)"
                                    : "var(--color-text)",
                                  fontWeight: alt.correta ? 600 : 400,
                                }}
                              >
                                {alt.texto} {alt.correta && "✓ (correta)"}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
