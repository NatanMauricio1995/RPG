"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { listarItens, excluirItem } from "../../services/itemService";
import type { Item } from "../../types/domain";
import CardItem from "./CardItem";
import Loading from "../UI/Loading";
import Error from "../UI/Error";
import Button from "../UI/Button";
import type { QueryDocumentSnapshot } from "firebase/firestore";

export default function ListaItens() {
  const [itens, setItens] = useState<Item[]>([]);
  const [tipo, setTipo] = useState("");
  const [cursor, setCursor] = useState<QueryDocumentSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMais, setLoadingMais] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar(proxima = false) {
    try {
      if (proxima) setLoadingMais(true);
      else setLoading(true);
      setErro(null);

      const res = await listarItens(tipo || undefined, proxima ? (cursor || undefined) : undefined);
      
      if (proxima) {
        setItens(prev => [...prev, ...res.itens]);
      } else {
        setItens(res.itens);
      }
      setCursor(res.cursor || null);
    } catch (error) {
      setErro("Falha ao carregar o inventário global.");
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingMais(false);
    }
  }

  useEffect(() => {
    carregar();
  }, [tipo]);

  async function handleExcluir(id: string) {
    if (!window.confirm("Deseja realmente destruir este item permanentemente?")) return;
    try {
      await excluirItem(id);
      setItens(prev => prev.filter(item => String(item.id) !== id));
    } catch (error) {
      console.error("Erro ao excluir item:", error);
    }
  }

  if (loading) return <Loading mensagem="Mapeando tesouros e artefatos..." />;
  if (erro) return <Error mensagem={erro} onRetry={() => carregar()} />;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <h1 className="text-3xl font-black text-slate-800 dark:text-white">🎒 Acervo de Itens</h1>
        
        <div className="flex gap-4 w-full md:w-auto">
          <select 
            value={tipo} 
            onChange={(e) => setTipo(e.target.value)}
            className="flex-1 md:w-48 p-2.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-sm font-bold focus:border-amber-500 outline-none transition-colors"
          >
            <option value="">Todos os Tipos</option>
            <option value="Equipamento">⚔️ Equipamento</option>
            <option value="Consumível">🧪 Consumível</option>
            <option value="Diversos">📦 Diversos</option>
          </select>

          <Link href="/itens/inserir" className="flex-shrink-0">
            <Button variant="primary" className="h-full">+ Novo Item</Button>
          </Link>
        </div>
      </div>

      {itens.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xl text-slate-400 mb-6">Nenhum item encontrado no acervo.</p>
          <Link href="/itens/inserir">
            <Button variant="primary">Forjar Primeiro Item</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {itens.map(item => (
              <CardItem
                key={item.id}
                item={item}
                onExcluir={() => handleExcluir(String(item.id))}
              />
            ))}
          </div>

          {cursor && (
            <div className="mt-16 text-center">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => carregar(true)} 
                disabled={loadingMais}
                className="px-12"
              >
                {loadingMais ? "Buscando..." : "Ver Mais Itens"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
