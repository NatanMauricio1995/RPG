"use client";

import { Missao, excluirMissao, StatusMissao } from "../../services/missaoService";

type Props = {
  missao: Missao;
  onEditar: (missao: Missao) => void;
  onExcluir: () => void;
};

export default function CardMissao({ missao, onEditar, onExcluir }: Props) {
  async function confirmarExclusao() {
    if (!window.confirm(`Deseja excluir a missão "${missao.nome}"?`)) return;
    await excluirMissao(missao.id);
    onExcluir();
  }

  const getStatusClass = (status: StatusMissao) => {
    switch (status) {
      case "Concluída": return "status-concluida";
      case "Falhou": return "status-falhou";
      case "Em andamento": return "status-andamento";
      default: return "status-nao-iniciada";
    }
  };

  return (
    <article className="card-missao">
      <div className="topo-card-missao">
        <h3>{missao.nome}</h3>
        <span className={`badge-status ${getStatusClass(missao.status)}`}>
          {missao.status}
        </span>
      </div>
      <div className="corpo-card-missao">
        <p><strong>Descrição:</strong> {missao.descricao}</p>
        <p><strong>Objetivo:</strong> {missao.objetivo}</p>
        <p><strong>Recompensa:</strong> {missao.recompensa}</p>
      </div>
      <div className="acoes-card-missao">
        <button onClick={() => onEditar(missao)}>Editar</button>
        <button onClick={confirmarExclusao}>Excluir</button>
      </div>
    </article>
  );
}
