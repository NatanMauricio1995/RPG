"use client";

import { useState, useMemo } from "react";
import useInventario from "../../../hooks/useInventario";
import usePersonagem from "../../../hooks/usePersonagem";
import ItemCard from "./ItemCard";
import type { Item } from "../../../types/domain";

export default function Inventario({ personagemId }: { personagemId: number }) {
  const { personagemAtual, setPersonagemAtual } = usePersonagem(personagemId);
  const {
    itensCatalogo,
    inventario,
    adicionarAoInventario,
    removerDoInventario,
    alterarQuantidade,
    alternarEquipamento,
  } = useInventario(personagemAtual, (p) => setPersonagemAtual(p));

  const [abaInterna, setAbaInterna] = useState<"inventario" | "catalogo">("inventario");
  const [filtro, setFiltro] = useState("");

  const itemsFiltrados = useMemo(() => {
    const lista = abaInterna === "catalogo" ? itensCatalogo : inventario;
    return lista.filter((item: any) => {
      const dados = abaInterna === "catalogo" ? item : item.dados;
      if (!dados) return false;
      return (
        dados.nome.toLowerCase().includes(filtro.toLowerCase()) ||
        dados.subtipo.toLowerCase().includes(filtro.toLowerCase())
      );
    });
  }, [abaInterna, itensCatalogo, inventario, filtro]);

  return (
    <div className="inventarioWrapper">
      <div className="inventarioHeaderInterno">
        <div className="tabsInternas">
          <button
            className={abaInterna === "inventario" ? "active" : ""}
            onClick={() => setAbaInterna("inventario")}
          >
            🎒 Meu Inventário ({inventario.length})
          </button>
          <button
            className={abaInterna === "catalogo" ? "active" : ""}
            onClick={() => setAbaInterna("catalogo")}
          >
            📜 Catálogo Global
          </button>
        </div>

        <input
          type="text"
          placeholder={`🔍 Buscar em ${abaInterna === "inventario" ? "meu inventário" : "catálogo"}...`}
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="filtroInventario"
        />
      </div>

      <section className="inventarioConteudo">
        <div className="inventarioGrid">
          {itemsFiltrados.length === 0 ? (
            <p className="msgVazia">
              {abaInterna === "inventario"
                ? "Seu inventário está vazio."
                : "Nenhum item encontrado no catálogo."}
            </p>
          ) : (
            itemsFiltrados.map((item: any) => {
              const id = abaInterna === "catalogo" ? item.id : item.itemId;
              return (
                <ItemCard
                  key={`${abaInterna}-${id}`}
                  item={abaInterna === "catalogo" ? item : item.dados}
                  invData={abaInterna === "inventario" ? item : undefined}
                  contexto={abaInterna}
                  onAdd={() => adicionarAoInventario(id)}
                  onRemove={() => removerDoInventario(id)}
                  onAlterarQuantidade={(id, delta) => alterarQuantidade(id, delta)}
                  onEquipar={() => alternarEquipamento(id)}
                />
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
