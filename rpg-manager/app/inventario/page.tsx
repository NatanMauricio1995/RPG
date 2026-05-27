"use client";

import { useEffect, useState, useCallback } from "react";
import { listarPersonagens } from "../../services/personagemService";
import Loading from "../../components/UI/Loading";
import Error from "../../components/UI/Error";
import { useToast } from "../../components/UI/Toast";
import Inventario from "../../components/Personagem/Inventario/Inventario";
import Image from "next/image";

export default function InventarioGeralPage() {
  const { adicionarToast } = useToast();
  const [personagens, setPersonagens] = useState<any[]>([]);
  const [personagemSelecionadoId, setPersonagemSelecionadoId] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);
      const p = await listarPersonagens();
      setPersonagens(p);
      if (p.length > 0) {
        setPersonagemSelecionadoId(p[0].id);
      }
    } catch (e) {
      setErro("Não foi possível carregar os personagens.");
      adicionarToast("erro", "Erro ao carregar dados.");
    } finally {
      setCarregando(false);
    }
  }, [adicionarToast]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  if (carregando) return <Loading mensagem="Abrindo baús de itens..." />;
  if (erro) return <Error mensagem={erro} onRetry={carregar} />;

  if (personagens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <div className="text-6xl mb-4">🎒</div>
        <h2 className="text-2xl font-bold mb-2">Nenhum aventureiro encontrado</h2>
        <p className="text-slate-500 mb-6">Crie um personagem primeiro para gerenciar seu inventário.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">🎒 Gestão de Inventários</h1>
        <p className="text-slate-500 dark:text-slate-400">Gerencie os itens e equipamentos de todos os seus personagens em um só lugar.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar de Seleção de Personagem */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 px-2">Personagens</h3>
          <div className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0">
            {personagens.map((p) => (
              <button
                key={p.id}
                onClick={() => setPersonagemSelecionadoId(p.id)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all min-w-[200px] lg:min-w-0 border-2 ${
                  personagemSelecionadoId === p.id
                    ? "bg-amber-500/10 border-amber-500 text-amber-700 shadow-sm"
                    : "bg-white dark:bg-slate-900 border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                }`}
              >
                <div className="relative h-10 w-10 rounded-full overflow-hidden border border-slate-200">
                  <Image
                    src={p.imagem || "/imagens/personagens/padrao.png"}
                    alt={p.nome}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm truncate">{p.nome}</p>
                  <p className="text-xs opacity-60">Nível {p.nivel}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Área do Inventário */}
        <div className="lg:col-span-3">
          {personagemSelecionadoId ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h2 className="font-bold text-lg">Inventário de {personagens.find(p => p.id === personagemSelecionadoId)?.nome}</h2>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-bold uppercase">Mochila</span>
              </div>
              <div className="p-6">
                <Inventario personagemId={personagemSelecionadoId} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[300px] bg-slate-50 dark:bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-slate-400">Selecione um personagem para ver seu inventário.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
