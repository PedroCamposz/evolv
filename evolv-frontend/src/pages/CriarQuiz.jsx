import { useEffect, useState } from "react";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import { categoriasApi, quizzesApi } from "../services/api.js";

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
  const [questoes, setQuestoes] = useState([novaQuestao()]);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    categoriasApi
      .listar()
      .then((dados) => {
        setCategorias(dados);
        if (dados.length > 0) setCategoriaId(String(dados[0].id));
      })
      .catch(() =>
        setErro(
          "Não foi possível carregar as categorias. Verifique se o back-end está rodando em http://localhost:8080."
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
    const alternativas = [...copia[qIndex].alternativas];

    if (campo === "correta") {
      // apenas uma alternativa correta por questão
      alternativas.forEach((alt, i) => (alt.correta = i === aIndex));
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
    const copia = [...questoes];
    copia[qIndex].alternativas = [...copia[qIndex].alternativas, novaAlternativa()];
    setQuestoes(copia);
  }

  function removerAlternativa(qIndex, aIndex) {
    const copia = [...questoes];
    copia[qIndex].alternativas = copia[qIndex].alternativas.filter((_, i) => i !== aIndex);
    setQuestoes(copia);
  }

  function limparFormulario() {
    setTitulo("");
    setDescricao("");
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
      await quizzesApi.criar({
        titulo,
        descricao,
        categoriaId: Number(categoriaId),
        questoes,
      });
      setSucesso("Quiz criado com sucesso!");
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
            <p>Monte um quiz com questões e alternativas (RF04 — Criação de quizzes).</p>
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
          </div>

          <div className="panel">
            <h3>Questões</h3>
            <p className="panel-sub" style={{ marginBottom: 16 }}>
              Marque qual alternativa é a correta em cada questão.
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
    </div>
  );
}
