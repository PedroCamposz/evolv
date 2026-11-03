import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Award } from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import { gamificacaoApi } from "../services/api.js";
import { Avatar } from "../utils.jsx";

const NOME_PERFIL = { ALUNO: "Aluno", PROFESSOR: "Professor", ADMIN: "Administrador" };

/** Perfil do usuário: dados da conta e, para o aluno, nível e XP (RF09). */
export default function Perfil() {
  const [p, setP] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    gamificacaoApi.meuPerfil().then(setP).catch((err) => setErro(err.message));
  }, []);

  return (
    <div className="dash-shell">
      <Sidebar />
      <main className="dash-main">
        <div className="page-header">
          <div>
            <h1>Meu perfil</h1>
            <p>Seus dados de acesso{p?.perfil === "ALUNO" ? " e sua evolução na plataforma" : ""}.</p>
          </div>
        </div>
        {erro && <p className="alert-error">{erro}</p>}
        {!p && !erro && <p className="empty-state">Carregando...</p>}
        {p && (
          <div className="panel-grid-2" style={{ marginTop: 0 }}>
            <div className="panel">
              <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 18 }}>
                <Avatar nome={p.nome} tamanho={64} />
                <div>
                  <h3 style={{ fontSize: 19 }}>{p.nome}</h3>
                  <span className="pill roxo" style={{ marginTop: 6 }}>{NOME_PERFIL[p.perfil]}</span>
                </div>
              </div>
              <p><strong>E-mail:</strong> {p.email}</p>
              <p className="panel-sub" style={{ marginTop: 14, lineHeight: 1.6 }}>
                Seu nome e e-mail são usados apenas para identificação e login (LGPD). Veja a{" "}
                <Link to="/politica-privacidade" target="_blank" rel="noopener noreferrer">Política de Privacidade</Link> e os{" "}
                <Link to="/termos" target="_blank" rel="noopener noreferrer">Termos de Uso</Link>.
              </p>
            </div>
            {p.perfil === "ALUNO" && (
              <div className="panel">
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <span className="nivel-numero" style={{ width: 56, height: 56, fontSize: 22 }}>{p.nivel}</span>
                  <div>
                    <h3>Nível {p.nivel}</h3>
                    <p className="panel-sub">{p.xpTotal} XP acumulados{p.posicaoRanking ? ` · ${p.posicaoRanking}º no ranking` : ""}</p>
                  </div>
                </div>
                <div className="progress-track" style={{ marginTop: 16 }}><div className="progress-fill" style={{ width: `${(p.xpNoNivel / p.xpPorNivel) * 100}%` }} /></div>
                <p className="panel-sub" style={{ marginTop: 8 }}>Faltam {p.xpPorNivel - p.xpNoNivel} XP para o nível {p.nivel + 1}</p>
                <p className="panel-sub" style={{ marginTop: 12 }}>Como ganhar XP: 10 XP por concluir um quiz + 5 XP por acerto, em cada tentativa.</p>
                <Link to="/ranking" className="btn btn-soft" style={{ marginTop: 16, textDecoration: "none" }}>
                  <Award size={16} /> Ver minhas conquistas ({p.conquistas.filter((c) => c.obtida).length}/{p.conquistas.length})
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
