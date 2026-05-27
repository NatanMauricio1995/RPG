"use client";

import { useState, useEffect } from "react";
import { listarNPCs, NPC } from "../../services/npcService";
import Image from "next/image";
import Link from "next/link";
import Loading from "../UI/Loading";
import Error from "../UI/Error";
import Button from "../UI/Button";
import type { QueryDocumentSnapshot } from "firebase/firestore";

export default function ListaNPCs() {
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [cursor, setCursor] = useState<QueryDocumentSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMais, setLoadingMais] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function carregar(proxima = false) {
    try {
      if (proxima) setLoadingMais(true);
      else setLoading(true);
      setErro(null);

      const res = await listarNPCs(proxima ? (cursor || undefined) : undefined);
      if (proxima) {
        setNpcs(prev => [...prev, ...res.npcs]);
      } else {
        setNpcs(res.npcs);
      }
      setCursor(res.cursor || null);
    } catch (e) {
      setErro("Falha ao carregar habitantes do mundo.");
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingMais(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  if (loading) return <Loading mensagem="Convocando habitantes..." />;
  if (erro) return <Error mensagem={erro} onRetry={() => carregar()} />;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
        <h1 className="text-3xl font-black text-slate-800 dark:text-white">✦ Habitantes do Mundo ✦</h1>
        <Link href="/npcs/inserir" className="w-full sm:w-auto">
          <Button variant="primary" className="w-full">+ Novo Habitante</Button>
        </Link>
      </div>

      {npcs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xl text-slate-400 mb-6">Nenhum NPC encontrado nestas terras.</p>
          <Link href="/npcs/inserir">
            <Button variant="primary">Criar Primeiro NPC</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {npcs.map(npc => (
              <div key={npc.id} className="group bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative h-48 w-full overflow-hidden">
                  <Image 
                    src={npc.imagem || "/imagens/npcs/padrao.png"} 
                    alt={npc.nome} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">
                    {npc.faccao} | {npc.profissao || npc.funcao}
                  </div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">{npc.nome}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 italic">"{npc.personalidade || npc.descricao}"</p>
                  
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Link href={`/npcs/${npc.id}`}>
                      <Button variant="outline" className="w-full">Ver Detalhes</Button>
                    </Link>
                  </div>
                </div>
              </div>
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
                {loadingMais ? "Buscando..." : "Explorar Mais Habitantes"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
