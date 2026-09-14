import Logo from "./Logo.jsx";

export default function AuthBrandPanel() {
  return (
    <div className="auth-brand">
      <div className="auth-brand-top">
        <Logo />
      </div>

      <div className="auth-brand-headline">
        <h1>Sua evolução, um quiz por vez.</h1>
        <p>
          Crie e responda quizzes, acompanhe seu desempenho por categoria e
          suba de nível conforme você aprende.
        </p>
      </div>

      <div className="xp-illustration">
        <div className="xp-illustration-row">
          <span>Progresso do nível 7</span>
          <span>820 / 1000 XP</span>
        </div>
        <div className="xp-bar-track">
          <div className="xp-bar-fill" style={{ width: "82%" }} />
        </div>
      </div>

      <div className="auth-brand-footer">
        <div>
          <strong>+120</strong>
          quizzes disponíveis
        </div>
        <div>
          <strong>32</strong>
          conquistas
        </div>
        <div>
          <strong>LGPD</strong>
          dados protegidos
        </div>
      </div>
    </div>
  );
}
