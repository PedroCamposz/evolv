import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Categorias from "./pages/Categorias.jsx";
import CriarQuiz from "./pages/CriarQuiz.jsx";
import Quizzes from "./pages/Quizzes.jsx";
import QuizzesAluno from "./pages/QuizzesAluno.jsx";
import ResponderQuiz from "./pages/ResponderQuiz.jsx";
import Desempenho from "./pages/Desempenho.jsx";
import Analise from "./pages/Analise.jsx";
import TrocarSenha from "./pages/TrocarSenha.jsx";
import Ranking from "./pages/Ranking.jsx";
import Perfil from "./pages/Perfil.jsx";
import Usuarios from "./pages/Usuarios.jsx";
import Auditoria from "./pages/Auditoria.jsx";
import Termos from "./pages/Termos.jsx";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

const GESTAO = ["PROFESSOR", "ADMIN"];

function Protegida({ perfis, children }) {
  return <ProtectedRoute perfis={perfis}>{children}</ProtectedRoute>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Register />} />
      <Route path="/termos" element={<Termos />} />
      <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
      <Route path="/trocar-senha" element={<TrocarSenha />} />

      {/* Qualquer perfil logado */}
      <Route path="/dashboard" element={<Protegida><Dashboard /></Protegida>} />
      <Route path="/ranking" element={<Protegida><Ranking /></Protegida>} />
      <Route path="/perfil" element={<Protegida><Perfil /></Protegida>} />

      {/* Aluno (RF06, RF07, RF08) */}
      <Route path="/aluno/quizzes" element={<Protegida perfis={["ALUNO"]}><QuizzesAluno /></Protegida>} />
      <Route path="/aluno/quizzes/:id" element={<Protegida perfis={["ALUNO"]}><ResponderQuiz /></Protegida>} />
      <Route path="/desempenho" element={<Protegida perfis={["ALUNO"]}><Desempenho /></Protegida>} />
      {/* O histórico (RF08) agora fica dentro de "Desempenho". */}
      <Route path="/historico" element={<Navigate to="/desempenho" replace />} />

      {/* Professor e admin */}
      <Route path="/categorias" element={<Protegida perfis={GESTAO}><Categorias /></Protegida>} />
      <Route path="/quizzes" element={<Protegida perfis={GESTAO}><Quizzes /></Protegida>} />
      <Route path="/quizzes/novo" element={<Protegida perfis={GESTAO}><CriarQuiz /></Protegida>} />
      <Route path="/analise" element={<Protegida perfis={GESTAO}><Analise /></Protegida>} />

      {/* Somente admin */}
      <Route path="/usuarios" element={<Protegida perfis={["ADMIN"]}><Usuarios /></Protegida>} />
      <Route path="/auditoria" element={<Protegida perfis={["ADMIN"]}><Auditoria /></Protegida>} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
