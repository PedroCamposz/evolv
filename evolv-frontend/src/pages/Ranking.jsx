import { useEffect, useState } from "react";
import { Crown, Award, Lock, CheckCircle2, Footprints, Target, Flame, TrendingUp } from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import { gamificacaoApi, sessao } from "../services/api.js";
import { Avatar } from "../utils.jsx";

const PERIODOS = [
  { id: "geral", label: "Geral" },
  { id: "mensal", label: "Mensal" },
  { id: "semestral", label: "Semestral" },
  { id: "anual", label: "Anual" },
];

const ICONE_CONQUISTA = { PRIMEIROS_PASSOS: Footprints, GABARITOU: Target, DEDICADO: Flame, EM_EVOLUCAO: TrendingUp };
const COR_CONQUISTA = {
  PRIMEIROS_PASSOS: ["#6c5ce7", "#a29bfe"],
  GABARITOU: ["#16a34a", "#4ade80"],
  DEDICADO: ["#f59e0b", "#fcd34d"],
  EM_EVOLUCAO: ["#0ea5e9", "#7dd3fc"],
};

/** RF09 - Ranking (geral, mensal, semestral e anual) e, para o aluno, as conquistas. */
export default function Ranking() {
  const usuario = sessao.getUsuario();
  const ehAluno = usuario?.perfil === "ALUNO";
  const [periodo, setPeriodo] = useState("geral");
  const [ranking, setRanking] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    setRanking(null);
    gamificacaoApi.ranking(periodo).then(setRanking).catch((err) => setErro(err.message));
  }, [periodo]);

  useEffect(() => {
    if (ehAluno) gamificacaoApi.meuPerfil().then(setPerfil).catch(() => {});
  }, [ehAluno]);

  const podio = ranking?.slice(0, 3) || [];
  const resto = ranking?.slice(3) || [];
  const eu = ranking?.find((r) => r.usuarioId === usuario?.id);
  const descricao = {
    geral: "XP total",
    mensal: "XP ganho neste mês",
    semestral: "XP ganho neste semestre",
    anual: "XP ganho neste ano",
  }[periodo];

  return (
    <div className="dash-shell">
      <Sidebar />
      <main className="dash-main">
        <div className="page-header">
          <div>
            <h1>Classificação geral</h1>
            <p>{ehAluno ? "Veja como você está se saindo em comparação com os outros alunos." : "Classificação dos alunos por XP."} Critério: {descricao}.</p>
          </div>
          <div className="tabs">
            {PERIODOS.map((p) => (
              <button key={p.id} className={`tab ${periodo === p.id ? "ativa" : ""}`} onClick={() => setPeriodo(p.id)}>{p.label}</button>
            ))}
          </div>
        </div>

        {erro && <p className="alert-error">{erro}</p>}
        {!ranking && !erro && <p className="empty-state">Carregando ranking...</p>}
        {ranking?.length === 0 && <div className="panel"><p className="empty-state">Nenhum aluno no ranking ainda.</p></div>}

        {podio.length > 0 && (
          <div className="podio">
            {[podio[1], podio[0], podio[2]].map((r, i) => r && (
              <div key={r.usuarioId} className={`podio-col pos-${r.posicao}`}>
                {r.posicao === 1 && <Crown className="coroa" size={26} />}
                <div className="podio-avatar"><Avatar nome={r.nome} tamanho={r.posicao === 1 ? 68 : 56} /></div>
                <strong className="podio-nome">{r.nome}{r.usuarioId === usuario?.id ? " (você)" : ""}</strong>
                <div className="podio-bloco">
                  <span className="podio-pos">{r.posicao}º</span>
                  <span className="podio-xp">{r.xpTotal.toLocaleString("pt-BR")} XP</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {resto.length > 0 && (
          <div className="panel" style={{ marginTop: 22, padding: 12 }}>
            {resto.map((r) => (
              <div key={r.usuarioId} className={`ranking-linha ${r.usuarioId === usuario?.id ? "eu" : ""}`}>
                <strong style={{ width: 40 }}>#{r.posicao}</strong>
                <Avatar nome={r.nome} tamanho={32} />
                <span style={{ flex: 1, fontWeight: 500 }}>{r.nome}{r.usuarioId === usuario?.id ? " (você)" : ""}</span>
                <span className="panel-sub" style={{ width: 70 }}>Nível {r.nivel}</span>
                <strong style={{ color: "var(--color-primary)", width: 90, textAlign: "right" }}>{r.xpTotal.toLocaleString("pt-BR")} XP</strong>
              </div>
            ))}
          </div>
        )}

        {ehAluno && eu && eu.posicao > 3 && (
          <p className="panel-sub" style={{ marginTop: 10 }}>Você está em <strong>{eu.posicao}º lugar</strong>. Responda novos quizzes para subir!</p>
        )}

        {ehAluno && perfil && (
          <section className="conquistas-secao">
            <div className="page-header" style={{ marginBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: 22, display: "flex", gap: 10, alignItems: "center" }}><Award size={22} color="var(--color-xp)" /> Suas conquistas</h2>
                <p>Acompanhe suas medalhas e metas. {perfil.conquistas.filter((c) => c.obtida).length} de {perfil.conquistas.length} desbloqueadas.</p>
              </div>
            </div>
            <div className="conquistas-grid">
              {perfil.conquistas.map((c) => {
                const Icone = ICONE_CONQUISTA[c.codigo] || Award;
                const [c1, c2] = COR_CONQUISTA[c.codigo] || ["#6c5ce7", "#a29bfe"];
                return (
                  <div key={c.codigo} className={`medalha ${c.obtida ? "" : "bloqueada"}`}>
                    <div className="medalha-topo" style={{ background: c.obtida ? `linear-gradient(135deg, ${c1}, ${c2})` : undefined }}>
                      <span className="medalha-icone">{c.obtida ? <Icone size={26} /> : <Lock size={22} />}</span>
                    </div>
                    <div className="medalha-corpo">
                      <strong>{c.nome}</strong>
                      <span className={c.obtida ? "medalha-status ok" : "medalha-status"}>{c.obtida ? "Desbloqueada" : "Bloqueada"}</span>
                      <p>{c.descricao}</p>
                      {c.obtida ? (
                        <p className="medalha-data"><CheckCircle2 size={14} /> Conquistada em {new Date(c.obtidaEm).toLocaleDateString("pt-BR")}</p>
                      ) : (
                        <div>
                          <div className="medalha-progresso-texto"><span>Progresso</span><span>{c.progresso} / {c.meta}</span></div>
                          <div className="progress-track" style={{ height: 7 }}><div className="progress-fill" style={{ width: `${(c.progresso / c.meta) * 100}%` }} /></div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
