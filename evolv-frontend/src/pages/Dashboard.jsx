import { Flame, ListChecks, Trophy, Target, FileQuestion } from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import StatCard from "../components/StatCard.jsx";

const categorias = [
  { nome: "Matemática", acerto: 78, cor: "var(--color-success)" },
  { nome: "Português", acerto: 64, cor: "var(--color-primary)" },
  { nome: "Ciências", acerto: 52, cor: "var(--color-xp)" },
  { nome: "História", acerto: 41, cor: "var(--color-danger)" },
];

const quizzesPendentes = [
  { titulo: "Frações e decimais", turma: "6º ano B · Matemática", prazo: "Vence hoje" },
  { titulo: "Interpretação de texto", turma: "6º ano B · Português", prazo: "Vence amanhã" },
  { titulo: "Sistema solar", turma: "6º ano B · Ciências", prazo: "Vence em 3 dias" },
];

const ranking = [
  { pos: 1, nome: "Beatriz Alves", xp: "2.480 XP" },
  { pos: 2, nome: "Lucas Ferreira", xp: "2.310 XP" },
  { pos: 3, nome: "Você", xp: "2.150 XP", eu: true },
  { pos: 4, nome: "João Pedro", xp: "1.980 XP" },
];

export default function Dashboard() {
  return (
    <div className="dash-shell">
      <Sidebar />

      <main className="dash-main">
        <div className="dash-topbar">
          <div>
            <h1>Olá, Ana 👋</h1>
            <p className="dash-topbar-sub">Aqui está o seu progresso desta semana.</p>
          </div>

          <div className="level-badge">
            <div className="level-badge-circle">7</div>
            <div className="level-badge-text">
              <strong>Nível 7</strong>
              <span>820 / 1000 XP</span>
            </div>
          </div>
        </div>

        <div className="stat-grid">
          <StatCard
            icon={Flame}
            iconBg="var(--color-xp-soft)"
            iconColor="var(--color-xp)"
            value="820 XP"
            label="Pontos nesta semana"
          />
          <StatCard
            icon={ListChecks}
            iconBg="var(--color-primary-soft)"
            iconColor="var(--color-primary)"
            value="3"
            label="Quizzes pendentes"
          />
          <StatCard
            icon={Trophy}
            iconBg="var(--color-success-soft)"
            iconColor="var(--color-success)"
            value="3º lugar"
            label="Ranking da turma"
          />
          <StatCard
            icon={Target}
            iconBg="var(--color-danger-soft)"
            iconColor="var(--color-danger)"
            value="História"
            label="Maior dificuldade"
          />
        </div>

        <div className="panel-grid">
          <div className="panel">
            <h3>Desempenho por categoria</h3>
            <p className="panel-sub">Percentual de acertos nos últimos 30 dias</p>

            {categorias.map((cat) => (
              <div className="category-row" key={cat.nome}>
                <span className="category-row-label">{cat.nome}</span>
                <div className="category-bar-track">
                  <div
                    className="category-bar-fill"
                    style={{ width: `${cat.acerto}%`, background: cat.cor }}
                  />
                </div>
                <span className="category-row-value">{cat.acerto}%</span>
              </div>
            ))}
          </div>

          <div className="panel">
            <h3>Quizzes pendentes</h3>
            <p className="panel-sub">Atividades liberadas pelos professores</p>

            {quizzesPendentes.map((quiz) => (
              <div className="quiz-item" key={quiz.titulo}>
                <div className="quiz-item-icon">
                  <FileQuestion size={17} strokeWidth={2.2} />
                </div>
                <div>
                  <div className="quiz-item-title">{quiz.titulo}</div>
                  <div className="quiz-item-meta">{quiz.turma}</div>
                </div>
                <div className="quiz-item-cta">{quiz.prazo}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel" style={{ marginTop: 20, maxWidth: 420 }}>
          <h3>Ranking da turma</h3>
          <p className="panel-sub">Top XP · 6º ano B</p>

          {ranking.map((r) => (
            <div className={`rank-row ${r.eu ? "is-me" : ""}`} key={r.pos}>
              <span className="rank-position">{r.pos}</span>
              <span className="rank-avatar">{r.nome.charAt(0)}</span>
              <span className="rank-name">{r.nome}</span>
              <span className="rank-xp">{r.xp}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
