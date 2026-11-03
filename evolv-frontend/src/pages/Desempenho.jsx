import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, BookOpen, Star } from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import { ColunasCategorias, GraficoLinha } from "../components/Charts.jsx";
import { alunoApi, dashboardApi } from "../services/api.js";
import { formatarTempo, nota, situacao } from "../utils.jsx";

/**
 * Desempenho do aluno: média por categoria, conteúdos com mais dificuldade,
 * evolução e o histórico de tentativas (RF08).
 */
export default function Desempenho() {
  const [d, setD] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    Promise.all([dashboardApi.aluno(), alunoApi.historico()])
      .then(([dash, hist]) => { setD(dash); setHistorico(hist); })
      .catch((err) => setErro(err.message));
  }, []);

  const b = d?.bigNumbers;
  const dificeis = (d?.desempenhoPorCategoria || []).filter((c) => c.percentualAcerto < 75);

  return (
    <div className="dash-shell">
      <Sidebar />
      <main className="dash-main">
        <div className="page-header">
          <div>
            <h1>Análise de desempenho</h1>
            <p>Acompanhe sua evolução por categoria e veja onde vale a pena revisar.</p>
          </div>
        </div>
        {erro && <p className="alert-error">{erro}</p>}
        {!d && !erro && <p className="empty-state">Carregando...</p>}
        {d && (
          <>
            <div className="mini-stat-grid">
              <MiniStat icon={BarChart3} label="Média geral" valor={b.tentativas ? `${nota(b.mediaAcertos)} / 10` : "-"} />
              <MiniStat icon={BookOpen} label="Quizzes respondidos" valor={b.quizzesConcluidos}
                extra={<small className="panel-sub">em {b.tentativas} tentativa{b.tentativas === 1 ? "" : "s"}</small>} />
              <MiniStat icon={Star} label="Melhor nota" valor={b.tentativas ? `${nota(b.melhorPercentual)}${b.melhorPercentual >= 100 ? " (perfeito)" : ""}` : "-"} />
            </div>

            <div className="panel">
              <h3>Média por categoria</h3>
              <p className="panel-sub">Nota de 0 a 10 em cada assunto</p>
              <ColunasCategorias itens={d.desempenhoPorCategoria} rotulo={(c) => c.categoria}
                valor={(c) => c.percentualAcerto / 10} formatar={(v) => v.toFixed(1)} />
            </div>

            <h3 style={{ margin: "26px 0 12px" }}>Conteúdos com maior dificuldade</h3>
            {dificeis.length === 0 ? (
              <div className="panel"><p className="empty-state">{b.tentativas ? "Nenhuma categoria abaixo de 7,5. Continue assim! 🎉" : "Responda quizzes para ver sua análise."}</p></div>
            ) : dificeis.map((c) => {
              const st = situacao(c.percentualAcerto);
              return (
                <div className="panel linha-dificuldade" key={c.categoria}>
                  <span className={`status ${st.classe}`}>{st.texto}</span>
                  <div style={{ flex: 1 }}>
                    <strong>{c.categoria}</strong>
                    <p className="panel-sub">Dica: você errou {c.erros} de {c.respostas} questões. Revise o conteúdo e refaça os quizzes de {c.categoria}.</p>
                  </div>
                  <strong style={{ color: st.classe === "critico" ? "var(--color-danger)" : "#b45309", whiteSpace: "nowrap" }}>
                    Nota: {nota(c.percentualAcerto)} / 10
                  </strong>
                </div>
              );
            })}

            <div className="panel-grid-2">
              <div className="panel">
                <h3>Evolução</h3>
                <p className="panel-sub">Percentual de acertos nas últimas tentativas</p>
                <GraficoLinha pontos={d.evolucao} rotulo={(p) => p.rotulo} valor={(p) => p.percentual}
                  dica={(p) => `${p.quiz} (${p.data}): ${p.percentual}%`} />
              </div>
              <div className="panel">
                <h3>Histórico de tentativas</h3>
                <p className="panel-sub">Da mais recente para a mais antiga</p>
                {historico.length === 0 ? (
                  <p className="empty-state">Você ainda não respondeu nenhum quiz. <Link to="/aluno/quizzes">Ver quizzes</Link></p>
                ) : (
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead><tr><th>Quiz</th><th className="num">Nota</th><th className="num">XP</th><th className="num">Tempo</th></tr></thead>
                      <tbody>
                        {historico.map((t) => (
                          <tr key={t.tentativaId}>
                            <td>
                              <strong style={{ fontSize: 13.5 }}>{t.quizTitulo}</strong>
                              <div className="panel-sub">{new Date(t.concluidaEm).toLocaleDateString("pt-BR")} · {t.acertos}/{t.totalQuestoes} acertos{!t.primeiraTentativa && " · refeito"}</div>
                            </td>
                            <td className="num"><strong>{nota(t.percentual)}</strong></td>
                            <td className="num">{t.xpGanho > 0 ? `+${t.xpGanho}` : "0"}</td>
                            <td className="num" style={{ fontSize: 12.5 }}>{t.tempoSegundos != null ? formatarTempo(t.tempoSegundos).replace(" minutos", " min").replace(" minuto", " min").replace(" segundos", "s").replace(" segundo", "s").replace(" e ", " ") : "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export function MiniStat({ icon: Icon, label, valor, extra, cor = "var(--color-primary)", fundo = "var(--color-primary-soft)" }) {
  return (
    <div className="panel mini-stat">
      <span className="mini-stat-icon" style={{ background: fundo, color: cor }}><Icon size={19} /></span>
      <div>
        <div className="mini-stat-label">{label}</div>
        <div className="mini-stat-value">{valor}{extra}</div>
      </div>
    </div>
  );
}
