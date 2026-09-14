import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Categorias from "./pages/Categorias.jsx";
import CriarQuiz from "./pages/CriarQuiz.jsx";
import Quizzes from "./pages/Quizzes.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/categorias" element={<Categorias />} />
      <Route path="/quizzes" element={<Quizzes />} />
      <Route path="/quizzes/novo" element={<CriarQuiz />} />
    </Routes>
  );
}
