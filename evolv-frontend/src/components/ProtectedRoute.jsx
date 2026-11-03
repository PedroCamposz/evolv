import { Navigate } from "react-router-dom";
import { sessao } from "../services/api.js";

/**
 * Bloqueia a rota para quem não está logado e, se "perfis" for informado,
 * também para quem não tem um dos perfis permitidos (RF02). A proteção real
 * fica no back-end (SecurityConfig); aqui é só para não mostrar telas que o
 * usuário não pode usar.
 */
export default function ProtectedRoute({ children, perfis }) {
  if (!sessao.estaLogado()) {
    return <Navigate to="/login" replace />;
  }
  // Entrou com senha temporária: primeiro precisa criar a própria senha.
  if (sessao.precisaTrocarSenha()) {
    return <Navigate to="/trocar-senha" replace />;
  }
  const perfil = sessao.getUsuario()?.perfil;
  if (perfis && !perfis.includes(perfil)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
