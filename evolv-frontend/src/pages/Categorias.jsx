import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import { categoriasApi } from "../services/api.js";

const FORM_VAZIO = { nome: "", descricao: "" };

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [erroForm, setErroForm] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    setCarregando(true);
    setErroLista("");
    try {
      const dados = await categoriasApi.listar();
      setCategorias(dados);
    } catch (err) {
      setErroLista(
        "Não foi possível conectar à API (http://localhost:8080). Verifique se o back-end está rodando."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function abrirNovo() {
    setEditandoId(null);
    setForm(FORM_VAZIO);
    setErroForm("");
    setModalAberto(true);
  }

  function abrirEdicao(categoria) {
    setEditandoId(categoria.id);
    setForm({ nome: categoria.nome, descricao: categoria.descricao || "" });
    setErroForm("");
    setModalAberto(true);
  }

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true);
    setErroForm("");
    try {
      if (editandoId) {
        await categoriasApi.atualizar(editandoId, form);
      } else {
        await categoriasApi.criar(form);
      }
      setModalAberto(false);
      await carregar();
    } catch (err) {
      setErroForm(err.message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(categoria) {
    if (!confirm(`Excluir a categoria "${categoria.nome}"?`)) return;
    try {
      await categoriasApi.excluir(categoria.id);
      await carregar();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="dash-shell">
      <Sidebar />

      <main className="dash-main">
        <div className="page-header">
          <div>
            <h1>Categorias</h1>
            <p>Organize os quizzes por assunto (RF03 — Gerenciamento de categorias).</p>
          </div>
          <button className="btn btn-primary" onClick={abrirNovo}>
            <Plus size={16} style={{ marginRight: 6, verticalAlign: -3 }} />
            Nova categoria
          </button>
        </div>

        <div className="panel">
          {erroLista && <p className="alert-error">{erroLista}</p>}

          {carregando ? (
            <p className="empty-state">Carregando categorias...</p>
          ) : categorias.length === 0 && !erroLista ? (
            <p className="empty-state">
              Nenhuma categoria cadastrada ainda. Clique em "Nova categoria" para começar.
            </p>
          ) : (
            categorias.length > 0 && (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Descrição</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {categorias.map((cat) => (
                    <tr key={cat.id}>
                      <td>
                        <strong>{cat.nome}</strong>
                      </td>
                      <td>{cat.descricao || "—"}</td>
                      <td>
                        <div className="actions">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => abrirEdicao(cat)}
                            aria-label={`Editar ${cat.nome}`}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => excluir(cat)}
                            aria-label={`Excluir ${cat.nome}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      </main>

      {modalAberto && (
        <div className="modal-backdrop" onClick={() => setModalAberto(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>{editandoId ? "Editar categoria" : "Nova categoria"}</h3>

            <form onSubmit={salvar}>
              <div className="field">
                <label htmlFor="nome">Nome</label>
                <input
                  id="nome"
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Ex: Matemática"
                  required
                  autoFocus
                />
              </div>

              <div className="field">
                <label htmlFor="descricao">Descrição (opcional)</label>
                <input
                  id="descricao"
                  type="text"
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Ex: Conteúdos de aritmética e álgebra básica"
                />
              </div>

              {erroForm && <p className="alert-error">{erroForm}</p>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalAberto(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={salvando}>
                  {salvando ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
