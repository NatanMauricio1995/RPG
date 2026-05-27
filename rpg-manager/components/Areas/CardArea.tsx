"use client";

import { Area, excluirArea } from "../../services/areaService";
import Image from "next/image";

type Props = {
  area: Area;
  onEditar: (area: Area) => void;
  onExcluir: () => void;
};

export default function CardArea({ area, onEditar, onExcluir }: Props) {
  async function confirmarExclusao() {
    if (!window.confirm(`Deseja excluir a área "${area.nome}"?`)) return;
    await excluirArea(area.id);
    onExcluir();
  }

  return (
    <article className="card-area">
      {area.imagem && (
        <div className="imagem-card-area">
          <Image src={area.imagem} alt={area.nome} width={300} height={150} objectFit="cover" />
        </div>
      )}
      <div className="topo-card-area">
        <h3>{area.nome}</h3>
        <span className="badge-tipo">{area.tipo}</span>
      </div>
      <div className="corpo-card-area">
        <p>{area.descricao}</p>
        {area.observacoes && <p><small>Obs: {area.observacoes}</small></p>}
      </div>
      <div className="acoes-card-area">
        <button onClick={() => onEditar(area)}>Editar</button>
        <button onClick={confirmarExclusao}>Excluir</button>
      </div>
    </article>
  );
}
