"use client";

import { useState, useEffect } from "react";
import { listarNPCs, NPC } from "../../services/npcService";
import Image from "next/image";
import Link from "next/link";

export default function ListaNPCs() {
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setErro(null);
    listarNPCs()
      .then(dados => {
        setNpcs(dados);
      })
      .catch(e => {
        setErro("Falha ao carregar NPCs.");
        console.error(e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="carregando">Convocando habitantes...</div>;
  if (erro) return <div className="erroMensagem">{erro}</div>;

  return (
    <div className="habilidadesGrid">
      {npcs.map(npc => (
        <div key={npc.id} className="cardHabilidade">
          <Image src={npc.imagem || "/imagens/npcs/padrao.png"} alt={npc.nome} width={300} height={200} className="imagemHabilidade" />
          <div className="conteudoHabilidade">
            <div className="tipoHabilidade">{npc.alinhamento} | {npc.profissao}</div>
            <h3 className="nomeHabilidade">{npc.nome}</h3>
            <p className="descricaoHabilidade">{npc.personalidade}</p>
          </div>
          <div className="acoesHabilidade">
             <Link href={`/npcs/${npc.id}`} className="botaoHabilidade botaoEditarHabilidade">Ver Detalhes</Link>
          </div>
        </div>
      ))}
    </div>
  );
}
