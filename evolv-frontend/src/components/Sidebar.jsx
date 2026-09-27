import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ListChecks,
  FolderKanban,
  FileQuestion,
  BarChart3,
  Trophy,
  User,
  LogOut,
  ScrollText,
} from "lucide-react";
import Logo from "./Logo.jsx";
import { sessao } from "../services/api.js";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const usuario = sessao.getUsuario();
  const perfil = usuario?.perfil;

  // Criar/editar categorias e quizzes é restrito a PROFESSOR/ADMIN (RBAC).
  const podeGerenciarConteudo = perfil === "PROFESSOR" || perfil === "ADMIN";
  const ehAdmin = perfil === "ADMIN";

  const navItems = [
    { icon: LayoutDashboard, label: "Início", to: "/dashboard" },
    { icon: FolderKanban, label: "Categorias", to: "/categorias" },
    { icon: FileQuestion, label: "Quizzes", to: "/quizzes" },
    podeGerenciarConteudo && { icon: ListChecks, label: "Criar quiz", to: "/quizzes/novo" },
    ehAdmin && { icon: ScrollText, label: "Logs de auditoria", to: "/auditoria" },
    { icon: BarChart3, label: "Desempenho", to: "/dashboard" },
    { icon: Trophy, label: "Ranking", to: "/dashboard" },
    { icon: User, label: "Perfil", to: "/dashboard" },
  ].filter(Boolean);

  function sair() {
    sessao.limpar();
    navigate("/login");
  }

  return (
    <aside className="dash-sidebar">
      <Logo />

      {usuario && (
        <div style={{ padding: "0 8px 14px", fontSize: 12.5, color: "var(--color-text-muted)" }}>
          {usuario.nome} · <strong>{perfil}</strong>
        </div>
      )}

      <nav className="dash-nav">
        {navItems.map(({ icon: Icon, label, to }) => (
          <Link
            key={label}
            to={to}
            className={`dash-nav-item ${location.pathname === to ? "active" : ""}`}
          >
            <Icon size={17} strokeWidth={2.2} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="dash-sidebar-footer">
        <button
          onClick={sair}
          className="dash-nav-item"
          style={{ padding: "10px 8px", background: "none", border: "none", width: "100%", cursor: "pointer", textAlign: "left" }}
        >
          <LogOut size={16} strokeWidth={2.2} />
          Sair
        </button>
        EVOLV · versão 0.1
      </div>
    </aside>
  );
}
