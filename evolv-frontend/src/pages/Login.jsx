import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthBrandPanel from "../components/AuthBrandPanel.jsx";

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
      // TODO: substituir pela chamada real à API (Spring Boot)
      // const res = await fetch("http://localhost:8080/api/auth/login", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(form),
      // });
      // if (!res.ok) throw new Error("Credenciais inválidas");
      // const data = await res.json();
      // localStorage.setItem("evolv_token", data.token);

      await new Promise((r) => setTimeout(r, 600));
      navigate("/dashboard");
    } catch (err) {
      setErro("E-mail ou senha inválidos. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="auth-shell">
      <AuthBrandPanel />

      <div className="auth-form-side">
        <form className="auth-form-card" onSubmit={handleSubmit}>
          <p className="form-eyebrow">Bem-vindo de volta</p>
          <h2>Entrar na sua conta</h2>

          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="voce@escola.com.br"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              name="senha"
              type="password"
              placeholder="••••••••"
              value={form.senha}
              onChange={handleChange}
              required
              minLength={8}
            />
          </div>

          <div className="form-row-inline">
            <label style={{ display: "flex", gap: 6, alignItems: "center", color: "var(--color-text-muted)" }}>
              <input type="checkbox" style={{ width: "auto" }} />
              Manter conectado
            </label>
            <a href="#">Esqueci minha senha</a>
          </div>

          {erro && (
            <p style={{ color: "var(--color-danger)", fontSize: 13.5, marginBottom: 16 }}>
              {erro}
            </p>
          )}

          <button className="btn btn-primary btn-block" type="submit" disabled={carregando}>
            {carregando ? "Entrando..." : "Entrar"}
          </button>

          <p className="form-switch">
            Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
