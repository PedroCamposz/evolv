import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Flame, BookOpen, Target, Trophy, Users, PlayCircle, CheckCircle2, GraduationCap, Presentation,
  CircleHelp, Zap, FileText, ChevronRight, UserPlus, ShieldAlert, FolderPlus, LogIn, Activity,
} from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import { BarrasHorizontais, GraficoLinha, GraficoColunas, LinhasMultiplas, Rosca, corPorPercentual } from "../components/Charts.jsx";
import { MiniStat } from "./Desempenho.jsx";
import { dashboardApi, sessao } from "../services/api.js";
import { Avatar, nota } from "../utils.jsx";

/**
 * RF10 - Dashboard. Cada perfil vê o seu: aluno (progresso e gamificação),
 * professor (desempenho da turma) e administrador (uso da plataforma).
 * Todos os números vêm da API (/api/dashboard/...).
 */
export default function Dashboard() {
  const usuario = sessao.getUsuario();
  const perfil = usuario?.perfil;
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const chamada = perfil === "ALUNO" ? dashboardApi.aluno() : perfil === "ADMIN" ? dashboardApi.admin() : dashboardApi.professor();
    chamada.then(setDados).catch((err) => setErro(err.message || "Não foi possível carregar o dashboard."));
  }, [perfil]);

  const primeiroNome = usuario?.nome?.trim().split(" ").find((p) => !/^prof\.?$/i.test(p)) || "visitante";

  return (
    <div className="dash-shell">
      <Sidebar />
      <main className="dash-main">
        {erro && <p className="alert-error">{erro}</p>}
        {!dados && !erro && <p className="empty-state">Carregando dashboard...</p>}
        {dados && perfil === "ALUNO" && <DashboardAluno dados={dados} nome={primeiroNome} />}
        {dados && perfil === "PROFESSOR" && <DashboardProfessor dados={dados} />}
        {dados && perfil === "ADMIN" && <DashboardAdmin dados={dados} />}
      </main>
    </div>
  );
}

