"use client";

import { useState, useEffect } from "react";
import { listarNPCs } from "../../services/npcServiceFirebase";
import type { NPC } from "../../types/domain";
import Image from "next/image";
import Link from "next/link";

export default function ListaNPCs() {
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    listarNPCs().then(dados => {
      setNpcs(dados);
      setCarregando(false);
    });
  }, []);

  if (carregando) return <div className="carregando">Convocando habitantes...</div>;

  return (
    <div className="habilidadesGrid">
      {npcs.map(npc => (
        <div key={npc.id} className="cardHabilidade">
          <Image src={npc.imagem || "/imagens/npcs/padrao.png"} alt={npc.nome} width={300} height={200} className="imagemHabilidade" />
          <div className="conteudoHabilidade">
            <div className="tipoHabilidade">{npc.faccao} | {npc.funcao}</div>
            <h3 className="nomeHabilidade">{npc.nome}</h3>
            <p className="descricaoHabilidade">{npc.descricao}</p>
          </div>
          <div className="acoesHabilidade">
             <Link href={`/npcs/${npc.id}`} className="botaoHabilidade botaoEditarHabilidade">Ver Detalhes</Link>
          </div>
        </div>
      ))}
    </div>
  );
}
