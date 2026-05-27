"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { listarAreas, excluirArea, type Area } from "../../services/areaService";
import { abrirLoja, buscarMissoesNPC, obterDialogo, type NPC } from "../../services/npcService";
import type { Monstro, Missao, Item } from "../../types/domain";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import Loading from "../UI/Loading";
import Error from "../UI/Error";

const ICONE_TIPO: Record<string, string> = {
  Cidade:   "🏙️",
  Vila:     "🏘️",
  Floresta: "🌲",
  Caverna:  "🗻",
  Ruína:    "🏚️",
  Templo:   "⛩️",
  Reino:    "👑",
  Outro:    "📍",
};

export default function ListaAreas() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [cursor, setCursor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMais, setLoadingMais] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  
  const [aberta, setAberta] = useState<string | null>(null);
  const [detalhesArea, setDetalhesArea] = useState<Record<string, any>>({});

  // Estados para Modal de Interação
  const [npcSelecionado, setNpcSelecionado] = useState<NPC | null>(null);
  const [modoInteracao, setModoInteracao] = useState<"inicio" | "dialogo" | "loja" | "missoes">("inicio");
  const [itensLoja, setItensLoja] = useState<Item[]>([]);
  const [missoesNPC, setMissoesNPC] = useState<Missao[]>([]);
  const [dialogoNPC, setDialogoNPC] = useState<string>("");

  async function carregar(proxima = false) {
    if (proxima) setLoadingMais(true);
    else setLoading(true);
    setErro(null);
    try {
      const res = await listarAreas(proxima ? cursor : undefined);
      if (proxima) {
        setAreas(prev => [...prev, ...res.areas]);
      } else {
        setAreas(res.areas);
      }
      setCursor(res.cursor || null);
    } catch (e) {
      setErro("Falha ao carregar as áreas.");
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingMais(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  const handleToggleArea = async (id: string) => {
    if (aberta === id) {
      setAberta(null);
      return;
    }
    setAberta(id);
    if (!detalhesArea[id]) {
      const { buscarAreaCompleta } = await import("../../services/areaService");
      const completa = await buscarAreaCompleta(id);
      if (completa) {
        setDetalhesArea(prev => ({ ...prev, [id]: completa }));
      }
    }
  };

  const handleFalarComNPC = (npc: NPC) => {
    setNpcSelecionado(npc);
    setModoInteracao("inicio");
  };

  const handleAbrirLoja = async (npcId: string) => {
    const itens = await abrirLoja(npcId);
    setItensLoja(itens);
    setModoInteracao("loja");
  };

  const handleVerMissoes = async (npcId: string) => {
    const missoes = await buscarMissoesNPC(npcId, 1);
    setMissoesNPC(missoes);
    setModoInteracao("missoes");
  };

  const handleConversar = (npc: NPC) => {
    const dialogo = obterDialogo(npc, { id: "1", nome: "Viajante" } as any);
    setDialogoNPC(dialogo);
    setModoInteracao("dialogo");
  };

  if (loading) return <Loading mensagem="Mapeando territórios..." />;
  if (erro) return <Error mensagem={erro} onRetry={() => carregar()} />;

  return (
    <div className="listaAreas animate-in fade-in duration-300 w-full max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-black text-slate-800 dark:text-white">🌍 Mapa de Regiões</h1>
        <Link href="/areas/inserir" className="w-full sm:w-auto">
          <Button variant="primary" className="w-full">+ Nova Área</Button>
        </Link>
      </div>

      {areas.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-slate-400 mb-4">Nenhuma área mapeada ainda.</p>
          <Link href="/areas/inserir">
            <Button variant="primary">+ Criar Primeira Área</Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {areas.map((area) => {
          const expandida = aberta === area.id;
          const completa = detalhesArea[area.id];
          
          const npcsArea = completa?.npcs || [];
          const monstrosArea = completa?.monstros || [];
          const missoesArea = completa?.missoes || [];

          return (
            <div key={area.id} className={`cardArea bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300 ${expandida ? "ring-2 ring-amber-500 shadow-xl" : "hover:shadow-md"}`}>
              <div
                className="p-5 flex items-center gap-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                onClick={() => handleToggleArea(area.id)}
              >
                <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-3xl shadow-inner">
                  {ICONE_TIPO[area.tipo as string] ?? "📍"}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">{area.nome}</h3>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{area.tipo}</span>
                </div>
                <span className={`text-slate-300 transition-transform duration-300 ${expandida ? "rotate-180" : ""}`}>
                  ▼
                </span>
              </div>

              {expandida && (
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-8 animate-in slide-in-from-top-4 duration-300">
                  {!completa ? (
                    <div className="py-8 flex flex-col items-center gap-3">
                      <div className="animate-spin h-6 w-6 border-2 border-amber-500 border-t-transparent rounded-full"></div>
                      <p className="text-sm text-slate-400">Consultando registros locais...</p>
                    </div>
                  ) : (
                    <>
                      {area.descricao && <p className="text-slate-600 dark:text-slate-400 leading-relaxed italic">"{area.descricao}"</p>}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <h4 className="font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                            <span>👥 NPCs Presentes</span>
                            <span className="text-xs bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">{npcsArea.length}</span>
                          </h4>
                          {npcsArea.length > 0 ? (
                            <div className="space-y-2">
                              {npcsArea.map((n: NPC) => (
                                <div key={n.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                  <div className="flex items-center gap-3">
                                    <div className="relative h-10 w-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                                      <Image src={n.imagem || "/imagens/npcs/padrao.png"} alt={n.nome} fill className="object-cover" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold">{n.nome}</p>
                                      <p className="text-[10px] text-slate-500">{n.funcao}</p>
                                    </div>
                                  </div>
                                  <Button size="sm" variant="outline" onClick={() => handleFalarComNPC(n)}>
                                    Interagir
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : <p className="text-sm text-slate-400 italic">Área deserta.</p>}
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                            <span>📜 Missões Locais</span>
                            <span className="text-xs bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">{missoesArea.length}</span>
                          </h4>
                          {missoesArea.length > 0 ? (
                            <div className="space-y-2">
                              {missoesArea.map((m: Missao) => (
                                <Link key={m.id} href={`/missoes`} className="block p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-500 transition-colors shadow-sm">
                                  <div className="flex justify-between items-center">
                                    <p className="text-sm font-bold">{m.nome}</p>
                                    <span className={`h-2 w-2 rounded-full ${m.status === 'disponível' || m.status === 'disponivel' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          ) : <p className="text-sm text-slate-400 italic">Sem missões ativas.</p>}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                          <span>🐉 Perigos Detectados</span>
                          <span className="text-xs bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">{monstrosArea.length}</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {monstrosArea.map((m: any) => (
                            <span key={m.id} className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg border border-red-100 dark:border-red-900/50">
                              {m.nome} (v{m.nivel})
                            </span>
                          ))}
                          {monstrosArea.length === 0 && <span className="text-sm text-slate-400 italic">Região segura.</span>}
                        </div>
                        <Link href={`/combate?areaId=${area.id}`} className="inline-flex mt-2">
                          <Button variant="danger" className="shadow-lg shadow-red-500/20">
                            ⚔️ Iniciar Combate Local
                          </Button>
                        </Link>
                      </div>

                      <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                        <Link href={`/areas/editar/${area.id}`}>
                          <Button variant="outline" size="sm">✏️ Editar</Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm(`Excluir "${area.nome}"?`)) {
                              await excluirArea(area.id);
                              carregar();
                            }
                          }}
                        >
                          🗑 Excluir
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {cursor && (
        <div className="mt-12 text-center">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => carregar(true)} 
            disabled={loadingMais}
            className="px-8"
          >
            {loadingMais ? "Explorando..." : "Mapear Mais Regiões"}
          </Button>
        </div>
      )}

      {npcSelecionado && (
        <Modal 
          isOpen={true} 
          onClose={() => setNpcSelecionado(null)} 
          title={`Interagir com ${npcSelecionado.nome}`}
        >
          <div className="npcInteracao">
            <div className="npcHeader">
              <div className="relative h-20 w-20 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm">
                <Image 
                  src={npcSelecionado.imagem || "/imagens/npcs/padrao.png"} 
                  alt={npcSelecionado.nome} 
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white">{npcSelecionado.nome}</h3>
                <p className="text-sm text-amber-600 font-bold">{npcSelecionado.funcao} · {npcSelecionado.faccao}</p>
              </div>
            </div>
            
            <div className="npcConteudo mt-6">
              {modoInteracao === "inicio" && (
                <>
                  <p className="text-slate-600 dark:text-slate-400 italic mb-6">"{npcSelecionado.personalidade || npcSelecionado.descricao}"</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button variant="primary" className="h-12" onClick={() => handleConversar(npcSelecionado)}>
                      🗣️ Conversar
                    </Button>
                    {npcSelecionado.loja && (
                      <Button variant="success" className="h-12" onClick={() => handleAbrirLoja(npcSelecionado.id)}>
                        💰 Ver Mercadorias
                      </Button>
                    )}
                    {npcSelecionado.missoes && npcSelecionado.missoes.length > 0 && (
                      <Button variant="secondary" className="h-12 sm:col-span-2" onClick={() => handleVerMissoes(npcSelecionado.id)}>
                        📜 Pedir Trabalho
                      </Button>
                    )}
                  </div>
                </>
              )}

              {modoInteracao === "dialogo" && (
                <div className="space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border-l-4 border-amber-500 font-medium italic">
                    "{dialogoNPC}"
                  </div>
                  <Button variant="ghost" className="w-full" onClick={() => setModoInteracao("inicio")}>
                    Voltar
                  </Button>
                </div>
              )}

              {modoInteracao === "loja" && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-widest text-xs">Itens Disponíveis</h4>
                  <div className="max-h-[350px] overflow-y-auto pr-2 space-y-2">
                    {itensLoja.map(item => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                        <span className="font-bold text-sm">{item.nome}</span>
                        <span className="text-amber-600 font-black">🪙 {item.preco}</span>
                      </div>
                    ))}
                    {itensLoja.length === 0 && <p className="text-center py-8 text-slate-400 italic">O estoque está vazio.</p>}
                  </div>
                  <Button variant="ghost" className="w-full" onClick={() => setModoInteracao("inicio")}>
                    Voltar
                  </Button>
                </div>
              )}

              {modoInteracao === "missoes" && (
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 dark:text-white uppercase tracking-widest text-xs">Trabalhos Oferecidos</h4>
                  <div className="max-h-[350px] overflow-y-auto pr-2 space-y-3">
                    {missoesNPC.map(m => (
                      <div key={m.id} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
                        <div className="flex justify-between items-start">
                          <h5 className="font-bold text-slate-800 dark:text-white">{m.nome}</h5>
                          <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 px-2 py-0.5 rounded-full font-bold">Nível {m.nivelRecomendado}</span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 italic">"{m.descricao}"</p>
                        <Button size="small" className="w-full">Aceitar Missão</Button>
                      </div>
                    ))}
                    {missoesNPC.length === 0 && <p className="text-center py-8 text-slate-400 italic">Sem trabalhos no momento.</p>}
                  </div>
                  <Button variant="ghost" className="w-full" onClick={() => setModoInteracao("inicio")}>
                    Voltar
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <style jsx>{`
            .npcHeader { display: flex; gap: 1.5rem; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 1.5rem; }
            :global(.dark) .npcHeader { border-color: rgba(255,255,255,0.05); }
          `}</style>
        </Modal>
      )}
    </div>
  );
}
