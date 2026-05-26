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
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    setCatalogo(listarItens());
  }, []);

  const catalogoFiltrado = useMemo(() => {
    return catalogo.filter((i: Item) => 
      i.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      i.subtipo.toLowerCase().includes(filtro.toLowerCase())
    ).slice(0, 12); // Limitar catálogo inicial para performance
  }, [catalogo, filtro]);

  const meuInventario = useMemo(() => {
    return inventario.map(inv => {
      const itemInfo = buscarItem(inv.itemId);
      if (!itemInfo) return null;
      return { ...itemInfo, invData: inv };
    }).filter(i => i !== null) as any[];
  }, [inventario]);

  const handleSalvar = () => {
    salvarMudancas(personagemId, inventario);
  };

  return (
    <div className="inventarioWrapper">
      <div className="inventarioControlesGlobais">
        <input 
          type="text" 
          placeholder="🔍 Buscar itens no catálogo ou inventário..." 
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="filtroInventario"
        />
        <button className="btnSalvarInventario" onClick={handleSalvar}>
          💾 Salvar Alterações
        </button>
      </div>

      <section className="inventarioSecao">
        <h2 className="tituloSecao">🎒 Inventário do Personagem ({inventario.length})</h2>
        <div className="inventarioGrid">
          {meuInventario.length === 0 ? (
            <p className="msgVazia">Inventário vazio. Adicione itens do catálogo abaixo.</p>
          ) : (
            meuInventario.map((item: any) => (
              <ItemCard
                key={`inv-${item.id}`}
                item={item}
                invData={item.invData}
                contexto="inventario"
                onRemove={removerItem}
                onAlterarQuantidade={alterarQuantidade}
                onEquipar={(itemId) => alternarEquipamento(personagemId, itemId)}
              />
            ))
          )}
        </div>
      </section>

      <hr className="divisorSecao" />

      <section className="inventarioSecao">
        <h2 className="tituloSecao">📜 Catálogo de Itens Globais</h2>
        <div className="inventarioGrid">
          {catalogoFiltrado.map((item: Item) => (
            <ItemCard
              key={`cat-${item.id}`}
              item={item}
              contexto="catalogo"
              onAdd={adicionarItem}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
