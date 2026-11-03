/**
 * Gráficos simples feitos em SVG puro (sem biblioteca externa), usados nos
 * dashboards (RF10). Todos recebem os dados já calculados pelo back-end.
 */

/** Barras horizontais: uma linha por item, com valor em %. */
export function BarrasHorizontais({ itens, rotulo, valor, cor = () => "var(--color-primary)", sufixo = "%" }) {
  if (!itens?.length) return <p className="empty-state">Ainda não há dados suficientes.</p>;
  return (
    <div>
      {itens.map((item) => {
        const v = valor(item);
        return (
          <div className="category-row" key={rotulo(item)}>
            <span className="category-row-label" title={rotulo(item)}>{rotulo(item)}</span>
            <div className="category-bar-track">
              <div className="category-bar-fill" style={{ width: `${Math.max(2, Math.min(100, v))}%`, background: cor(item) }} />
            </div>
            <span className="category-row-value">{v}{sufixo}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Linha com pontos (0 a 100%), usada na evolução do aluno. */
export function GraficoLinha({ pontos, rotulo, valor, dica }) {
  if (!pontos?.length) return <p className="empty-state">Responda um quiz para ver sua evolução.</p>;
  const L = 600, A = 220, m = { t: 16, r: 16, b: 28, l: 36 };
  const w = L - m.l - m.r, h = A - m.t - m.b;
  const x = (i) => m.l + (pontos.length === 1 ? w / 2 : (i * w) / (pontos.length - 1));
  const y = (v) => m.t + h - (v / 100) * h;
  const caminho = pontos.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(valor(p))}`).join(" ");
  return (
    <svg viewBox={`0 0 ${L} ${A}`} className="chart-svg limitado" role="img" aria-label="Evolução do percentual de acertos">
      {[0, 25, 50, 75, 100].map((g) => (
        <g key={g}>
          <line x1={m.l} x2={L - m.r} y1={y(g)} y2={y(g)} className="chart-grid" />
          <text x={m.l - 8} y={y(g) + 4} textAnchor="end" className="chart-axis">{g}%</text>
        </g>
      ))}
      <path d={caminho} className="chart-line" />
      {pontos.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(valor(p))} r="5" className="chart-dot">
            <title>{dica ? dica(p) : `${valor(p)}%`}</title>
          </circle>
          <text x={x(i)} y={A - 8} textAnchor="middle" className="chart-axis">{rotulo(p)}</text>
        </g>
      ))}
    </svg>
  );
}

/** Colunas verticais (contagem), usada na atividade por dia do professor. */
export function GraficoColunas({ itens, rotulo, valor }) {
  if (!itens?.length) return <p className="empty-state">Sem dados.</p>;
  const L = 600, A = 200, m = { t: 14, r: 8, b: 28, l: 28 };
  const w = L - m.l - m.r, h = A - m.t - m.b;
  const max = Math.max(1, ...itens.map(valor));
  const passo = w / itens.length;
  const larg = Math.max(4, passo * 0.6);
  return (
    <svg viewBox={`0 0 ${L} ${A}`} className="chart-svg limitado" role="img" aria-label="Tentativas por dia">
      {[...new Set([0, Math.ceil(max / 2), max])].map((t) => (
        <g key={t}>
          <line x1={m.l} x2={L - m.r} y1={m.t + h - (t / max) * h} y2={m.t + h - (t / max) * h} className="chart-grid" />
          <text x={m.l - 6} y={m.t + h - (t / max) * h + 4} textAnchor="end" className="chart-axis">{t}</text>
        </g>
      ))}
      {itens.map((it, i) => {
        const v = valor(it);
        const alt = (v / max) * h;
        const cx = m.l + passo * i + passo / 2;
        return (
          <g key={i}>
            <rect x={cx - larg / 2} y={m.t + h - alt} width={larg} height={Math.max(alt, v ? 2 : 0)} rx="3" className="chart-bar">
              <title>{`${rotulo(it)}: ${v}`}</title>
            </rect>
            {i % 2 === 1 || itens.length <= 7 ? (
              <text x={cx} y={A - 8} textAnchor="middle" className="chart-axis">{rotulo(it)}</text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

/** Cor da barra de acordo com o percentual de acerto. */
export function corPorPercentual(p) {
  if (p >= 75) return "var(--color-success)";
  if (p >= 50) return "var(--color-xp)";
  return "var(--color-danger)";
}

const PALETA = ["#6c5ce7", "#8b7cf6", "#f59e0b", "#16a34a", "#ef4444", "#0ea5e9", "#ec4899", "#14b8a6"];
export const corDaSerie = (i) => PALETA[i % PALETA.length];

/** Anel de progresso (resultado do quiz). */
export function Anel({ percentual, tamanho = 150, espessura = 14, cor = "var(--color-primary)", children }) {
  const r = (tamanho - espessura) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: tamanho, height: tamanho, margin: "0 auto" }}>
      <svg width={tamanho} height={tamanho} style={{ transform: "rotate(-90deg)" }} role="img" aria-label={`${percentual}%`}>
        <circle cx={tamanho / 2} cy={tamanho / 2} r={r} fill="none" stroke="var(--color-primary-soft)" strokeWidth={espessura} />
        <circle cx={tamanho / 2} cy={tamanho / 2} r={r} fill="none" stroke={cor} strokeWidth={espessura}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(100, percentual) / 100)}
          style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
}

/** Colunas com uma cor por categoria e valor em cima (escala 0-max). */
export function ColunasCategorias({ itens, rotulo, valor, max = 10, formatar = (v) => v }) {
  if (!itens?.length) return <p className="empty-state">Responda um quiz para ver sua média por categoria.</p>;
  const L = 640, A = 230, m = { t: 22, r: 10, b: 34, l: 34 };
  const w = L - m.l - m.r, h = A - m.t - m.b;
  const passo = w / itens.length, larg = Math.min(54, passo * 0.5);
  const ticks = [0, max * 0.25, max * 0.5, max * 0.75, max];
  return (
    <svg viewBox={`0 0 ${L} ${A}`} className="chart-svg limitado" role="img" aria-label="Média por categoria">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={m.l} x2={L - m.r} y1={m.t + h - (t / max) * h} y2={m.t + h - (t / max) * h} className="chart-grid" />
          <text x={m.l - 8} y={m.t + h - (t / max) * h + 4} textAnchor="end" className="chart-axis">{t % 1 ? t.toFixed(1) : t}</text>
        </g>
      ))}
      {itens.map((it, i) => {
        const v = valor(it), alt = (Math.min(v, max) / max) * h, cx = m.l + passo * i + passo / 2;
        return (
          <g key={rotulo(it)}>
            <rect x={cx - larg / 2} y={m.t + h - alt} width={larg} height={Math.max(alt, 2)} rx="6" fill={corDaSerie(i)}>
              <title>{`${rotulo(it)}: ${formatar(v)}`}</title>
            </rect>
            <text x={cx} y={m.t + h - alt - 6} textAnchor="middle" style={{ fontSize: 12, fontWeight: 700, fill: "var(--color-text)" }}>{formatar(v)}</text>
            <text x={cx} y={A - 10} textAnchor="middle" className="chart-axis">{rotulo(it).length > 14 ? rotulo(it).slice(0, 13) + "…" : rotulo(it)}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** Rosca (distribuição por perfil). */
export function Rosca({ fatias, total, legenda }) {
  const tam = 170, esp = 24, r = (tam - esp) / 2, c = 2 * Math.PI * r;
  let acumulado = 0;
  return (
    <div style={{ position: "relative", width: tam, height: tam, margin: "0 auto" }}>
      <svg width={tam} height={tam} style={{ transform: "rotate(-90deg)" }} role="img" aria-label="Distribuição">
        <circle cx={tam / 2} cy={tam / 2} r={r} fill="none" stroke="var(--color-paper)" strokeWidth={esp} />
        {total > 0 && fatias.map((f) => {
          const frac = f.valor / total;
          const el = (
            <circle key={f.nome} cx={tam / 2} cy={tam / 2} r={r} fill="none" stroke={f.cor} strokeWidth={esp}
              strokeDasharray={`${frac * c} ${c}`} strokeDashoffset={-acumulado * c}>
              <title>{`${f.nome}: ${f.valor}`}</title>
            </circle>
          );
          acumulado += frac;
          return el;
        })}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <strong style={{ fontSize: 26 }}>{total}</strong>
        <span className="panel-sub">{legenda}</span>
      </div>
    </div>
  );
}

/** Várias linhas no mesmo gráfico (ex.: acessos e respostas por dia). */
export function LinhasMultiplas({ itens, rotulo, series }) {
  if (!itens?.length) return <p className="empty-state">Sem dados.</p>;
  const L = 640, A = 220, m = { t: 14, r: 12, b: 28, l: 32 };
  const w = L - m.l - m.r, h = A - m.t - m.b;
  const max = Math.max(1, ...itens.flatMap((it) => series.map((s) => s.valor(it))));
  const x = (i) => m.l + (itens.length === 1 ? w / 2 : (i * w) / (itens.length - 1));
  const y = (v) => m.t + h - (v / max) * h;
  const ticks = [...new Set([0, Math.ceil(max / 2), max])];
  const passoRotulo = Math.ceil(itens.length / 7);
  return (
    <>
      <svg viewBox={`0 0 ${L} ${A}`} className="chart-svg limitado" role="img" aria-label="Atividade por dia">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={m.l} x2={L - m.r} y1={y(t)} y2={y(t)} className="chart-grid" />
            <text x={m.l - 6} y={y(t) + 4} textAnchor="end" className="chart-axis">{t}</text>
          </g>
        ))}
        {series.map((s) => (
          <path key={s.nome} d={itens.map((it, i) => `${i ? "L" : "M"}${x(i)},${y(s.valor(it))}`).join(" ")}
            fill="none" stroke={s.cor} strokeWidth="2.5" strokeLinejoin="round" />
        ))}
        {itens.map((it, i) => (i % passoRotulo === 0 || i === itens.length - 1) && (
          <text key={i} x={x(i)} y={A - 8} textAnchor="middle" className="chart-axis">{rotulo(it)}</text>
        ))}
      </svg>
      <div className="legend">{series.map((s) => <span key={s.nome}><i style={{ background: s.cor }} />{s.nome}</span>)}</div>
    </>
  );
}
