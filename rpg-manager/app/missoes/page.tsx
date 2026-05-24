"use client";

import { useState, useEffect } from "react";
import { listarMissoes, Missao } from "../../services/missaoService";
import CardMissao from "../../components/Missoes/CardMissao";
import FormularioMissao from "../../components/Missoes/FormularioMissao";

export default function MissoesPage() {
  const [missoes, setMissoes] = useState<Missao[]>([]);
  const [filtro, setFiltro] = useState("");
  const [editando, setEditando] = useState<Missao | null | undefined>(undefined); // undefined = listing, null = creating, Missao = editing

  useEffect(() => {
    setMissoes(listarMissoes());
  }, []);

  const atualizarLista = () => {
    setMissoes(listarMissoes());
    setEditando(undefined);
  };

  const missoesFiltradas = missoes.filter((m) =>
    m.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="pagina-missoes">
      <div className="topo-pagina">
        <h1>Gerenciamento de Missões</h1>
        {editando === undefined && (
          <button className="botao-novo" onClick={() => setEditando(null)}>
            Nova Missão
          </button>
        )}
      </div>

      {editando !== undefined ? (
        <FormularioMissao
          missaoInicial={editando}
          onSalvar={atualizarLista}
          onCancelar={() => setEditando(undefined)}
        />
      ) : (
        <>
          <div className="filtros-missoes">
            <input
              type="text"
              placeholder="Pesquisar missão por nome..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>

          <div className="lista-missoes">
            {missoesFiltradas.length > 0 ? (
              missoesFiltradas.map((missao) => (
                <CardMissao
                  key={missao.id}
                  missao={missao}
                  onEditar={(m) => setEditando(m)}
                  onExcluir={atualizarLista}
                />
              ))
            ) : (
              <p className="aviso-vazio">Nenhuma missão encontrada.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
