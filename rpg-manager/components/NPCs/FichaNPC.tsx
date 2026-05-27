"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { buscarNPCComMissoes } from "../../services/npcService";
import { buscarItem } from "../../services/itemService";
import type { NPC } from "../../services/npcService";
import type { Item, Missao } from "../../types/domain";
import Loading from "../UI/Loading";
import Error from "../UI/Error";
import Button from "../UI/Button";

const COR_FACCAO: Record<string, string> = {
  Aliado:   "#4caf50",
  Neutro:   "#aaa",
  Inimigo:  "#f44336",
  Mercador: "#ff9800",
};

type Props = { npcId: string };

export default function FichaNPC({ npcId }: Props) {
  const [npc, setNpc] = useState<(NPC & { missoesDetalhes: Missao[] }) | null>(null);
  const [itensLoja, setItensLoja] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [dialogoAberto, setDialogoAberto] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        const dados = await buscarNPCComMissoes(npcId);
        setNpc(dados);

        // Resolver itens da loja se houver
        if (dados.loja?.itensIds) {
          const res = await Promise.all(dados.loja.itensIds.map(id => buscarItem(id)));
          setItensLoja(res.filter((i): i is Item => !!i));
        }
      } catch (e) {
        setErro("Não foi possível encontrar este habitante.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [npcId]);

  if (loading) return <Loading mensagem="Procurando habitante..." />;
  if (erro || !npc) return <Error mensagem={erro || "Habitante não encontrado."} />;

  const faccao = npc.faccao || "Neutro";
  const dialogos = (npc as any).dialogos || [];

  return (
    <div className="fichaNPC container animate-in fade-in duration-500">
      <div className="mb-6">
        <Link href="/npcs">
          <Button variant="ghost">⬅️ Voltar ao Mural</Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header com estilo RPG */}
        <div className="relative h-32 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="absolute -bottom-12 left-8">
            <div className="relative h-32 w-32 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-900 shadow-lg">
              <Image
                src={npc.imagem || "/imagens/npcs/padrao.png"}
                alt={npc.nome}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="pt-16 px-8 pb-8 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-4xl font-black text-slate-800 dark:text-white">{npc.nome}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-amber-600 font-bold uppercase tracking-widest text-xs">{npc.profissao || npc.funcao}</span>
                <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
                <span 
                  className="px-2 py-0.5 rounded text-[10px] font-black uppercase text-white shadow-sm"
                  style={{ background: COR_FACCAO[faccao] || "#aaa" }}
                >
                  {faccao}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" size="sm">Falar</Button>
              {npc.loja && <Button variant="success" size="sm">Trocar</Button>}
            </div>
          </div>

          <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed italic">
            "{npc.personalidade || npc.descricao}"
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Seção de Missões Popoladas */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span>📜</span> Missões Disponíveis
              </h2>
              <div className="space-y-3">
                {npc.missoesDetalhes.length > 0 ? (
                  npc.missoesDetalhes.map((m) => (
                    <div key={m.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{m.nome}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Status: {m.status}</p>
                      </div>
                      <Link href={`/missoes`}>
                        <Button size="small" variant="outline">Ver Mural</Button>
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 italic px-2">Nenhum trabalho oferecido no momento.</p>
                )}
              </div>
            </section>

            {/* Seção de Loja */}
            {npc.loja && (
              <section className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span>🛒</span> Mercadorias
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {itensLoja.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                      <div className="relative h-10 w-10 flex-shrink-0">
                        <Image
                          src={item.imagem || "/imagens/itens/padrao.png"}
                          alt={item.nome}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{item.nome}</p>
                        <p className="text-[10px] text-amber-600 font-black">🪙 {item.preco}</p>
                      </div>
                    </div>
                  ))}
                  {itensLoja.length === 0 && <p className="text-sm text-slate-400 italic col-span-2 px-2">Estoque esgotado.</p>}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