function DashboardAluno({ dados, nome }) {
  const b = dados.bigNumbers;
  return (
    <>
      <div className="dash-topbar">
        <div>
          <h1>Olá, {nome} 👋</h1>
          <p className="dash-topbar-sub">Aqui está o seu progresso no EVOLV.</p>
        </div>
        <div className="nivel-card">
          <span className="nivel-numero">{b.nivel}</span>
          <div style={{ flex: 1 }}>
            <strong>Nível {b.nivel}</strong>
            <span className="panel-sub" style={{ display: "block" }}>{b.xpPorNivel - b.xpNoNivel} XP para o nível {b.nivel + 1}</span>
            <div className="progress-track" style={{ marginTop: 6, height: 7 }}>
              <div className="progress-fill" style={{ width: `${(b.xpNoNivel / b.xpPorNivel) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="mini-stat-grid">
        <MiniStat icon={Flame} label="XP acumulado" valor={`${b.xpTotal} XP`} cor="var(--color-xp)" fundo="var(--color-xp-soft)" />
        <MiniStat icon={BookOpen} label="Quizzes concluídos" valor={b.quizzesConcluidos}
          extra={b.quizzesPendentes > 0 && <small style={{ color: "#b45309" }}>{b.quizzesPendentes} pendente(s)</small>} />
        <MiniStat icon={Target} label="Média de acertos" valor={b.tentativas ? `${b.mediaAcertos}%` : "-"} cor="var(--color-success)" fundo="var(--color-success-soft)" />
        <MiniStat icon={Trophy} label="Ranking" valor={b.posicaoRanking ? `${b.posicaoRanking}º lugar` : "-"}
          extra={<small className="panel-sub">de {b.totalAlunosRanking}</small>} cor="var(--color-danger)" fundo="var(--color-danger-soft)" />
      </div>

      <div className="panel-grid">
        <div className="panel">
          <h3>Evolução dos acertos</h3>
          <p className="panel-sub">Percentual de acertos nas suas últimas tentativas</p>
          <GraficoLinha pontos={dados.evolucao} rotulo={(p) => p.rotulo} valor={(p) => p.percentual}
            dica={(p) => `${p.quiz} (${p.data}): ${p.percentual}%`} />
        </div>
        <div className="panel">
          <h3>Desempenho por categoria</h3>
          <p className="panel-sub">
            {b.maiorDificuldade ? <>Maior dificuldade: <strong>{b.maiorDificuldade}</strong></> : "Percentual de acertos por assunto"}
          </p>
          <BarrasHorizontais itens={dados.desempenhoPorCategoria} rotulo={(c) => c.categoria}
            valor={(c) => c.percentualAcerto} cor={(c) => corPorPercentual(c.percentualAcerto)} />
          <Link to="/desempenho" className="link-btn" style={{ display: "inline-block", marginTop: 12 }}>Ver desempenho detalhado</Link>
        </div>
      </div>

      <div className="panel-grid-2">
        <div className="panel">
          <h3>Quizzes pendentes</h3>
          <p className="panel-sub">Liberados pelos professores e ainda não respondidos</p>
          {dados.quizzesPendentes.length === 0 ? (
            <p className="empty-state">Nenhum quiz pendente. 🎉</p>
          ) : dados.quizzesPendentes.map((q) => (
            <Link to={`/aluno/quizzes/${q.id}`} className="linha-quiz" key={q.id}>
              <span className="mini-stat-icon" style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)", width: 38, height: 38 }}><FileText size={17} /></span>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: 14 }}>{q.titulo}</strong>
                <div className="panel-sub">{q.categoria} · {q.totalQuestoes} questões · até {q.xpMaximo} XP</div>
              </div>
              <ChevronRight size={18} color="var(--color-text-muted)" />
            </Link>
          ))}
        </div>
        <div className="panel">
          <h3>Ranking</h3>
          <p className="panel-sub">Top 5 por XP</p>
          <RankingCompacto itens={dados.rankingTop5} />
          <Link to="/ranking" className="link-btn" style={{ display: "inline-block", marginTop: 10 }}>Ver ranking e conquistas</Link>
        </div>
      </div>
    </>
  );
}

function DashboardProfessor({ dados }) {
  const b = dados.bigNumbers;
  return (
    <>
      <div className="dash-topbar">
        <div>
          <h1>Painel geral do professor</h1>
          <p className="dash-topbar-sub">Veja o engajamento e o desempenho geral dos alunos.</p>
        </div>
        <Link to="/quizzes/novo" className="btn btn-primary" style={{ textDecoration: "none" }}>+ Criar quiz</Link>
      </div>

      <div className="mini-stat-grid">
        <MiniStat icon={Users} label="Alunos que responderam" valor={b.alunosQueResponderam}
          extra={<small className="panel-sub">de {b.alunosAtivos} ativos</small>} />
        <MiniStat icon={BookOpen} label="Quizzes publicados" valor={b.quizzesDisponiveis}
          extra={<small className="panel-sub">de {b.quizzesCriados} criados</small>} cor="var(--color-xp)" fundo="var(--color-xp-soft)" />
        <MiniStat icon={CheckCircle2} label="Média geral dos alunos" valor={b.tentativas ? `${nota(b.mediaAcertos)} / 10` : "-"} cor="var(--color-success)" fundo="var(--color-success-soft)" />
        <MiniStat icon={PlayCircle} label="Tentativas realizadas" valor={b.tentativas} cor="#0ea5e9" fundo="#e0f2fe" />
      </div>

      <div className="panel-grid">
        <div className="panel">
          <h3>Resultados recentes de alunos</h3>
          <p className="panel-sub">Últimas tentativas concluídas</p>
          {dados.resultadosRecentes.length === 0 ? <p className="empty-state">Nenhuma tentativa ainda.</p> : (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Aluno</th><th>Quiz</th><th className="num">Nota</th><th className="num">Data</th></tr></thead>
                <tbody>
                  {dados.resultadosRecentes.map((r) => (
                    <tr key={r.tentativaId}>
                      <td>{r.aluno}</td>
                      <td className="panel-sub">{r.quiz}</td>
                      <td className="num"><span className={`status ${r.percentual >= 75 ? "normal" : r.percentual >= 60 ? "atencao" : "critico"}`}>{nota(r.percentual)} / 10</span></td>
                      <td className="num panel-sub">{new Date(r.concluidaEm).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="panel">
          <h3>Acertos por categoria</h3>
          <p className="panel-sub">Da categoria com mais dificuldade para a com menos</p>
          <BarrasHorizontais itens={dados.desempenhoPorCategoria} rotulo={(c) => c.categoria}
            valor={(c) => c.percentualAcerto} cor={(c) => corPorPercentual(c.percentualAcerto)} />
          <Link to="/analise" className="link-btn" style={{ display: "inline-block", marginTop: 12 }}>Ver análise de erros</Link>
        </div>
      </div>

      <div className="panel-grid-2">
        <div className="panel">
          <h3>Atividade</h3>
          <p className="panel-sub">Tentativas concluídas por dia (últimos 14 dias)</p>
          <GraficoColunas itens={dados.atividadeUltimos14Dias} rotulo={(d) => d.data} valor={(d) => d.tentativas} />
        </div>
        <div className="panel">
          <h3>Ranking dos alunos</h3>
          <p className="panel-sub">Top 5 por XP</p>
          <RankingCompacto itens={dados.rankingTop5} />
        </div>
      </div>
    </>
  );
}

const ICONE_ACAO = {
  LOGIN: [LogIn, "#6c5ce7"], CADASTRO_USUARIO: [UserPlus, "#0ea5e9"], CRIAR_USUARIO: [UserPlus, "#0ea5e9"],
  CONCLUIR_QUIZ: [CheckCircle2, "#16a34a"], DESATIVAR_USUARIO: [ShieldAlert, "#ef4444"], ALTERAR_PERFIL: [ShieldAlert, "#f59e0b"],
  CRIAR: [FolderPlus, "#f59e0b"], DISPONIBILIZAR: [Zap, "#6c5ce7"],
};

function DashboardAdmin({ dados }) {
  const b = dados.bigNumbers, p = dados.distribuicaoPerfis;
  const total = p.ALUNO + p.PROFESSOR + p.ADMIN;
  const pct = (v) => (total ? Math.round((v * 100) / total) : 0);
  const fatias = [
    { nome: "Alunos", valor: p.ALUNO, cor: "#6c5ce7" },
    { nome: "Professores", valor: p.PROFESSOR, cor: "#f59e0b" },
    { nome: "Admins", valor: p.ADMIN, cor: "#ef4444" },
  ];
  return (
    <>
      <div className="dash-topbar">
        <div>
          <h1>Painel geral do administrador</h1>
          <p className="dash-topbar-sub">Acompanhe os usuários, o uso da plataforma e as atividades recentes.</p>
        </div>
      </div>

      <div className="mini-stat-grid">
        <MiniStat icon={Users} label="Total de usuários" valor={b.totalUsuarios} />
        <MiniStat icon={GraduationCap} label="Alunos ativos" valor={b.alunosAtivos} cor="#0ea5e9" fundo="#e0f2fe" />
        <MiniStat icon={Presentation} label="Professores" valor={b.professores} cor="var(--color-xp)" fundo="var(--color-xp-soft)" />
        <MiniStat icon={CircleHelp} label="Quizzes ativos" valor={b.quizzesAtivos} cor="var(--color-success)" fundo="var(--color-success-soft)" />
        <MiniStat icon={Zap} label="Realizados hoje" valor={b.realizadosHoje} cor="var(--color-danger)" fundo="var(--color-danger-soft)" />
      </div>

      <div className="admin-grid">
        <div className="panel">
          <h3>Acessos e respostas</h3>
          <p className="panel-sub">Logins e tentativas por dia (últimos 30 dias)</p>
          <LinhasMultiplas itens={dados.atividade30Dias} rotulo={(d) => d.data} series={[
            { nome: "Acessos (logins)", valor: (d) => d.acessos, cor: "#6c5ce7" },
            { nome: "Respostas (tentativas)", valor: (d) => d.respostas, cor: "#f59e0b" },
          ]} />
        </div>
        <div className="panel">
          <h3>Distribuição de perfis</h3>
          <p className="panel-sub">Usuários cadastrados</p>
          <div style={{ margin: "14px 0" }}><Rosca fatias={fatias} total={total} legenda="usuários" /></div>
          {fatias.map((f) => (
            <div key={f.nome} className="linha-legenda">
              <span><i style={{ background: f.cor }} />{f.nome}</span>
              <strong>{f.valor} ({pct(f.valor)}%)</strong>
            </div>
          ))}
        </div>
        <div className="panel">
          <h3>Atividades recentes</h3>
          <p className="panel-sub">Últimos registros de auditoria</p>
          {dados.atividadesRecentes.map((a, i) => {
            const [Icone, cor] = ICONE_ACAO[a.acao] || [Activity, "#6e7087"];
            return (
              <div className="atividade" key={i}>
                <span className="atividade-icone" style={{ color: cor, background: `${cor}1a` }}><Icone size={15} /></span>
                <div>
                  <p><strong>{a.acao.replaceAll("_", " ").toLowerCase()}</strong> · {a.usuario}</p>
                  <span className="panel-sub">{a.detalhes} · {new Date(a.dataHora).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>
            );
          })}
          <Link to="/auditoria" className="link-btn" style={{ display: "inline-block", marginTop: 8 }}>Ver todos os logs</Link>
        </div>
      </div>
    </>
  );
}

export function RankingCompacto({ itens }) {
  const eu = sessao.getUsuario()?.id;
  if (!itens?.length) return <p className="empty-state">Nenhum aluno no ranking ainda.</p>;
  return itens.map((r) => (
    <div className={`ranking-linha ${r.usuarioId === eu ? "eu" : ""}`} key={r.usuarioId} style={{ padding: "9px 10px" }}>
      <strong style={{ width: 26 }}>{r.posicao}</strong>
      <Avatar nome={r.nome} tamanho={30} />
      <span style={{ flex: 1 }}>{r.usuarioId === eu ? `${r.nome} (você)` : r.nome}</span>
      <strong style={{ color: "var(--color-primary)", fontSize: 13.5 }}>{r.xpTotal} XP</strong>
    </div>
  ));
}
