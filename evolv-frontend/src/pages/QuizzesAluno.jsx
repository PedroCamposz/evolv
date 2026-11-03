import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Repeat, Zap, CheckCircle2, Lock, Hourglass } from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import { alunoApi } from "../services/api.js";
import { formatarDuracao } from "../utils.jsx";

const FILTROS = [
  { id: "todos", label: "Todos" },
  { id: "pendentes", label: "Pendentes" },
  { id: "respondidos", label: "Respondidos" },
];

/** RF06 - Quizzes disponibilizados pelos professores para o aluno responder. */
export default function QuizzesAluno() {
  const [quizzes, setQuizzes] = useState(null);
  const [erro, setErro] = useState("");
  const [filtro, setFiltro] = useState("todos");

  useEffect(() => {
    alunoApi.quizzesDisponiveis().then(setQuizzes).catch((err) => setErro(err.message));
  }, []);

  const lista = (quizzes || []).filter((q) =>
    filtro === "todos" ? true : filtro === "pendentes" ? !q.jaRespondido : q.jaRespondido);

  return (
    <div className="dash-shell">
      <Sidebar />
      <main className="dash-main">
        <div className="page-header">
          <div>
            <h1>Quizzes</h1>
            <p>Quizzes liberados pelos seus professores.</p>
          </div>
          <div className="tabs">
            {FILTROS.map((f) => (
              <button key={f.id} className={`tab ${filtro === f.id ? "ativa" : ""}`} onClick={() => setFiltro(f.id)}>
                {f.label}
                {quizzes && ` (${quizzes.filter((q) => f.id === "todos" ? true : f.id === "pendentes" ? !q.jaRespondido : q.jaRespondido).length})`}
              </button>
            ))}
          </div>
        </div>

        {erro && <p className="alert-error">{erro}</p>}
        {!quizzes && !erro && <p className="empty-state">Carregando quizzes...</p>}
        {quizzes && lista.length === 0 && (
          <div className="panel"><p className="empty-state">Nenhum quiz {filtro === "pendentes" ? "pendente" : filtro === "respondidos" ? "respondido" : "disponível"} no momento.</p></div>
        )}

        <div className="quiz-grid">
          {lista.map((q) => (
            <div className="panel quiz-card" key={q.id}>
              <span className="eyebrow">{q.categoria}</span>
              <h3 style={{ fontSize: 17 }}>{q.titulo}</h3>
              {q.descricao && <p className="panel-sub">{q.descricao}</p>}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span className="pill"><FileText size={13} /> {q.totalQuestoes} questões</span>
                <span className="pill"><Repeat size={13} /> {q.maxTentativas == null ? "Ilimitadas" : `${q.tentativasUsadas}/${q.maxTentativas} tentativas`}</span>
                {q.tempoPorQuestao && <span className="pill vermelho"><Hourglass size={13} /> {formatarDuracao(q.tempoPorQuestao)}/questão</span>}
                <span className="pill roxo"><Zap size={13} /> até {q.xpMaximo} XP</span>
              </div>
              <div className="quiz-card-footer">
                {q.jaRespondido ? (
                  <span className="pill verde"><CheckCircle2 size={13} /> Melhor: {q.melhorPercentual}%</span>
                ) : (
                  <span className="pill laranja">Pendente</span>
                )}
                {q.podeResponder ? (
                  <Link to={`/aluno/quizzes/${q.id}`} className={`btn btn-sm ${q.jaRespondido ? "btn-soft" : "btn-primary"}`} style={{ textDecoration: "none" }}>
                    {q.jaRespondido ? "Refazer" : "Ver quiz"}
                  </Link>
                ) : (
                  <span className="pill" title="Você já usou todas as tentativas permitidas"><Lock size={13} /> Esgotadas</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
