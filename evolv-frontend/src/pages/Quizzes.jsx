import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Eye, EyeOff, Trash2, ListChecks, X, Repeat, Hourglass } from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import { quizzesApi } from "../services/api.js";
import { OPCOES_TEMPO, formatarDuracao, nota } from "../utils.jsx";

const FILTROS = [
  { id: "TODOS", label: "Todos" },
  { id: "PUBLICADO", label: "Publicados" },
  { id: "RASCUNHO", label: "Rascunhos" },
  { id: "ENCERRADO", label: "Encerrados" },
];
const STATUS = {
  PUBLICADO: ["publicado", "Publicado"],
  RASCUNHO: ["rascunho", "Rascunho"],
  ENCERRADO: ["encerrado", "Encerrado"],
};

/**
 * Gerenciar quizzes (professor/admin): publicar (RF05), encerrar, editar
 * título/descrição/limite de tentativas, ver questões e excluir.
 */
export default function Quizzes() {
  const [quizzes, setQuizzes] = useState(null);
  const [filtro, setFiltro] = useState("TODOS");
  const [erro, setErro] = useState("");
  const [msg, setMsg] = useState("");
  const [editando, setEditando] = useState(null);
  const [vendo, setVendo] = useState(null);

  function carregar() {
    quizzesApi.resumo().then(setQuizzes).catch((err) => setErro(err.message));
  }
  useEffect(carregar, []);

  async function executar(acao, sucesso) {
    setErro(""); setMsg("");
    try { await acao(); setMsg(sucesso); carregar(); } catch (err) { setErro(err.message); }
  }

  function excluir(q) {
    if (!confirm(`Excluir o quiz "${q.titulo}"? Essa ação não pode ser desfeita.`)) return;
    executar(() => quizzesApi.excluir(q.id), `Quiz "${q.titulo}" excluído.`);
  }

  const contagem = (id) => (quizzes || []).filter((q) => id === "TODOS" || q.status === id).length;
  const lista = (quizzes || []).filter((q) => filtro === "TODOS" || q.status === filtro);

  return (
    <div className="dash-shell">
      <Sidebar />
      <main className="dash-main">
        <div className="page-header">
          <div>
            <h1>Gerenciar quizzes</h1>
            <p>Crie, publique e acompanhe os quizzes disponíveis para os alunos.</p>
          </div>
          <Link to="/quizzes/novo" className="btn btn-primary" style={{ textDecoration: "none" }}>Criar novo quiz</Link>
        </div>

        <div className="tabs" style={{ marginBottom: 18 }}>
          {FILTROS.map((f) => (
            <button key={f.id} className={`tab ${filtro === f.id ? "ativa" : ""}`} onClick={() => setFiltro(f.id)}>
              {f.label} ({contagem(f.id)})
            </button>
          ))}
        </div>

        {erro && <p className="alert-error">{erro}</p>}
        {msg && <p className="alert-success">{msg}</p>}
        {!quizzes && !erro && <p className="empty-state">Carregando quizzes...</p>}
        {quizzes && lista.length === 0 && <div className="panel"><p className="empty-state">Nenhum quiz aqui.</p></div>}

        <div className="quiz-grid">
          {lista.map((q) => {
            const [classe, texto] = STATUS[q.status];
            return (
              <div className="panel quiz-card" key={q.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <span className="eyebrow">{q.categoria}</span>
                  <span className={`status ${classe}`}>{texto}</span>
                </div>
                <h3 style={{ fontSize: 16 }}>{q.titulo}</h3>
                <dl className="quiz-dados">
                  <div><dt>Questões</dt><dd>{q.totalQuestoes}</dd></div>
                  <div><dt>Tentativas</dt><dd>{q.maxTentativas == null ? "Ilimitadas" : `${q.maxTentativas} por aluno`}</dd></div>
                  <div><dt>Tempo por questão</dt><dd>{q.tempoPorQuestao == null ? "Sem limite" : formatarDuracao(q.tempoPorQuestao)}</dd></div>
                  <div><dt>Concluíram</dt><dd>{q.alunosConcluiram} aluno{q.alunosConcluiram === 1 ? "" : "s"}</dd></div>
                  <div><dt>Média geral</dt><dd style={{ color: "var(--color-primary)" }}>{q.mediaPercentual == null ? "-" : `${nota(q.mediaPercentual)} / 10`}</dd></div>
                </dl>
                <div className="quiz-card-acoes">
                  <button className="btn btn-sm btn-soft" onClick={() => setEditando(q)}><Pencil size={13} /> Editar</button>
                  <button className="btn btn-sm btn-light" onClick={() => setVendo(q)}><ListChecks size={13} /> Questões</button>
                  {q.status === "PUBLICADO" ? (
                    <button className="btn btn-sm btn-light" onClick={() => executar(() => quizzesApi.disponibilizar(q.id, false), `"${q.titulo}" foi encerrado. Os alunos não o veem mais.`)}><EyeOff size={13} /> Encerrar</button>
                  ) : (
                    <button className="btn btn-sm btn-primary" onClick={() => executar(() => quizzesApi.disponibilizar(q.id, true), `"${q.titulo}" foi publicado para os alunos.`)}><Eye size={13} /> Publicar</button>
                  )}
                  {q.tentativas === 0 && (
                    <button className="btn btn-sm btn-danger" onClick={() => excluir(q)} aria-label={`Excluir ${q.titulo}`} title="Excluir"><Trash2 size={13} /></button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {editando && (
          <EditarQuiz quiz={editando} aoFechar={() => setEditando(null)}
            aoSalvar={(payload) => executar(async () => { await quizzesApi.configurar(editando.id, payload); setEditando(null); }, "Configurações salvas.")} />
        )}
        {vendo && <VerQuestoes quiz={vendo} aoFechar={() => setVendo(null)} />}
      </main>
    </div>
  );
}

function EditarQuiz({ quiz, aoFechar, aoSalvar }) {
  const [titulo, setTitulo] = useState(quiz.titulo);
  const [descricao, setDescricao] = useState(quiz.descricao || "");
  const [max, setMax] = useState(quiz.maxTentativas ?? "");
  const [tempo, setTempo] = useState(quiz.tempoPorQuestao ?? "");
  return (
    <div className="modal-backdrop" onClick={aoFechar}>
      <form className="modal-card" onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => { e.preventDefault(); aoSalvar({ titulo, descricao, maxTentativas: max === "" ? null : Number(max), tempoPorQuestao: tempo === "" ? null : Number(tempo) }); }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3>Editar quiz</h3>
          <button type="button" className="icon-btn" onClick={aoFechar} aria-label="Fechar"><X size={16} /></button>
        </div>
        <div className="field">
          <label htmlFor="ed-titulo">Título</label>
          <input id="ed-titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} required maxLength={150} />
        </div>
        <div className="field">
          <label htmlFor="ed-desc">Descrição</label>
          <input id="ed-desc" value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={500} />
        </div>
        <div className="field">
          <label htmlFor="ed-max"><Repeat size={13} style={{ verticalAlign: -2 }} /> Limite de tentativas por aluno</label>
          <select id="ed-max" value={max} onChange={(e) => setMax(e.target.value)}>
            <option value="">Ilimitadas</option>
            {[1, 2, 3, 4, 5, 10].map((n) => <option key={n} value={n}>{n} tentativa{n > 1 ? "s" : ""}</option>)}
          </select>
          <span className="field-hint">Se você diminuir o limite, quem já usou as tentativas não poderá responder de novo.</span>
        </div>
        <div className="field">
          <label htmlFor="ed-tempo"><Hourglass size={13} style={{ verticalAlign: -2 }} /> Tempo por questão</label>
          <select id="ed-tempo" value={tempo} onChange={(e) => setTempo(e.target.value)}>
            <option value="">Sem limite de tempo</option>
            {OPCOES_TEMPO.map((s) => <option key={s} value={s}>{formatarDuracao(s)}</option>)}
          </select>
        </div>
        <p className="panel-sub" style={{ marginBottom: 16 }}>As questões não podem ser alteradas depois de criadas, para não afetar o histórico dos alunos.</p>
        <div className="modal-actions">
          <button type="button" className="btn btn-light" onClick={aoFechar}>Cancelar</button>
          <button type="submit" className="btn btn-primary">Salvar</button>
        </div>
      </form>
    </div>
  );
}

function VerQuestoes({ quiz, aoFechar }) {
  const [completo, setCompleto] = useState(null);
  const [erro, setErro] = useState("");
  useEffect(() => { quizzesApi.buscar(quiz.id).then(setCompleto).catch((e) => setErro(e.message)); }, [quiz.id]);
  return (
    <div className="modal-backdrop" onClick={aoFechar}>
      <div className="modal-card modal-card-lg" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3>{quiz.titulo}</h3>
          <button type="button" className="icon-btn" onClick={aoFechar} aria-label="Fechar"><X size={16} /></button>
        </div>
        {erro && <p className="alert-error">{erro}</p>}
        {!completo ? (!erro && <p className="empty-state">Carregando...</p>) : completo.questoes.map((questao, i) => (
          <div key={questao.id} style={{ marginBottom: 16 }}>
            <strong style={{ fontSize: 14 }}>{i + 1}. {questao.enunciado}</strong>
            <ul style={{ margin: "6px 0 0", paddingLeft: 20 }}>
              {questao.alternativas.map((a) => (
                <li key={a.id} style={{ fontSize: 13.5, color: a.correta ? "var(--color-success)" : "var(--color-text)", fontWeight: a.correta ? 600 : 400 }}>
                  {a.texto} {a.correta && "✓"}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
