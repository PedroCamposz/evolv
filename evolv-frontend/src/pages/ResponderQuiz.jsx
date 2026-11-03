import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, FileText, Repeat, Zap, Clock3, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Award, Sparkles, Info, Hourglass,
} from "lucide-react";
import Sidebar, { Brand } from "../components/Sidebar.jsx";
import { Anel, corPorPercentual } from "../components/Charts.jsx";
import { alunoApi, sessao } from "../services/api.js";
import { formatarDuracao, formatarTempo } from "../utils.jsx";

const LETRAS = "ABCDEFGHIJ";

/**
 * RF06 - Execução do quiz (instruções -> uma questão por vez -> resultado).
 * RF07 - A correção é feita no back-end; aqui só mostramos o resultado.
 */
export default function ResponderQuiz() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [erro, setErro] = useState("");
  const [fase, setFase] = useState("instrucoes"); // instrucoes | respondendo | resultado
  const [resultado, setResultado] = useState(null);
  const [tempo, setTempo] = useState(0);

  useEffect(() => {
    alunoApi.quizParaResponder(id).then(setQuiz).catch((err) => setErro(err.message));
  }, [id]);

  if (fase === "respondendo") {
    return (
      <Respondendo quiz={quiz} tempo={tempo} setTempo={setTempo}
        aoConcluir={(r) => { setResultado(r); setFase("resultado"); window.scrollTo(0, 0); }} />
    );
  }

  return (
    <div className="dash-shell">
      <Sidebar />
      <main className="dash-main">
        {fase === "instrucoes" && (
          <Link to="/aluno/quizzes" className="link-btn" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 18 }}>
            <ArrowLeft size={15} /> Voltar para quizzes
          </Link>
        )}
        {erro && <p className="alert-error">{erro}</p>}
        {!quiz && !erro && <p className="empty-state">Carregando quiz...</p>}
        {quiz && fase === "instrucoes" && <Instrucoes quiz={quiz} aoIniciar={() => { setTempo(0); setFase("respondendo"); }} />}
        {quiz && fase === "resultado" && <Resultado r={resultado} />}
      </main>
    </div>
  );
}

function Instrucoes({ quiz, aoIniciar }) {
  const restantes = quiz.maxTentativas == null ? null : quiz.maxTentativas - quiz.tentativasUsadas;
  return (
    <div className="panel" style={{ maxWidth: 680, padding: 28 }}>
      <span className="eyebrow">{quiz.categoria}</span>
      <h1 style={{ fontSize: 28, margin: "6px 0 10px" }}>{quiz.titulo}</h1>
      {quiz.descricao && <p className="panel-sub" style={{ fontSize: 14.5, lineHeight: 1.6 }}>{quiz.descricao}</p>}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "16px 0 20px" }}>
        <span className="pill"><FileText size={14} /> {quiz.questoes.length} questões</span>
        <span className="pill laranja"><Repeat size={14} />
          {restantes == null ? "Tentativas ilimitadas" : `Tentativa ${quiz.tentativasUsadas + 1} de ${quiz.maxTentativas}`}
        </span>
        <span className="pill roxo"><Zap size={14} /> Até {quiz.xpMaximo} XP</span>
        <span className={`pill ${quiz.tempoPorQuestao ? "vermelho" : ""}`}><Hourglass size={14} />
          {quiz.tempoPorQuestao ? `${formatarDuracao(quiz.tempoPorQuestao)} por questão` : "Sem limite de tempo"}
        </span>
      </div>

      <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 18 }}>
        <h4 style={{ marginBottom: 10 }}>Regras e instruções</h4>
        <ul className="lista-regras">
          <li>Cada questão possui apenas uma alternativa correta.</li>
          {quiz.tempoPorQuestao ? (
            <>
              <li>Você tem <strong>{formatarDuracao(quiz.tempoPorQuestao)}</strong> para cada questão. Quando o tempo acaba, a questão fica sem resposta (conta como erro) e o quiz avança sozinho.</li>
              <li>Depois de avançar, não é possível voltar para a questão anterior.</li>
            </>
          ) : (
            <li>Você pode voltar e trocar respostas antes de finalizar, mas precisa responder todas.</li>
          )}
          <li>Você ganha 10 XP por concluir o quiz e mais 5 XP por acerto, em cada tentativa.</li>
          <li>{restantes == null
            ? "Este quiz não tem limite de tentativas."
            : `O professor liberou ${quiz.maxTentativas} tentativa(s) para este quiz. Restam ${restantes}.`}</li>
          {!quiz.tempoPorQuestao && <li>O tempo total é marcado apenas para o seu acompanhamento.</li>}
        </ul>
      </div>

      {quiz.podeResponder ? (
        <button className="btn btn-primary btn-block" style={{ marginTop: 22 }} onClick={aoIniciar}>Iniciar quiz</button>
      ) : (
        <p className="alert-error" style={{ marginTop: 22 }}>Você já usou todas as tentativas permitidas para este quiz.</p>
      )}
    </div>
  );
}

