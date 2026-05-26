"use client";

import { useState, useEffect } from "react";
import { listarMissoes } from "../../services/missaoServiceFirebase";
import type { Missao } from "../../types/domain";
import Link from "next/link";

export default function ListaMissoes() {
  const [missoes, setMissoes] = useState<Missao[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    listarMissoes().then(dados => {
      setMissoes(dados);
      setCarregando(false);
    });
  }, []);

  if (carregando) return <div className="carregando">Consultando editais...</div>;

  return (
    <div className="habilidadesGrid">
      {missoes.map(missao => (
        <div key={missao.id} className="cardHabilidade">
          <div className="conteudoHabilidade">
            <div className="tipoHabilidade">{missao.status} | Nível {missao.nivelRecomendado}</div>
            <h3 className="nomeHabilidade">{missao.nome}</h3>
            <p className="descricaoHabilidade">{missao.descricao}</p>
            <div className="statsHabilidade">
               <div className="statHabilidade">
                  <span className="statLabel">XP:</span>
                  <span className="statValor">{missao.recompensas.xp}</span>
               </div>
               <div className="statHabilidade">
                  <span className="statLabel">Ouro:</span>
                  <span className="statValor">{missao.recompensas.ouro}</span>
               </div>
            </div>
          </div>
          <div className="acoesHabilidade">
             <Link href={`/missoes/${missao.id}`} className="botaoHabilidade botaoEditarHabilidade">Ver Objetivos</Link>
          </div>
        </div>
      ))}
    </div>
  );
}
