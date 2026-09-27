import { Navigate } from "react-router-dom";
import { sessao } from "../services/api.js";

export default function ProtectedRoute({ children }) {
  if (!sessao.estaLogado()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
