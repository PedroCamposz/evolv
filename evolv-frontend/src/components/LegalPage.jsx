import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";

export default function LegalPage({ title, updatedAt, children }) {
  return (
    <div className="legal-page">
      <header className="legal-topbar">
        <Link to="/" className="legal-logo">
          <Logo light={false} />
        </Link>
        <Link to="/cadastro" className="btn btn-ghost">
          Voltar ao cadastro
        </Link>
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
