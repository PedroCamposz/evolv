import { useEffect, useMemo, useState } from "react";
import { Search, UserPlus, X, ChevronLeft, ChevronRight, KeyRound, Copy } from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import { adminApi, sessao } from "../services/api.js";
import { Avatar } from "../utils.jsx";

const POR_PAGINA = 8;
const NOME_PERFIL = { ALUNO: "Aluno", PROFESSOR: "Professor", ADMIN: "Admin" };
const COR_PERFIL = { ALUNO: "roxo", PROFESSOR: "laranja", ADMIN: "vermelho" };

/**
 * RF13 - Administração de usuários (somente ADMIN): criar usuários (inclusive
 * administradores), alterar perfil e ativar/desativar contas. Não há exclusão,
 * para preservar o histórico; a conta desativada não consegue mais entrar.
 */
export default function Usuarios() {
  const [usuarios, setUsuarios] = useState(null);
  const [erro, setErro] = useState("");
  const [msg, setMsg] = useState("");
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("TODOS");
  const [pagina, setPagina] = useState(1);
  const [criando, setCriando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [detalhe, setDetalhe] = useState(null);
  const eu = sessao.getUsuario()?.id;

  function carregar() {
    adminApi.usuarios().then(setUsuarios).catch((err) => setErro(err.message));
  }
  useEffect(carregar, []);

  async function executar(acao, sucesso) {
    setErro(""); setMsg("");
    try { await acao(); setMsg(sucesso); carregar(); return true; } catch (err) { setErro(err.message); return false; }
  }

  const filtrados = useMemo(() => (usuarios || []).filter((u) => {
    const t = busca.trim().toLowerCase();
    return (filtro === "TODOS" || u.perfil === filtro) && (!t || u.nome.toLowerCase().includes(t) || u.email.toLowerCase().includes(t));
  }), [usuarios, busca, filtro]);
  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const pag = Math.min(pagina, paginas);
  const visiveis = filtrados.slice((pag - 1) * POR_PAGINA, pag * POR_PAGINA);

  return (
    <div className="dash-shell">
      <Sidebar />
      <main className="dash-main">
        <div className="page-header">
          <div>
            <h1>Gerenciamento de usuários</h1>
            <p>Gerencie perfis, permissões e a situação das contas. Toda alteração fica nos logs de auditoria.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setCriando(true)}><UserPlus size={16} /> Adicionar usuário</button>
        </div>

        <div className="barra-filtros">
          <label className="busca">
            <Search size={16} />
            <input value={busca} onChange={(e) => { setBusca(e.target.value); setPagina(1); }} placeholder="Buscar usuário pelo nome ou e-mail..." aria-label="Buscar usuário" />
          </label>
          <select className="inline-select" value={filtro} onChange={(e) => { setFiltro(e.target.value); setPagina(1); }} aria-label="Filtrar por perfil" style={{ padding: "9px 10px" }}>
            <option value="TODOS">Filtrar: todos os perfis</option>
            <option value="ALUNO">Alunos</option>
            <option value="PROFESSOR">Professores</option>
            <option value="ADMIN">Administradores</option>
          </select>
        </div>

        {erro && <p className="alert-error">{erro}</p>}
        {msg && <p className="alert-success">{msg}</p>}

        <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
          {!usuarios && !erro && <p className="empty-state" style={{ padding: 20 }}>Carregando...</p>}
          {usuarios && (
            <div className="table-wrap">
              <table className="data-table tabela-usuarios">
                <thead><tr><th>Usuário</th><th>Perfil</th><th>Status</th><th>Data de cadastro</th><th className="num">Ações</th></tr></thead>
                <tbody>
                  {visiveis.length === 0 && <tr><td colSpan={5} className="empty-state">Nenhum usuário encontrado.</td></tr>}
                  {visiveis.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <Avatar nome={u.nome} tamanho={34} />
                          <div><strong style={{ fontSize: 13.5 }}>{u.nome}{u.id === eu && " (você)"}</strong><div className="panel-sub">{u.email}</div></div>
                        </div>
                      </td>
                      <td><span className={`pill ${COR_PERFIL[u.perfil]}`}>{NOME_PERFIL[u.perfil]}</span></td>
                      <td>{u.ativo
                        ? <span style={{ color: "var(--color-success)", fontWeight: 600, fontSize: 13 }}><span className="dot" style={{ background: "var(--color-success)" }} />Ativo</span>
                        : <span style={{ color: "var(--color-danger)", fontWeight: 600, fontSize: 13 }}><span className="dot" style={{ background: "var(--color-danger)" }} />Inativo</span>}</td>
                      <td className="panel-sub">{new Date(u.criadoEm).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}</td>
                      <td className="num">
                        {u.id === eu && <button className="btn btn-sm btn-soft" onClick={() => setDetalhe(u)}>Ver</button>}
                        {u.id !== eu && (
                          <div style={{ display: "inline-flex", gap: 6 }}>
                            <button className="btn btn-sm btn-soft" onClick={() => setDetalhe(u)}>Ver</button>
                            <button className="btn btn-sm btn-light" onClick={() => setEditando(u)}>Editar</button>
                            <button className={`btn btn-sm ${u.ativo ? "btn-danger" : "btn-soft"}`}
                              onClick={() => executar(() => adminApi.alterarAtivo(u.id, !u.ativo), `${u.nome} ${u.ativo ? "desativado" : "reativado"}.`)}>
                              {u.ativo ? "Desativar" : "Reativar"}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {usuarios && (
            <div className="paginacao">
              <span className="panel-sub">Mostrando {filtrados.length ? (pag - 1) * POR_PAGINA + 1 : 0}-{Math.min(pag * POR_PAGINA, filtrados.length)} de {filtrados.length} usuário(s)</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="icon-btn" disabled={pag === 1} onClick={() => setPagina(pag - 1)} aria-label="Página anterior"><ChevronLeft size={15} /></button>
                {Array.from({ length: paginas }, (_, i) => i + 1).map((n) => (
                  <button key={n} className={`icon-btn ${n === pag ? "pagina-atual" : ""}`} onClick={() => setPagina(n)}>{n}</button>
                ))}
                <button className="icon-btn" disabled={pag === paginas} onClick={() => setPagina(pag + 1)} aria-label="Próxima página"><ChevronRight size={15} /></button>
              </div>
            </div>
          )}
        </div>

        {criando && (
          <NovoUsuario aoFechar={() => setCriando(false)}
            aoSalvar={async (payload) => { if (await executar(() => adminApi.criar(payload), `Usuário ${payload.nome} criado.`)) setCriando(false); }} />
        )}
        {detalhe && <DetalheUsuario usuario={detalhe} ehEu={detalhe.id === eu} aoFechar={() => { setDetalhe(null); carregar(); }} />}
        {editando && (
          <EditarPerfil usuario={editando} aoFechar={() => setEditando(null)}
            aoSalvar={async (perfil) => { if (await executar(() => adminApi.alterarPerfil(editando.id, perfil), `Perfil de ${editando.nome} alterado para ${NOME_PERFIL[perfil]}.`)) setEditando(null); }} />
        )}
      </main>
    </div>
  );
}

function NovoUsuario({ aoFechar, aoSalvar }) {
  const [f, setF] = useState({ nome: "", email: "", senha: "", perfil: "ALUNO" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="modal-backdrop" onClick={aoFechar}>
      <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); aoSalvar(f); }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3>Adicionar usuário</h3>
          <button type="button" className="icon-btn" onClick={aoFechar} aria-label="Fechar"><X size={16} /></button>
        </div>
        <div className="field"><label htmlFor="nu-nome">Nome</label><input id="nu-nome" value={f.nome} onChange={set("nome")} required maxLength={120} /></div>
        <div className="field"><label htmlFor="nu-email">E-mail</label><input id="nu-email" type="email" value={f.email} onChange={set("email")} required /></div>
        <div className="field"><label htmlFor="nu-senha">Senha inicial</label><input id="nu-senha" type="password" value={f.senha} onChange={set("senha")} required minLength={8} /><span className="field-hint">Mínimo de 8 caracteres. Ela vale como senha temporária por 72 horas: no primeiro acesso a pessoa cria a própria senha e aceita os termos.</span></div>
        <div className="field">
          <label htmlFor="nu-perfil">Perfil</label>
          <select id="nu-perfil" value={f.perfil} onChange={set("perfil")}>
            <option value="ALUNO">Aluno</option><option value="PROFESSOR">Professor</option><option value="ADMIN">Administrador</option>
          </select>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-light" onClick={aoFechar}>Cancelar</button>
          <button type="submit" className="btn btn-primary">Criar usuário</button>
        </div>
      </form>
    </div>
  );
}

function EditarPerfil({ usuario, aoFechar, aoSalvar }) {
  const [perfil, setPerfil] = useState(usuario.perfil);
  return (
    <div className="modal-backdrop" onClick={aoFechar}>
      <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); aoSalvar(perfil); }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3>Editar {usuario.nome}</h3>
          <button type="button" className="icon-btn" onClick={aoFechar} aria-label="Fechar"><X size={16} /></button>
        </div>
        <div className="field">
          <label htmlFor="ep-perfil">Perfil de acesso</label>
          <select id="ep-perfil" value={perfil} onChange={(e) => setPerfil(e.target.value)}>
            <option value="ALUNO">Aluno</option><option value="PROFESSOR">Professor</option><option value="ADMIN">Administrador</option>
          </select>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-light" onClick={aoFechar}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={perfil === usuario.perfil}>Salvar</button>
        </div>
      </form>
    </div>
  );
}

const fmt = (d) => (d ? new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-");

/** Dados completos do usuário + geração de senha temporária. */
function DetalheUsuario({ usuario, ehEu, aoFechar }) {
  const [d, setD] = useState(null);
  const [erro, setErro] = useState("");
  const [validade, setValidade] = useState(24);
  const [gerada, setGerada] = useState(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => { adminApi.detalhar(usuario.id).then(setD).catch((e) => setErro(e.message)); }, [usuario.id]);

  async function gerar() {
    if (!confirm(`Gerar uma senha temporária para ${usuario.nome}? A senha atual deixa de funcionar e as sessões abertas são encerradas.`)) return;
    setErro("");
    try {
      setGerada(await adminApi.senhaTemporaria(usuario.id, Number(validade)));
      setD(await adminApi.detalhar(usuario.id));
    } catch (e) { setErro(e.message); }
  }

  async function copiar() {
    try { await navigator.clipboard.writeText(gerada.senhaTemporaria); setCopiado(true); } catch { /* sem permissão: o admin copia manualmente */ }
  }

  const linhas = d && [
    ["E-mail", d.email],
    ["Perfil", NOME_PERFIL[d.perfil]],
    ["Situação", d.ativo ? "Ativo" : "Desativado"],
    ["Cadastrado em", fmt(d.criadoEm)],
    ["Último acesso", fmt(d.ultimoLogin)],
    ["Aceite dos termos (LGPD)", d.aceitouTermos ? `Sim, em ${fmt(d.dataAceiteTermos)}` : "Pendente (será feito no primeiro acesso)"],
    ...(d.perfil === "ALUNO" ? [
      ["Nível e XP", `Nível ${d.nivel} · ${d.xpTotal} XP`],
      ["Quizzes respondidos", `${d.quizzesConcluidos} (${d.tentativas} tentativa${d.tentativas === 1 ? "" : "s"})`],
      ["Média de acertos", d.mediaAcertos == null ? "-" : `${d.mediaAcertos}%`],
      ["Conquistas", `${d.conquistas} de 4`],
    ] : []),
    ["Senha temporária", d.senhaTemporaria ? `Ativa até ${fmt(d.senhaTemporariaExpiraEm)}` : "Não"],
  ];

  return (
    <div className="modal-backdrop" onClick={aoFechar}>
      <div className="modal-card modal-card-lg" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "88vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Avatar nome={usuario.nome} tamanho={44} />
            <div><h3>{usuario.nome}</h3><span className="panel-sub">Dados completos do usuário</span></div>
          </div>
          <button type="button" className="icon-btn" onClick={aoFechar} aria-label="Fechar"><X size={16} /></button>
        </div>
        {erro && <p className="alert-error">{erro}</p>}
        {!d && !erro && <p className="empty-state">Carregando...</p>}
        {d && (
          <dl className="detalhes">
            {linhas.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
        )}

        {d && !ehEu && (
          <div className="senha-temp">
            <h4 style={{ display: "flex", gap: 8, alignItems: "center" }}><KeyRound size={16} /> Senha temporária</h4>
            <p className="panel-sub" style={{ margin: "4px 0 12px" }}>
              Use quando a pessoa esquecer a senha. No primeiro acesso ela será obrigada a criar uma senha nova;
              depois do prazo, a senha temporária para de funcionar. Por segurança, o EVOLV não mostra senhas antigas.
            </p>
            {gerada ? (
              <div className="senha-gerada">
                <span className="panel-sub">Senha temporária (aparece só agora):</span>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <code>{gerada.senhaTemporaria}</code>
                  <button type="button" className="btn btn-sm btn-soft" onClick={copiar}><Copy size={13} /> {copiado ? "Copiada!" : "Copiar"}</button>
                </div>
                <span className="panel-sub">Válida até <strong>{fmt(gerada.expiraEm)}</strong>. Repasse para {usuario.nome.split(" ")[0]} por um canal seguro.</span>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <select className="inline-select" value={validade} onChange={(e) => setValidade(e.target.value)} aria-label="Validade da senha temporária" style={{ padding: "8px 10px" }}>
                  <option value={1}>Válida por 1 hora</option>
                  <option value={24}>Válida por 24 horas</option>
                  <option value={72}>Válida por 72 horas</option>
                </select>
                <button type="button" className="btn btn-sm btn-primary" onClick={gerar}><KeyRound size={13} /> Gerar senha temporária</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
