import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import { dashboardApi } from "../services/api.js";
import { situacao } from "../utils.jsx";

/**
 * RF11 - Análise de erros: questões com maior índice de erro e categorias
 * em situação crítica. O sistema apresenta os dados; a decisão pedagógica
 * continua sendo do professor.
 */
export default function Analise() {
  const [d, setD] = useState(null);
  const [erro, setErro] = useState("");
  const [selecionada, setSelecionada] = useState(null);

  useEffect(() => {
    dashboardApi.professor().then(setD).catch((err) => setErro(err.message));
  }, []);

  const questoes = d?.questoesComMaisErros || [];
  const top = questoes.slice(0, 6);

  return (
    <div className="dash-shell">
      <Sidebar />
      <main className="dash-main">
        <div className="page-header">
          <div>
            <h1>Análise detalhada</h1>
            <p>Identifique as questões e os conteúdos em que os alunos mais erram.</p>
          </div>
        </div>
        {erro && <p className="alert-error">{erro}</p>}
        {!d && !erro && <p className="empty-state">Carregando...</p>}
        {d && (
          <>
            <div className="panel-grid">
              <div className="panel">
                <h3>Questões com maior índice de erros</h3>
                <p className="panel-sub">Passe o mouse ou clique em uma barra para ver a questão</p>
                {top.length === 0 ? <p className="empty-state">Nenhuma resposta incorreta registrada ainda.</p> : (
                  <div className="barras-erro">
                    {top.map((q, i) => (
                      <button key={q.questaoId} className={`barra-erro ${selecionada === i ? "sel" : ""}`} onClick={() => setSelecionada(i)} title={q.enunciado}>
                        <div className="barra-erro-trilho">
                          <div className="barra-erro-valor" style={{ height: `${Math.max(6, q.percentualErro)}%`, background: q.percentualErro >= 60 ? "var(--color-danger)" : q.percentualErro >= 40 ? "var(--color-xp)" : "var(--color-success)" }} />
                        </div>
                        <strong>Q{i + 1}</strong>
                        <span>{q.percentualErro}% erros</span>
                      </button>
                    ))}
                  </div>
                )}
                {selecionada != null && top[selecionada] && (
                  <div className="questao-detalhe">
                    <strong>Q{selecionada + 1}. {top[selecionada].enunciado}</strong>
                    <p className="panel-sub">{top[selecionada].quiz} · {top[selecionada].categoria} · {top[selecionada].erros} erro(s) em {top[selecionada].respostas} resposta(s)</p>
                  </div>
                )}
              </div>
              <div className="panel">
                <h3>Como ler esta análise</h3>
                <div className="dica roxa">
                  <strong>QUESTÕES</strong>
                  <p>A taxa de erro é o número de respostas erradas dividido pelo total de respostas de cada questão.</p>
                </div>
                <div className="dica verde">
                  <strong>SITUAÇÃO DAS CATEGORIAS</strong>
                  <p>Crítico: menos de 60% de acerto. Atenção: de 60% a 75%. Normal: acima de 75%.</p>
                </div>
                <p className="panel-sub" style={{ marginTop: 10 }}>O EVOLV apenas aponta os dados; cabe ao professor decidir a ação pedagógica (revisão, nova atividade etc.).</p>
              </div>
            </div>

            <div className="panel" style={{ marginTop: 20 }}>
              <h3>Tópicos críticos por categoria</h3>
              <p className="panel-sub">Índice de erros de cada categoria</p>
              {d.desempenhoPorCategoria.length === 0 ? <p className="empty-state">Sem respostas ainda.</p> : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead><tr><th>Categoria</th><th className="num">Índice de erros</th><th className="num">Respostas</th><th>Status</th></tr></thead>
                    <tbody>
                      {d.desempenhoPorCategoria.map((c) => {
                        const st = situacao(c.percentualAcerto);
                        return (
                          <tr key={c.categoria}>
                            <td><strong>{c.categoria}</strong></td>
                            <td className="num"><strong>{Math.round(1000 - c.percentualAcerto * 10) / 10}%</strong></td>
                            <td className="num">{c.respostas}</td>
                            <td><span className={`status ${st.classe}`}>{st.texto}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="panel" style={{ marginTop: 20 }}>
              <h3>Todas as questões com erros</h3>
              <p className="panel-sub">Até 10 questões, da maior para a menor taxa de erro</p>
              {questoes.length === 0 ? <p className="empty-state">Nenhuma resposta incorreta registrada ainda.</p> : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead><tr><th>Questão</th><th>Quiz / categoria</th><th className="num">Erros</th><th className="num">Taxa</th></tr></thead>
                    <tbody>
                      {questoes.map((q) => (
                        <tr key={q.questaoId}>
                          <td>{q.enunciado}</td>
                          <td><span className="panel-sub">{q.quiz}</span><br /><span className="eyebrow">{q.categoria}</span></td>
                          <td className="num">{q.erros} de {q.respostas}</td>
                          <td className="num"><span className={`status ${q.percentualErro >= 60 ? "critico" : q.percentualErro >= 40 ? "atencao" : "normal"}`}>{q.percentualErro}%</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
