"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { listarMissoes, excluirMissao, type Missao } from "../../services/missaoService";
import Loading from "../UI/Loading";
import Error from "../UI/Error";
import Button from "../UI/Button";
import { useToast } from "../UI/Toast";

const COR_STATUS: Record<string, string> = {
  "Não iniciada": "bg-slate-400",
  "Em andamento": "bg-amber-500",
  "Concluída":    "bg-emerald-500",
  "Falhou":       "bg-rose-500",
};

export default function ListaMissoes() {
  const { adicionarToast } = useToast();
  const [missoes, setMissoes] = useState<Missao[]>([]);
  const [filtro,  setFiltro]  = useState<string>("Todas");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);
      const lista = await listarMissoes();
      setMissoes(lista);
    } catch (e) {
      setErro("Falha ao carregar o mural de missões.");
      adicionarToast("erro", "Erro ao carregar missões.");
    } finally {
      setCarregando(false);
    }
  }, [adicionarToast]);

  useEffect(() => { carregar(); }, [carregar]);

  const STATUS_OPCOES = ["Todas", "Não iniciada", "Em andamento", "Concluída", "Falhou"];

  const filtradas = filtro === "Todas"
    ? missoes
    : missoes.filter((m) => m.status === filtro);

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

  if (carregando) return <Loading mensagem="Consultando o mural de missões..." />;
  if (erro) return <Error mensagem={erro} onRetry={carregar} />;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Filtros de Status */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center sm:justify-start">
        {STATUS_OPCOES.map((s) => (
          <button
            key={s}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all border-2 ${
              filtro === s
                ? "bg-amber-500 border-amber-500 text-white shadow-md"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300"
            }`}
            onClick={() => setFiltro(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {filtradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xl text-slate-400 mb-6">Nenhuma missão encontrada para este filtro.</p>
          <Link href="/missoes/inserir">
            <Button variant="primary">+ Publicar Nova Missão</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtradas.map((m) => {
            const objetivos: any[] = (m as any).objetivos ?? [];
            const recompensas: any = (m as any).recompensas ?? {};

            return (
              <div key={m.id} className="group bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-300">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">{m.nome}</h3>
                    <span className={`flex-shrink-0 px-2 py-1 rounded-lg text-[10px] font-black uppercase text-white ${COR_STATUS[m.status] ?? "bg-slate-400"}`}>
                      {m.status}
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-3 italic">"{m.descricao}"</p>

                  {(m as any).nivelRecomendado && (
                    <div className="flex items-center gap-2 mb-6 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                      <span className="text-amber-600 font-bold">⚔️ Nível { (m as any).nivelRecomendado }</span>
                      <span className="text-xs text-slate-400">recomendado</span>
                    </div>
                  )}

                  {objetivos.length > 0 && (
                    <div className="space-y-3 mb-6">
                      <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Objetivos</p>
                      {objetivos.map((obj: any, i: number) => {
                        const progresso = obj.quantidadeAtual ?? 0;
                        const total = obj.quantidadeTotal ?? 1;
                        const pct = Math.min(100, (progresso / total) * 100);
                        return (
                          <div key={i} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className={obj.concluido ? "line-through text-slate-400" : "font-medium"}>{obj.descricao}</span>
                              <span className="font-bold">{progresso}/{total}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all ${obj.concluido ? "bg-emerald-500" : "bg-amber-500"}`} 
                                style={{ width: `${pct}%` }} 
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {recompensas.xp && (
                      <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg border border-indigo-100 dark:border-indigo-800">
                        ⭐ {recompensas.xp} XP
                      </span>
                    )}
                    {recompensas.ouro && (
                      <span className="px-2 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-lg border border-amber-100 dark:border-amber-800">
                        💰 {recompensas.ouro} Ouro
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                  <Link href={`/missoes/${m.id}/editar`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">Editar</Button>
                  </Link>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleExcluir(m.id)}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}