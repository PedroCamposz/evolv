import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Categorias from "./pages/Categorias.jsx";
import CriarQuiz from "./pages/CriarQuiz.jsx";
import Quizzes from "./pages/Quizzes.jsx";
import Auditoria from "./pages/Auditoria.jsx";
import Termos from "./pages/Termos.jsx";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Register />} />
      <Route path="/termos" element={<Termos />} />
      <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/categorias"
        element={
          <ProtectedRoute>
            <Categorias />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quizzes"
        element={
          <ProtectedRoute>
            <Quizzes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quizzes/novo"
        element={
          <ProtectedRoute>
            <CriarQuiz />
          </ProtectedRoute>
        }
      />
      <Route
        path="/auditoria"
        element={
          <ProtectedRoute>
            <Auditoria />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
