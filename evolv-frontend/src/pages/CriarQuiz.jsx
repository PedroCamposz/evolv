import { useEffect, useState } from "react";
import { Plus, Trash2, CheckCircle2, Download } from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import ImportarQuestoesOpenTdb from "../components/ImportarQuestoesOpenTdb.jsx";
import { categoriasApi, quizzesApi, sessao } from "../services/api.js";
import { OPCOES_TEMPO, formatarDuracao } from "../utils.jsx";

function novaAlternativa() {
  return { texto: "", correta: false };
}

function novaQuestao() {
  return { enunciado: "", alternativas: [novaAlternativa(), novaAlternativa()] };
}

export default function CriarQuiz() {
  const [categorias, setCategorias] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  // Limite de tentativas por aluno ("" = ilimitado) e se já publica ao salvar.
  const [maxTentativas, setMaxTentativas] = useState("");
  // Tempo por questão em segundos ("" = sem limite).
  const [tempoPorQuestao, setTempoPorQuestao] = useState("");
  const [publicar, setPublicar] = useState(false);
  const [questoes, setQuestoes] = useState([novaQuestao()]);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [importModalAberto, setImportModalAberto] = useState(false);

  // Importação de questões da API externa (OpenTDB) é restrita a
  // professor/admin, espelhando a regra já aplicada no back-end.
  const usuario = sessao.getUsuario();
  const podeImportar = usuario?.perfil === "PROFESSOR" || usuario?.perfil === "ADMIN";

  useEffect(() => {
    categoriasApi
      .listar()
      .then((dados) => {
        setCategorias(dados);
        if (dados.length > 0) setCategoriaId(String(dados[0].id));
      })
      .catch((err) =>
        setErro(
          err.message === "Failed to fetch"
            ? "Não foi possível carregar as categorias. Verifique se o back-end está rodando."
            : err.message
        )
      );
  }, []);

  function atualizarQuestao(index, campo, valor) {
    const copia = [...questoes];
    copia[index] = { ...copia[index], [campo]: valor };
    setQuestoes(copia);
  }

  function atualizarAlternativa(qIndex, aIndex, campo, valor) {
    const copia = [...questoes];
    let alternativas = [...copia[qIndex].alternativas];

    if (campo === "correta") {
      // apenas uma alternativa correta por questão
      alternativas = alternativas.map((alt, i) => ({ ...alt, correta: i === aIndex }));
    } else {
      alternativas[aIndex] = { ...alternativas[aIndex], [campo]: valor };
    }

    copia[qIndex] = { ...copia[qIndex], alternativas };
    setQuestoes(copia);
  }

  function adicionarQuestao() {
    setQuestoes([...questoes, novaQuestao()]);
  }

  function removerQuestao(index) {
    setQuestoes(questoes.filter((_, i) => i !== index));
  }

  function adicionarAlternativa(qIndex) {
    setQuestoes(questoes.map((q, i) => (i === qIndex ? { ...q, alternativas: [...q.alternativas, novaAlternativa()] } : q)));
  }

  function removerAlternativa(qIndex, aIndex) {
    setQuestoes(questoes.map((q, i) => (i === qIndex ? { ...q, alternativas: q.alternativas.filter((_, j) => j !== aIndex) } : q)));
  }

  function questaoEstaVazia(questao) {
    return (
      questao.enunciado.trim() === "" &&
      questao.alternativas.every((alt) => alt.texto.trim() === "")
    );
  }

  function handleImportarQuestoes(questoesImportadas) {
    if (questoesImportadas.length === 0) return;

    // Se o formulário só tem a primeira questão em branco (estado inicial),
    // substitui em vez de deixar uma questão vazia sobrando no meio.
    if (questoes.length === 1 && questaoEstaVazia(questoes[0])) {
      setQuestoes(questoesImportadas);
    } else {
      setQuestoes([...questoes, ...questoesImportadas]);
    }
    setSucesso("");
    setErro("");
  }

  function limparFormulario() {
    setTitulo("");
    setDescricao("");
    setMaxTentativas("");
    setTempoPorQuestao("");
    setPublicar(false);
    setQuestoes([novaQuestao()]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!categoriaId) {
      setErro("Selecione uma categoria (cadastre uma em 'Categorias' se a lista estiver vazia).");
      return;
    }

    setSalvando(true);
    try {
      const criado = await quizzesApi.criar({
        titulo,
        descricao,
        categoriaId: Number(categoriaId),
        maxTentativas: maxTentativas ? Number(maxTentativas) : null,
        tempoPorQuestao: tempoPorQuestao ? Number(tempoPorQuestao) : null,
        questoes,
      });
      if (publicar) {
        await quizzesApi.disponibilizar(criado.id, true);
        setSucesso("Quiz criado e publicado! Os alunos já podem respondê-lo.");
      } else {
        setSucesso("Quiz criado como rascunho. Em \"Meus quizzes\", clique em \"Publicar\" para os alunos verem.");
      }
      limparFormulario();
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="dash-shell">
      <Sidebar />

      <main className="dash-main">
        <div className="page-header">
          <div>
            <h1>Criar quiz</h1>
            <p>Monte um quiz com questões e alternativas, defina o limite de tentativas e publique quando quiser.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="panel" style={{ marginBottom: 20 }}>
            <h3>Dados gerais</h3>

            <div className="field" style={{ marginTop: 16 }}>
              <label htmlFor="titulo">Título do quiz</label>
              <input
                id="titulo"
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Frações e decimais"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="descricao">Descrição (opcional)</label>
              <input
                id="descricao"
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Revisão do conteúdo da semana"
              />
            </div>

            <div className="field">
              <label htmlFor="categoria">Categoria</label>
              <select
                id="categoria"
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                required
              >
                {categorias.length === 0 && <option value="">Nenhuma categoria cadastrada</option>}
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="maxTentativas">Limite de tentativas por aluno</label>
                <select id="maxTentativas" value={maxTentativas} onChange={(e) => setMaxTentativas(e.target.value)}>
                  <option value="">Ilimitadas</option>
                  {[1, 2, 3, 4, 5, 10].map((n) => (
                    <option key={n} value={n}>{n} tentativa{n > 1 ? "s" : ""}</option>
                  ))}
                </select>
                <span className="field-hint">Cada tentativa gera XP; o limite evita repetições sem fim.</span>
              </div>
              <div className="field">
                <label htmlFor="tempoPorQuestao">Tempo por questão</label>
                <select id="tempoPorQuestao" value={tempoPorQuestao} onChange={(e) => setTempoPorQuestao(e.target.value)}>
                  <option value="">Sem limite de tempo</option>
                  {OPCOES_TEMPO.map((s) => <option key={s} value={s}>{formatarDuracao(s)}</option>)}
                </select>
                <span className="field-hint">Se o tempo acabar, a questão fica sem resposta e o quiz avança.</span>
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>Publicação</label>
                <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 500, padding: "11px 0" }}>
                  <input type="checkbox" style={{ width: "auto" }} checked={publicar} onChange={(e) => setPublicar(e.target.checked)} />
                  Publicar para os alunos ao salvar
                </label>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="question-card-header" style={{ marginBottom: 0 }}>
              <h3>Questões</h3>
              {podeImportar && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setImportModalAberto(true)}
                >
                  <Download size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
                  Importar questões da API
                </button>
              )}
            </div>
            <p className="panel-sub" style={{ marginBottom: 16 }}>
              Marque qual alternativa é a correta em cada questão. Você também pode importar
              questões prontas da Open Trivia Database e depois editá-las como preferir.
            </p>

            {questoes.map((questao, qIndex) => (
              <div className="question-card" key={qIndex}>
                <div className="question-card-header">
                  <h4>Questão {qIndex + 1}</h4>
                  {questoes.length > 1 && (
                    <button
                      type="button"
                      className="link-btn danger"
                      onClick={() => removerQuestao(qIndex)}
                    >
                      Remover questão
                    </button>
                  )}
                </div>

                <div className="field">
                  <label>Enunciado</label>
                  <input
                    type="text"
                    value={questao.enunciado}
                    onChange={(e) => atualizarQuestao(qIndex, "enunciado", e.target.value)}
                    placeholder="Digite a pergunta"
                    required
                  />
                </div>

                {questao.alternativas.map((alt, aIndex) => (
                  <div className="alternative-row" key={aIndex}>
                    <label>
                      <input
                        type="radio"
                        name={`correta-${qIndex}`}
                        checked={alt.correta}
                        onChange={() => atualizarAlternativa(qIndex, aIndex, "correta", true)}
                      />
                      Correta
                    </label>
                    <input
                      type="text"
                      value={alt.texto}
                      onChange={(e) =>
                        atualizarAlternativa(qIndex, aIndex, "texto", e.target.value)
                      }
                      placeholder={`Alternativa ${aIndex + 1}`}
                      required
                    />
                    {questao.alternativas.length > 2 && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => removerAlternativa(qIndex, aIndex)}
                        aria-label="Remover alternativa"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  className="link-btn"
                  onClick={() => adicionarAlternativa(qIndex)}
                >
                  + Adicionar alternativa
                </button>
              </div>
            ))}

            <button type="button" className="btn btn-secondary" onClick={adicionarQuestao}>
              <Plus size={16} style={{ marginRight: 6, verticalAlign: -3 }} />
              Adicionar questão
            </button>
          </div>

          {erro && <p className="alert-error" style={{ marginTop: 20 }}>{erro}</p>}
          {sucesso && (
            <p className="alert-success" style={{ marginTop: 20 }}>
              <CheckCircle2 size={15} style={{ marginRight: 6, verticalAlign: -2 }} />
              {sucesso}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: 20 }}
            disabled={salvando}
          >
            {salvando ? "Salvando..." : "Salvar quiz"}
          </button>
        </form>
      </main>

      <ImportarQuestoesOpenTdb
        aberto={importModalAberto}
        onFechar={() => setImportModalAberto(false)}
        onImportar={handleImportarQuestoes}
      />
    </div>
  );
}
