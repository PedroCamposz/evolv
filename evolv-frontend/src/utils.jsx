// Funções de apoio usadas em várias telas.

const CORES_AVATAR = ["#6c5ce7", "#0ea5e9", "#f59e0b", "#16a34a", "#ec4899", "#14b8a6", "#ef4444", "#8b5cf6"];

/** Cor fixa para o avatar de cada pessoa (sempre a mesma para o mesmo nome). */
export function corAvatar(nome = "") {
  let h = 0;
  for (const c of nome) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return CORES_AVATAR[h % CORES_AVATAR.length];
}

/** "Beatriz Alves" -> "BA" */
export function iniciais(nome = "") {
  const partes = nome.trim().split(/\s+/).filter((p) => !/^(prof\.?|dr\.?)$/i.test(p));
  return ((partes[0]?.[0] || "") + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase() || "?";
}

export function Avatar({ nome, tamanho = 36 }) {
  return (
    <span className="avatar" style={{ background: corAvatar(nome), width: tamanho, height: tamanho, fontSize: tamanho * 0.38 }}>
      {iniciais(nome)}
    </span>
  );
}

/** 615 -> "10 minutos e 15 segundos" */
export function formatarTempo(seg) {
  if (seg == null) return "-";
  const m = Math.floor(seg / 60), s = seg % 60;
  if (!m) return `${s} segundo${s === 1 ? "" : "s"}`;
  return `${m} minuto${m === 1 ? "" : "s"}${s ? ` e ${s} segundo${s === 1 ? "" : "s"}` : ""}`;
}

/** Percentual (0-100) para nota de 0 a 10 com uma casa: 85 -> "8.5" */
export const nota = (percentual) => (Math.round(percentual) / 10).toFixed(1);

/** Situação de um conteúdo pelo percentual de acerto. */
export function situacao(percentualAcerto) {
  if (percentualAcerto < 60) return { classe: "critico", texto: "Crítico" };
  if (percentualAcerto < 75) return { classe: "atencao", texto: "Atenção" };
  return { classe: "normal", texto: "Normal" };
}

export function textoTentativas(max) {
  return max == null ? "Tentativas ilimitadas" : `${max} tentativa${max === 1 ? "" : "s"}`;
}

/** Duração curta: 30 -> "30 s", 60 -> "1 min", 90 -> "1 min 30 s" */
export function formatarDuracao(seg) {
  if (seg == null) return "-";
  const m = Math.floor(seg / 60), s = seg % 60;
  if (!m) return `${s} s`;
  return s ? `${m} min ${s} s` : `${m} min`;
}

/** Opções de tempo por questão oferecidas ao professor (em segundos). */
export const OPCOES_TEMPO = [15, 30, 45, 60, 90, 120, 180];
