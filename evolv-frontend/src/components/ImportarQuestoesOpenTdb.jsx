import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { integracaoApi } from "../services/api.js";

const DIFICULDADES = [
  { valor: "", label: "Qualquer dificuldade" },
  { valor: "easy", label: "Fácil" },
  { valor: "medium", label: "Média" },
  { valor: "hard", label: "Difícil" },
];

const DIFICULDADE_LABEL = {
  easy: "Fácil",
  medium: "Média",
  hard: "Difícil",
};

const TIPOS = [
  { valor: "", label: "Qualquer tipo" },
  { valor: "multiple", label: "Múltipla escolha" },
  { valor: "boolean", label: "Verdadeiro ou falso" },
];

/**
 * Modal de importação de questões da Open Trivia Database (OpenTDB).
 *
 * Fluxo:
 * 1. Professor define filtros (categoria/dificuldade/quantidade/tipo).
 * 2. "Buscar questões" -> GET /api/integracao/opentdb/questoes (via Spring
 *    Boot; este componente nunca acessa opentdb.com diretamente).
 * 3. Professor marca quais questões quer.
 * 4. "Importar questões selecionadas" devolve ao CriarQuiz.jsx um array no
 *    mesmo formato de uma questão manual (enunciado + alternativas), que é
 *    salvo junto com o resto do quiz pelo fluxo normal (POST /api/quizzes).
 *
 * Nenhuma questão é salva no banco aqui - é só a prévia.
 */
export default function ImportarQuestoesOpenTdb({ aberto, onFechar, onImportar }) {
  const [categorias, setCategorias] = useState([]);
  const [quantidade, setQuantidade] = useState(5);
  const [categoriaId, setCategoriaId] = useState("");
  const [dificuldade, setDificuldade] = useState("");
  const [tipo, setTipo] = useState("");

  const [resultados, setResultados] = useState(null);
  const [selecionadas, setSelecionadas] = useState(() => new Set());

  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!aberto) return;
    integracaoApi
      .categoriasOpenTdb()
      .then(setCategorias)
      .catch(() => setCategorias([])); // filtro de categoria é opcional; se falhar, só não mostra a lista
  }, [aberto]);

  if (!aberto) return null;

  async function buscar(e) {
    e.preventDefault();
    setErro("");
    setResultados(null);
    setSelecionadas(new Set());
    setBuscando(true);
    try {
      const dados = await integracaoApi.buscarQuestoesOpenTdb({
        quantidade: Number(quantidade),
        categoriaId: categoriaId || undefined,
        dificuldade: dificuldade || undefined,
        tipo: tipo || undefined,
      });
      setResultados(dados);
      if (dados.length === 0) {
        setErro("Nenhuma questão encontrada para esses filtros.");
      }
    } catch (err) {
      setErro(err.message);
    } finally {
      setBuscando(false);
    }
  }

  function alternarSelecao(index) {
    const copia = new Set(selecionadas);
    if (copia.has(index)) copia.delete(index);
    else copia.add(index);
    setSelecionadas(copia);
  }

  function confirmarImportacao() {
    const escolhidas = (resultados || [])
      .filter((_, index) => selecionadas.has(index))
      .map((questao) => ({
        enunciado: questao.enunciado,
        origem: "OPENTDB",
        alternativas: questao.alternativas.map((alt) => ({
          texto: alt.texto,
          correta: alt.correta,
        })),
      }));

    onImportar(escolhidas);
    fecharEResetar();
  }

  function fecharEResetar() {
    setResultados(null);
    setSelecionadas(new Set());
    setErro("");
    onFechar();
  }

  return (
    <div className="modal-backdrop" onClick={fecharEResetar}>
      <div className="modal-card modal-card-lg" onClick={(e) => e.stopPropagation()}>
        <h3>Importar questões da API (Open Trivia Database)</h3>

        <form onSubmit={buscar}>
          <div className="field-row">
            <div className="field">
              <label htmlFor="otdb-categoria">Categoria</label>
              <select
                id="otdb-categoria"
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
              >
                <option value="">Qualquer categoria</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="otdb-dificuldade">Dificuldade</label>
              <select
                id="otdb-dificuldade"
                value={dificuldade}
                onChange={(e) => setDificuldade(e.target.value)}
              >
                {DIFICULDADES.map((d) => (
                  <option key={d.valor} value={d.valor}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="otdb-quantidade">Quantidade</label>
              <input
                id="otdb-quantidade"
                type="number"
                min={1}
                max={50}
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="otdb-tipo">Tipo</label>
              <select id="otdb-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                {TIPOS.map((t) => (
                  <option key={t.valor} value={t.valor}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-secondary" disabled={buscando}>
            {buscando ? (
              <>
                <Loader2 size={14} className="spin" style={{ marginRight: 6, verticalAlign: -2 }} />
                Buscando...
              </>
            ) : (
              "Buscar questões"
            )}
          </button>
        </form>

        {erro && <p className="alert-error" style={{ marginTop: 16 }}>{erro}</p>}

        {buscando && (
          <p className="field-hint" style={{ marginTop: 12 }}>
            Buscando e traduzindo as questões para português — pode levar alguns segundos.
          </p>
        )}

        {resultados && resultados.length > 0 && (
          <div className="opentdb-resultados" style={{ marginTop: 20 }}>
            <p className="panel-sub" style={{ marginBottom: 4 }}>
              Marque as questões que deseja importar para este quiz.
            </p>
            <p className="field-hint" style={{ marginBottom: 12 }}>
              As perguntas e alternativas são traduzidas automaticamente do inglês para o
              português; revise o texto antes de salvar, pois traduções automáticas podem
              conter imprecisões.
            </p>

            {resultados.map((questao, index) => (
              <label className="question-card opentdb-question" key={index}>
                <div className="question-card-header">
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <input
                      type="checkbox"
                      checked={selecionadas.has(index)}
                      onChange={() => alternarSelecao(index)}
                      style={{ marginTop: 4 }}
                    />
                    <h4>{questao.enunciado}</h4>
                  </div>
                </div>

                <div className="opentdb-badges">
                  <span className="badge">{questao.categoriaOriginal}</span>
                  <span className="badge">{DIFICULDADE_LABEL[questao.dificuldade] || questao.dificuldade}</span>
                  <span className="badge">
                    {questao.tipo === "boolean" ? "verdadeiro/falso" : "múltipla escolha"}
                  </span>
                </div>

                <ul className="opentdb-alternativas">
                  {questao.alternativas.map((alt, altIndex) => (
                    <li key={altIndex} className={alt.correta ? "correta" : ""}>
                      {alt.texto}
                      {alt.correta && " (correta)"}
                    </li>
                  ))}
                </ul>
              </label>
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={fecharEResetar}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={selecionadas.size === 0}
            onClick={confirmarImportacao}
          >
            <Download size={15} style={{ marginRight: 6, verticalAlign: -2 }} />
            Importar {selecionadas.size > 0 ? `(${selecionadas.size})` : ""} selecionada
            {selecionadas.size === 1 ? "" : "s"}
          </button>
        </div>
      </div>
    </div>
  );
}
