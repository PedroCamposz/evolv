import { Link, useNavigate } from "react-router-dom";
import Logo from "./Logo.jsx";

export default function LegalPage({ title, updatedAt, children }) {
  const navigate = useNavigate();

  // Termos e Política abrem em outra aba (o formulário de cadastro continua
  // preenchido na aba original). "Fechar" fecha esta aba; se o navegador não
  // permitir (página aberta direto pelo endereço), volta para o cadastro.
  function fecharAba() {
    window.close();
    setTimeout(() => navigate("/cadastro"), 150);
  }

  return (
    <div className="legal-page">
      <header className="legal-topbar">
        <Link to="/" className="legal-logo">
          <Logo light={false} />
        </Link>
        <button type="button" className="btn btn-ghost" onClick={fecharAba}>
          Fechar
        </button>
      </header>

      <main className="legal-content">
        <p className="form-eyebrow">EVOLV</p>
        <h1>{title}</h1>
        <p className="legal-updated">Última atualização: {updatedAt}</p>

        <div className="legal-body">{children}</div>

        <p className="legal-footer-note">
          Dúvidas sobre este documento ou sobre o tratamento dos seus dados?
          Entre em contato com o encarregado de dados (DPO) da EVOLV pelos
          canais informados no rodapé desta página.
        </p>
      </main>
    </div>
  );
}
