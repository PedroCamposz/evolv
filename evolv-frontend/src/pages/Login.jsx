import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brand } from "../components/Sidebar.jsx";
import { authApi, sessao } from "../services/api.js";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", senha: "" });
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const resposta = await authApi.login(form);
      sessao.salvar(resposta);
      navigate(resposta.trocarSenha ? "/trocar-senha" : "/dashboard");
    } catch (err) {
      setErro(err.message || "E-mail ou senha inválidos. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="auth-center">
      <form className="auth-card" onSubmit={handleSubmit}>
        <Brand />
        <h2>Entrar na sua conta</h2>
        <p className="auth-sub">Bem-vindo de volta! Continue de onde parou.</p>

        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" placeholder="voce@escola.com.br"
            value={form.email} onChange={handleChange} required autoComplete="email" />
        </div>

        <div className="field">
          <label htmlFor="senha">Senha</label>
          <input id="senha" name="senha" type="password" placeholder="Sua senha"
            value={form.senha} onChange={handleChange} required autoComplete="current-password" />
        </div>

        {erro && <p className="alert-error">{erro}</p>}

        <button className="btn btn-primary btn-block" type="submit" disabled={carregando}>
          {carregando ? "Entrando..." : "Entrar"}
        </button>

        <p className="form-switch">
          Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
        </p>
      </form>
    </div>
  );
}
