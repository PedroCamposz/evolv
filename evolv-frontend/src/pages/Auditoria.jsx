import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import { auditoriaApi } from "../services/api.js";

export default function Auditoria() {
  const [logs, setLogs] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    auditoriaApi
      .listar()
      .then(setLogs)
      .catch((err) => setErro(err.message || "Não foi possível carregar os logs."))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div className="dash-shell">
      <Sidebar />

      <main className="dash-main">
        <div className="page-header">
          <div>
            <h1>Logs de auditoria</h1>
            <p>Registro de ações realizadas no sistema, para rastreabilidade (acesso restrito a administradores).</p>
          </div>
        </div>

        <div className="panel">
          {erro && <p className="alert-error">{erro}</p>}

          {carregando ? (
            <p className="empty-state">Carregando logs...</p>
          ) : logs.length === 0 && !erro ? (
            <p className="empty-state">Nenhuma ação registrada ainda.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Usuário</th>
                  <th>Ação</th>
                  <th>Entidade</th>
                  <th>Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {new Date(log.dataHora).toLocaleString("pt-BR")}
                    </td>
                    <td>{log.usuarioEmail}</td>
                    <td>
                      <strong>{log.acao}</strong>
                    </td>
                    <td>
                      {log.entidade}
                      {log.entidadeId ? ` #${log.entidadeId}` : ""}
                    </td>
                    <td>{log.detalhes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