function Respondendo({ quiz, tempo, setTempo, aoConcluir }) {
  const navigate = useNavigate();
  const [atual, setAtual] = useState(0);
  const [escolhas, setEscolhas] = useState({}); // questaoId -> alternativaId (null = tempo esgotado)
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const inicio = useRef(Date.now());
  const limite = quiz.tempoPorQuestao; // segundos por questão (null = sem limite)
  const [restante, setRestante] = useState(limite);
  const inicioQuestao = useRef(Date.now());

  const total = quiz.questoes.length;
  const q = quiz.questoes[atual];
  const respondidas = quiz.questoes.filter((x) => escolhas[x.id]).length;
  const ultima = atual === total - 1;
  const mm = String(Math.floor(tempo / 60)).padStart(2, "0"), ss = String(tempo % 60).padStart(2, "0");

  // Tempo total da tentativa.
  useEffect(() => {
    const t = setInterval(() => setTempo(Math.floor((Date.now() - inicio.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [setTempo]);

  // Tempo de cada questão: reinicia ao trocar de questão.
  useEffect(() => {
    if (!limite) return;
    inicioQuestao.current = Date.now();
    setRestante(limite);
    const t = setInterval(() => {
      setRestante(Math.max(0, limite - Math.floor((Date.now() - inicioQuestao.current) / 1000)));
    }, 250);
    return () => clearInterval(t);
  }, [atual, limite]);

  // Tempo esgotado: questão fica sem resposta e o quiz avança (ou termina).
  useEffect(() => {
    if (!limite || restante > 0 || enviando) return;
    const novas = escolhas[q.id] ? escolhas : { ...escolhas, [q.id]: null };
    setEscolhas(novas);
    if (ultima) enviar(novas);
    else setAtual((a) => a + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restante]);

  async function enviar(mapa) {
    setEnviando(true);
    try {
      const respostas = quiz.questoes.map((x) => ({ questaoId: x.id, alternativaId: mapa[x.id] ?? null }));
      aoConcluir(await alunoApi.responder(quiz.id, respostas, Math.floor((Date.now() - inicio.current) / 1000)));
    } catch (err) {
      setErro(err.message);
      setEnviando(false);
    }
  }

  function finalizar() {
    setErro("");
    if (!limite) {
      const pendente = quiz.questoes.findIndex((x) => !escolhas[x.id]);
      if (pendente >= 0) {
        setErro(`Responda todas as questões antes de finalizar (${respondidas} de ${total}). Levamos você à questão ${pendente + 1}.`);
        setAtual(pendente);
        return;
      }
    }
    enviar(escolhas);
  }

  function sair() {
    if (confirm("Sair do quiz? Suas respostas desta tentativa serão perdidas.")) navigate("/aluno/quizzes");
  }

  const pouco = limite && restante <= Math.min(5, limite / 3);

  return (
    <div className="quiz-foco">
      <header className="quiz-foco-header">
        <Brand />
        <div className="quiz-foco-titulo">
          <strong>{quiz.titulo}</strong>
          <span>Questão {atual + 1} de {total}</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="pill" title="Tempo total"><Clock3 size={14} /> {mm}:{ss}</span>
          <button className="btn btn-sm btn-light" onClick={sair}>Sair</button>
        </div>
      </header>
      <div className="quiz-foco-progresso"><span style={{ width: `${((atual + 1) / total) * 100}%` }} /></div>

      <main className="quiz-foco-main">
        {limite && (
          <div className={`cronometro ${pouco ? "acabando" : ""}`} role="timer" aria-live="polite">
            <Hourglass size={16} />
            <strong>{restante}s</strong>
            <div className="cronometro-barra"><span style={{ width: `${(restante / limite) * 100}%` }} /></div>
          </div>
        )}

        <div className="panel" style={{ padding: 24 }}>
          <span className="eyebrow">{quiz.categoria}</span>
          <h2 style={{ fontSize: 19, lineHeight: 1.45, marginTop: 8 }}>{q.enunciado}</h2>
        </div>

        <div style={{ marginTop: 16 }} role="radiogroup" aria-label={`Alternativas da questão ${atual + 1}`}>
          {q.alternativas.map((a, i) => {
            const marcada = escolhas[q.id] === a.id;
            return (
              <button key={a.id} type="button" role="radio" aria-checked={marcada} disabled={enviando}
                className={`opcao ${marcada ? "marcada" : ""}`}
                onClick={() => { setEscolhas({ ...escolhas, [q.id]: a.id }); setErro(""); }}>
                <span className="opcao-letra">{LETRAS[i]}</span>
                {a.texto}
              </button>
            );
          })}
        </div>

        {erro && <p className="alert-error" style={{ marginTop: 14 }}>{erro}</p>}

        <div className="quiz-foco-acoes">
          {limite ? <span /> : (
            <button className="btn btn-light" disabled={atual === 0} onClick={() => setAtual(atual - 1)}>
              <ChevronLeft size={16} /> Anterior
            </button>
          )}
          {ultima ? (
            <button className="btn btn-primary" onClick={finalizar} disabled={enviando || (limite && !escolhas[q.id])}>
              {enviando ? "Corrigindo..." : "Finalizar quiz"}
            </button>
          ) : (
            <button className="btn btn-primary" disabled={limite && !escolhas[q.id]} onClick={() => setAtual(atual + 1)}
              title={limite && !escolhas[q.id] ? "Escolha uma alternativa para avançar" : undefined}>
              Próxima <ChevronRight size={16} />
            </button>
          )}
        </div>

        {limite ? (
          <p className="panel-sub" style={{ marginTop: 22 }}>
            {respondidas} de {total} respondidas · Escolha uma alternativa para avançar. Se o tempo acabar, a questão fica sem resposta.
          </p>
        ) : (
          <div className="navegador" aria-label="Ir para a questão">
            {quiz.questoes.map((x, i) => (
              <button key={x.id} type="button" onClick={() => setAtual(i)}
                className={`nav-q ${i === atual ? "atual" : ""} ${escolhas[x.id] ? "feita" : ""}`}
                aria-label={`Questão ${i + 1}${escolhas[x.id] ? " (respondida)" : ""}`}>
                {i + 1}
              </button>
            ))}
            <span className="panel-sub" style={{ marginLeft: 6 }}>{respondidas} de {total} respondidas</span>
          </div>
        )}
      </main>
    </div>
  );
}

function titulo(percentual, nome) {
  if (percentual >= 90) return `Excelente trabalho, ${nome}!`;
  if (percentual >= 70) return `Muito bem, ${nome}!`;
  if (percentual >= 50) return `Bom esforço, ${nome}!`;
  return `Continue praticando, ${nome}!`;
}

function Resultado({ r }) {
  const [verCorrecao, setVerCorrecao] = useState(false);
  const nome = sessao.getUsuario()?.nome?.split(" ")[0] || "aluno";
  const erros = r.totalQuestoes - r.acertos;
  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div className="panel resultado-card">
        <span className="eyebrow">Quiz finalizado!</span>
        <h1 style={{ fontSize: 26, margin: "6px 0 6px" }}>{titulo(r.percentual, nome)}</h1>
        <p className="panel-sub">Você concluiu o quiz <strong>{r.quizTitulo}</strong> ({r.categoria}).</p>

        <div style={{ margin: "24px 0" }}>
          <Anel percentual={r.percentual} cor={corPorPercentual(r.percentual)}>
            <strong style={{ fontSize: 32 }}>{r.percentual}%</strong>
            <span className="mini-stat-label">Pontuação</span>
          </Anel>
        </div>

        <div className="resultado-numeros">
          <div><span className="mini-stat-label">Acertos</span><p><strong style={{ color: "var(--color-success)" }}>{r.acertos}</strong> de {r.totalQuestoes} qst.</p></div>
          <div><span className="mini-stat-label">Erros</span><p><strong style={{ color: "var(--color-danger)" }}>{erros}</strong> de {r.totalQuestoes} qst.</p></div>
          <div><span className="mini-stat-label">XP ganho</span><p><span className="pill verde">+{r.xpGanho} XP</span></p></div>
        </div>

        <p className="panel-sub" style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "center", margin: "16px 0 4px" }}>
          <Clock3 size={15} /> Tempo total: <strong style={{ color: "var(--color-text)" }}>{formatarTempo(r.tempoSegundos)}</strong>
        </p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 10 }}>
          <span className="pill roxo">Nível {r.nivel} · {r.xpTotal} XP</span>
          {r.subiuDeNivel && <span className="pill verde"><Sparkles size={13} /> Você subiu de nível!</span>}
          {r.tentativasRestantes != null && (
            <span className="pill"><Info size={13} /> {r.tentativasRestantes > 0 ? `Restam ${r.tentativasRestantes} tentativa(s)` : "Sem tentativas restantes"}</span>
          )}
        </div>

        {r.novasConquistas.map((c) => (
          <p key={c.codigo} className="conquista-nova"><Award size={18} /> Conquista desbloqueada: <strong>{c.nome}</strong></p>
        ))}

        <div style={{ display: "grid", gap: 10, marginTop: 22 }}>
          <Link to="/desempenho" className="btn btn-primary" style={{ textDecoration: "none" }}>Ver desempenho detalhado</Link>
          <button className="btn btn-outline" onClick={() => setVerCorrecao(!verCorrecao)}>{verCorrecao ? "Esconder correção" : "Ver correção das questões"}</button>
          <Link to="/dashboard" className="btn btn-outline" style={{ textDecoration: "none" }}>Voltar ao dashboard</Link>
        </div>
      </div>

      {verCorrecao && (
        <div className="panel" style={{ marginTop: 16 }}>
          <h3>Correção</h3>
          {r.correcao.map((c, i) => (
            <div className="correcao-item" key={c.questaoId}>
              <strong style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                {c.acertou ? <CheckCircle2 size={17} color="var(--color-success)" /> : <XCircle size={17} color="var(--color-danger)" />}
                {i + 1}. {c.enunciado}
              </strong>
              <div className="linha">Sua resposta: <span style={{ color: c.acertou ? "var(--color-success)" : "var(--color-danger)", fontWeight: 600 }}>{c.respostaEscolhida ?? "sem resposta (tempo esgotado)"}</span></div>
              {!c.acertou && <div className="linha">Resposta correta: <span style={{ color: "var(--color-success)", fontWeight: 600 }}>{c.respostaCorreta}</span></div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
