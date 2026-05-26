"use client";

import { useEffect, useState, useMemo } from "react";
import { useInventario } from "../../../contexts/InventarioContext";
import { listarItens, buscarItem } from "../../../services/itemService";
import ItemCard from "./ItemCard";
import type { Item, InventarioItem } from "../../../types/domain";

export default function Inventario({ personagemId }: { personagemId: number }) {
  const { 
    inventario, 
    adicionarItem, 
    removerItem, 
    alterarQuantidade, 
    alternarEquipamento,
    salvarMudancas 
  } = useInventario();

  const [catalogo, setCatalogo] = useState<Item[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<"inventario" | "catalogo">("inventario");
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    setCatalogo(listarItens());
  }, []);

  const itensFiltrados = useMemo(() => {
    const lista = abaAtiva === "catalogo" ? catalogo : inventario.map(inv => {
      const itemInfo = buscarItem(inv.itemId);
      return { ...itemInfo, invData: inv } as any;
    }).filter(i => i !== null);

    if (!filtro) return lista;
    
    return lista.filter((i: any) => 
      i.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      i.subtipo.toLowerCase().includes(filtro.toLowerCase())
    );
  }, [abaAtiva, catalogo, inventario, filtro]);

  const handleSalvar = () => {
    salvarMudancas(personagemId, inventario);
  };

  return (
    <div className="inventarioContainer">
      <div className="inventarioHeader">
        <div className="tabs">
          <button 
            className={abaAtiva === "inventario" ? "active" : ""} 
            onClick={() => setAbaAtiva("inventario")}
          >
            🎒 Meu Inventário ({inventario.length})
          </button>
          <button 
            className={abaAtiva === "catalogo" ? "active" : ""} 
            onClick={() => setAbaAtiva("catalogo")}
          >
            📜 Catálogo de Itens
          </button>
        </div>

        <div className="inventarioControles">
          <input 
            type="text" 
            placeholder="Filtrar itens..." 
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="filtroInventario"
          />
          <button className="btnSalvarInventario" onClick={handleSalvar}>
            💾 Salvar Alterações
          </button>
        </div>
      </div>

      <div className="inventarioGrid">
        {itensFiltrados.length === 0 ? (
          <p className="msgVazia">Nenhum item encontrado.</p>
        ) : (
          itensFiltrados.map((item: any) => (
            <ItemCard
              key={item.id}
              item={item}
              invData={abaAtiva === "inventario" ? item.invData : undefined}
              contexto={abaAtiva === "catalogo" ? "catalogo" : "inventario"}
              onAdd={adicionarItem}
              onRemove={removerItem}
              onAlterarQuantidade={alterarQuantidade}
              onEquipar={(itemId) => alternarEquipamento(personagemId, itemId)}
            />
          ))
        )}
      </div>
    </div>
  );
}
