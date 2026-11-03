import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import { Brand } from "../components/Sidebar.jsx";
import { authApi, sessao } from "../services/api.js";

/**
 * Troca obrigatória da senha temporária criada pelo administrador.
 * Enquanto a senha não for trocada, o back-end bloqueia o resto do sistema.
 */
export default function TrocarSenha() {
  const navigate = useNavigate();
  const usuario = sessao.getUsuario();
  const [nova, setNova] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [aceite, setAceite] = useState(false);
  const pendente = !!usuario?.aceiteTermosPendente;
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  if (!sessao.estaLogado()) return <Navigate to="/login" replace />;
  if (!usuario?.trocarSenha) return <Navigate to="/dashboard" replace />;

  const expira = usuario.senhaExpiraEm ? new Date(usuario.senhaExpiraEm).toLocaleString("pt-BR") : null;

  async function salvar(e) {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      // A senha temporária não é pedida de novo: a pessoa acabou de entrar com ela.
      sessao.salvar(await authApi.trocarSenha(null, nova, pendente ? aceite : undefined));
      navigate("/dashboard");
    } catch (err) {
      setErro(err.message);
      setSalvando(false);
    }
  }

  function sair() {
    sessao.limpar();
    navigate("/login");
  }

  return (
    <div className="auth-center">
      <form className="auth-card" onSubmit={salvar}>
        <Brand />
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <span className="mini-stat-icon" style={{ background: "var(--color-xp-soft)", color: "var(--color-xp)" }}><KeyRound size={20} /></span>
        </div>
        <h2>Crie sua nova senha</h2>
        <p className="auth-sub">
          Olá, {usuario.nome?.split(" ")[0]}! Você entrou com uma senha temporária. Para continuar, defina uma senha só sua{pendente ? " e aceite os termos" : ""}
          {expira ? <> antes de <strong>{expira}</strong></> : ""}.
        </p>
        <div className="field">
          <label htmlFor="ts-nova">Nova senha</label>
          <div className="senha-com-olho">
            <input id="ts-nova" type={mostrar ? "text" : "password"} value={nova} onChange={(e) => setNova(e.target.value)}
              required minLength={8} autoComplete="new-password" autoFocus />
            <button type="button" className="olho" onClick={() => setMostrar(!mostrar)} aria-label={mostrar ? "Esconder senha" : "Mostrar senha"}>
              {mostrar ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          <span className="field-hint">Mínimo de 8 caracteres. Use o ícone do olho para conferir o que digitou.</span>
        </div>
        {pendente && (
          <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, color: "var(--color-text-muted)", marginBottom: 18 }}>
            <input type="checkbox" style={{ width: "auto", marginTop: 2 }} checked={aceite} onChange={(e) => setAceite(e.target.checked)} required />
            <span>
              Li e aceito os <Link to="/termos" target="_blank" rel="noopener noreferrer">Termos de Uso</Link> e a{" "}
              <Link to="/politica-privacidade" target="_blank" rel="noopener noreferrer">Política de Privacidade</Link>.
            </span>
          </label>
        )}
        {erro && <p className="alert-error">{erro}</p>}
        <button className="btn btn-primary btn-block" type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Salvar nova senha"}</button>
        <p className="form-switch"><button type="button" className="link-btn" onClick={sair}>Sair</button></p>
      </form>
    </div>
  );
}
