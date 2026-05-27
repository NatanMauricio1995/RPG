"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { listarMissoes, excluirMissao, type Missao } from "../../services/missaoService";
import Loading from "../UI/Loading";
import Error from "../UI/Error";
import Button from "../UI/Button";
import { useToast } from "../UI/Toast";
import type { QueryDocumentSnapshot } from "firebase/firestore";

const COR_STATUS: Record<string, string> = {
  "disponivel":    "bg-slate-400",
  "disponível":    "bg-slate-400",
  "em_andamento":  "bg-amber-500",
  "concluida":     "bg-emerald-500",
  "concluída":     "bg-emerald-500",
  "falhou":        "bg-rose-500",
};

export default function ListaMissoes() {
  const { adicionarToast } = useToast();
  const [missoes, setMissoes] = useState<Missao[]>([]);
  const [filtro,  setFiltro]  = useState<string>("Todas");
  const [cursor, setCursor] = useState<QueryDocumentSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMais, setLoadingMais] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async (proxima = false) => {
    try {
      if (proxima) setLoadingMais(true);
      else setLoading(true);
      setErro(null);

      const statusFiltro = filtro === "Todas" ? undefined : filtro;
      const res = await listarMissoes(statusFiltro as any, proxima ? (cursor || undefined) : undefined);
      
      if (proxima) {
        setMissoes(prev => [...prev, ...res.missoes]);
      } else {
        setMissoes(res.missoes);
      }
      setCursor(res.cursor || null);
    } catch (e) {
      setErro("Falha ao carregar o mural de missões.");
      adicionarToast("erro", "Erro ao carregar missões.");
    } finally {
      setLoading(false);
      setLoadingMais(false);
    }
  }, [adicionarToast, filtro, cursor]);

  useEffect(() => { carregar(); }, [filtro]); // Recarrega ao mudar filtro

  const STATUS_OPCOES = ["Todas", "disponível", "em_andamento", "concluída", "falhou"];

  const handleExcluir = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover esta missão do mural?")) return;
    try {
      await excluirMissao(id);
      adicionarToast("sucesso", "Missão removida!");
      carregar();
    } catch (e) {
      adicionarToast("erro", "Erro ao excluir missão.");
    }
  };

  if (loading) return <Loading mensagem="Consultando o mural de missões..." />;
  if (erro) return <Error mensagem={erro} onRetry={() => carregar()} />;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <h1 className="text-3xl font-black text-slate-800 dark:text-white">📜 Mural de Aventuras</h1>
        
        {/* Filtros de Status */}
        <div className="flex flex-wrap gap-2 justify-center">
          {STATUS_OPCOES.map((s) => (
            <button
              key={s}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                filtro === s
                  ? "bg-amber-500 border-amber-500 text-white shadow-lg"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-300"
              }`}
              onClick={() => setFiltro(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <Link href="/missoes/inserir" className="w-full md:w-auto">
          <Button variant="primary" className="w-full">+ Nova Missão</Button>
        </Link>
      </div>

      {missoes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xl text-slate-400 mb-6">O mural está vazio no momento.</p>
          <Link href="/missoes/inserir">
            <Button variant="primary">Fixar Primeira Missão</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {missoes.map((m) => (
              <div key={m.id} className="group bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight">{m.nome}</h3>
                    <span className={`flex-shrink-0 px-2 py-1 rounded-lg text-[9px] font-black uppercase text-white shadow-sm ${COR_STATUS[m.status] || "bg-slate-400"}`}>
                      {m.status}
                    </span>
                  </div>

                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-3 italic">"{m.descricao}"</p>

                  {m.nivelRecomendado && (
                    <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-full border border-amber-100 dark:border-amber-900/50">
                      <span className="text-amber-600 text-xs font-black uppercase tracking-tighter">⚔️ Nível {m.nivelRecomendado}</span>
                    </div>
                  )}

                  {/* Recompensas */}
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {m.recompensas?.xp && (
                      <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                        ⭐ {m.recompensas.xp} XP
                      </span>
                    )}
                    {m.recompensas?.ouro && (
                      <span className="px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 text-[10px] font-black rounded-lg border border-yellow-100 dark:border-yellow-900/50">
                        💰 {m.recompensas.ouro} Ouro
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                  <Link href={`/missoes/${m.id}/editar`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">Editar</Button>
                  </Link>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleExcluir(m.id)}
                  >
                    Remover
                  </Button>
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
                {loadingMais ? "Consultando..." : "Ver Mais Missões"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
