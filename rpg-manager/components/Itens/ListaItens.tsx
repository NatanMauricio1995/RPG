"use client";

import {useState, useEffect} from "react";
import Link from "next/link";

import {listarItens, excluirItem} from "../../services/itemService";
import type { Item } from "../../types/domain";

import CardItem from "./CardItem";

export default function ListaItens(){
  const [itens, setItens] = useState<Item[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [tipo, setTipo] = useState("");

  useEffect(() => {
    async function carregar() {
      const dados = await listarItens();
      setItens(dados);
      setCarregando(false);
    }
    carregar();
  }, []);

  async function handleExcluir(id: string) {
    if (!window.confirm("Deseja realmente excluir este item?")) return;
    try {
      await excluirItem(id);
      setItens(prev => prev.filter(item => String(item.id) !== id));
    } catch (error) {
      console.error("Erro ao excluir item:", error);
    }
  }

  const itensFiltrados = itens.filter(item => {
    if (!tipo) return true;
    return item.tipo === tipo;
  });

  if (carregando) return <div className="carregando">Mapeando tesouros...</div>;

  return (
    <div>
      <div className="topoItens">
        <h1>🎒 Itens</h1>
        <Link href="/itens/inserir">
          <button className="botaoNovo">➕ Novo Item</button>
        </Link>
      </div>

      <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
        <option value="">Todos</option>
        <option value="Equipamento">Equipamento</option>
        <option value="Consumível">Consumível</option>
        <option value="Diversos">Diversos</option>
      </select>

      <div className="listaItensGrid">
        {itensFiltrados.map(item => (
          <CardItem
            key={item.id}
            item={item}
            onExcluir={() => handleExcluir(String(item.id))}
          />
        ))}
      </div>
    </div>
  );
}
