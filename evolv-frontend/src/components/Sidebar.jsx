import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ListChecks,
  FolderKanban,
  FileQuestion,
  BarChart3,
  Trophy,
  User,
  LogOut,
} from "lucide-react";
import Logo from "./Logo.jsx";

const navItems = [
  { icon: LayoutDashboard, label: "Início", to: "/dashboard" },
  { icon: FolderKanban, label: "Categorias", to: "/categorias" },
  { icon: FileQuestion, label: "Quizzes", to: "/quizzes" },
  { icon: ListChecks, label: "Criar quiz", to: "/quizzes/novo" },
  { icon: BarChart3, label: "Desempenho", to: "/dashboard" },
  { icon: Trophy, label: "Ranking", to: "/dashboard" },
  { icon: User, label: "Perfil", to: "/dashboard" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="dash-sidebar">
      <Logo />

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
        <Link to="/login" className="dash-nav-item" style={{ padding: "10px 8px" }}>
          <LogOut size={16} strokeWidth={2.2} />
          Sair
        </Link>
        EVOLV · versão 0.1
      </div>
    </aside>
  );
}
