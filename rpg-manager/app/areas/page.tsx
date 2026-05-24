"use client";

import { useState, useEffect } from "react";
import { listarAreas, Area } from "../../services/areaService";
import CardArea from "../../components/Areas/CardArea";
import FormularioArea from "../../components/Areas/FormularioArea";

export default function AreasPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [filtro, setFiltro] = useState("");
  const [editando, setEditando] = useState<Area | null | undefined>(undefined);

  useEffect(() => {
    setAreas(listarAreas());
  }, []);

  const atualizarLista = () => {
    setAreas(listarAreas());
    setEditando(undefined);
  };

  const areasFiltradas = areas.filter((a) =>
    a.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="pagina-areas">
      <div className="topo-pagina">
        <h1>Exploração de Áreas</h1>
        {editando === undefined && (
          <button className="botao-novo" onClick={() => setEditando(null)}>
            Nova Área
          </button>
        )}
      </div>

      {editando !== undefined ? (
        <FormularioArea
          areaInicial={editando}
          onSalvar={atualizarLista}
          onCancelar={() => setEditando(undefined)}
        />
      ) : (
        <>
          <div className="filtros-areas">
            <input
              type="text"
              placeholder="Pesquisar área por nome..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>

          <div className="lista-areas">
            {areasFiltradas.length > 0 ? (
              areasFiltradas.map((area) => (
                <CardArea
                  key={area.id}
                  area={area}
                  onEditar={(a) => setEditando(a)}
                  onExcluir={atualizarLista}
                />
              ))
            ) : (
              <p className="aviso-vazio">Nenhuma área cadastrada.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
