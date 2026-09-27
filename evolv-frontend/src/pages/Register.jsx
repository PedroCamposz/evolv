import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthBrandPanel from "../components/AuthBrandPanel.jsx";
import { authApi, sessao } from "../services/api.js";

export default function Register() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState("ALUNO");
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    if (form.senha !== form.confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    if (!aceitouTermos) {
      setErro("É necessário aceitar os Termos de Uso e a Política de Privacidade.");
      return;
    }

    setCarregando(true);
    try {
      const resposta = await authApi.registrar({
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        perfil,
        aceitouTermos,
      });
      sessao.salvar(resposta);
      navigate("/dashboard");
    } catch (err) {
      setErro(err.message || "Não foi possível concluir o cadastro. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="auth-shell">
      <AuthBrandPanel />

      <div className="auth-form-side">
        <form className="auth-form-card" onSubmit={handleSubmit}>
          <p className="form-eyebrow">Comece agora</p>
          <h2>Criar sua conta</h2>

          <div className="role-toggle">
            <button
              type="button"
              className={perfil === "ALUNO" ? "active" : ""}
              onClick={() => setPerfil("ALUNO")}
            >
              Sou aluno
            </button>
            <button
              type="button"
              className={perfil === "PROFESSOR" ? "active" : ""}
              onClick={() => setPerfil("PROFESSOR")}
            >
              Sou professor
            </button>
            <button
              type="button"
              className={perfil === "ADMIN" ? "active" : ""}
              onClick={() => setPerfil("ADMIN")}
            >
              Sou admin
            </button>
          </div>

          <div className="field">
            <label htmlFor="nome">Nome completo</label>
            <input
              id="nome"
              name="nome"
              type="text"
              placeholder="Seu nome"
              value={form.nome}
              onChange={handleChange}
              required
            />
          </div>

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
              placeholder="Mínimo de 8 caracteres"
              value={form.senha}
              onChange={handleChange}
              required
              minLength={8}
            />
            <span className="field-hint">Use letras, números e ao menos um símbolo.</span>
          </div>

          <div className="field">
            <label htmlFor="confirmarSenha">Confirmar senha</label>
            <input
              id="confirmarSenha"
              name="confirmarSenha"
              type="password"
              placeholder="Repita a senha"
              value={form.confirmarSenha}
              onChange={handleChange}
              required
              minLength={8}
            />
          </div>

          {erro && (
            <p style={{ color: "var(--color-danger)", fontSize: 13.5, marginBottom: 16 }}>
              {erro}
            </p>
          )}

          <label
            style={{
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
              fontSize: 13,
              color: "var(--color-text-muted)",
              marginBottom: 18,
            }}
          >
            <input
              type="checkbox"
              style={{ width: "auto", marginTop: 2 }}
              checked={aceitouTermos}
              onChange={(e) => setAceitouTermos(e.target.checked)}
              required
            />
            <span>
              Li e aceito os <Link to="/termos">Termos de Uso</Link> e a{" "}
              <Link to="/politica-privacidade">Política de Privacidade</Link>.
            </span>
          </label>

          <button className="btn btn-primary btn-block" type="submit" disabled={carregando}>
            {carregando ? "Criando conta..." : "Criar conta"}
          </button>

          <p className="form-switch">
            Já tem conta? <Link to="/login">Entrar</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
