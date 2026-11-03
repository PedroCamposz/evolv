import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, BarChart3, Trophy, User, LogOut, CirclePlus,
  FolderKanban, Users, ScrollText, Microscope, Menu, Zap,
} from "lucide-react";
import { gamificacaoApi, sessao } from "../services/api.js";
import { Avatar } from "../utils.jsx";

// Menu montado conforme o perfil (RF02). A proteção de verdade está no
// back-end; aqui só escondemos o que o usuário não pode usar.
const MENU = {
  ALUNO: [
    { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
    { icon: BookOpen, label: "Quizzes", to: "/aluno/quizzes" },
    { icon: BarChart3, label: "Desempenho", to: "/desempenho" },
    { icon: Trophy, label: "Ranking e conquistas", to: "/ranking" },
    { icon: User, label: "Perfil", to: "/perfil" },
  ],
  PROFESSOR: [
    { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
    { icon: BookOpen, label: "Meus quizzes", to: "/quizzes" },
    { icon: CirclePlus, label: "Criar quiz", to: "/quizzes/novo" },
    { icon: FolderKanban, label: "Categorias", to: "/categorias" },
    { icon: Microscope, label: "Análise", to: "/analise" },
    { icon: Trophy, label: "Ranking", to: "/ranking" },
    { icon: User, label: "Perfil", to: "/perfil" },
  ],
  ADMIN: [
    { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
    { icon: Users, label: "Usuários", to: "/usuarios" },
    { icon: FolderKanban, label: "Categorias", to: "/categorias" },
    { icon: BookOpen, label: "Quizzes", to: "/quizzes" },
    { icon: Microscope, label: "Análise", to: "/analise" },
    { icon: ScrollText, label: "Logs de auditoria", to: "/auditoria" },
    { icon: User, label: "Perfil", to: "/perfil" },
  ],
};

// Confere o perfil no servidor só uma vez por carregamento da página.
let perfilConferido = false;

const NOME_PERFIL = { ALUNO: "Aluno", PROFESSOR: "Professor", ADMIN: "Administrador" };

export function Brand() {
  return (
    <Link to="/dashboard" className="brand">
      <span className="brand-icon"><Zap size={17} strokeWidth={2.6} fill="currentColor" /></span>
      EVOLV
    </Link>
  );
}

/**
 * Cabeçalho fixo + menu lateral. Cada página continua usando
 * <div className="dash-shell"><Sidebar /> <main>...</main></div>.
 */
export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const usuario = sessao.getUsuario();
  const perfil = usuario?.perfil;
  const [aberto, setAberto] = useState(false);
  const itens = MENU[perfil] || [];

  function sair() {
    sessao.limpar();
    navigate("/login");
  }

  // Item ativo = o que tem o caminho mais específico que combina com a URL.
  const combina = (to) => location.pathname === to || location.pathname.startsWith(to + "/");
  const itemAtivo = itens.filter((i) => combina(i.to)).sort((a, b) => b.to.length - a.to.length)[0]?.to;
  const ativo = (to) => to === itemAtivo;

  // Se o admin mudou o perfil desta conta, atualiza a sessão (menu e permissões).
  useEffect(() => {
    if (!usuario || perfilConferido) return;
    perfilConferido = true;
    gamificacaoApi.meuPerfil()
      .then((p) => {
        if (p?.perfil && p.perfil !== usuario.perfil) {
          sessao.atualizarPerfil(p.perfil);
          window.location.assign("/dashboard");
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <header className="app-header">
        <div className="app-header-left">
          <button className="icon-btn menu-btn" onClick={() => setAberto(!aberto)} aria-label="Abrir menu">
            <Menu size={18} />
          </button>
          <Brand />
          {perfil && perfil !== "ALUNO" && (
            <span className={`role-badge ${perfil === "ADMIN" ? "admin" : ""}`}>{NOME_PERFIL[perfil].toUpperCase()}</span>
          )}
        </div>
        {usuario && (
          <div className="app-user">
            <div className="app-user-text">
              <strong>{usuario.nome}</strong>
              <span>{NOME_PERFIL[perfil]}</span>
            </div>
            <Avatar nome={usuario.nome} />
            <button className="icon-btn" onClick={sair} title="Sair" aria-label="Sair">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </header>

      <div className={`sidebar-backdrop ${aberto ? "aberto" : ""}`} onClick={() => setAberto(false)} />
      <aside className={`dash-sidebar ${aberto ? "aberto" : ""}`}>
        <nav className="dash-nav">
          {itens.map(({ icon: Icon, label, to }) => (
            <Link key={to} to={to} onClick={() => setAberto(false)} className={`dash-nav-item ${ativo(to) ? "active" : ""}`}>
              <Icon size={17} strokeWidth={2} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="dash-sidebar-footer">
          <button onClick={sair} className="dash-nav-item" style={{ background: "none", border: "none", width: "100%", cursor: "pointer", textAlign: "left" }}>
            <LogOut size={16} /> Sair
          </button>
          <div style={{ padding: "6px 12px" }}>EVOLV · versão 0.2</div>
        </div>
      </aside>
    </>
  );
}
