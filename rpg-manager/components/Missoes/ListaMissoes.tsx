"use client";

import { useState, useEffect } from "react";
import { listarMissoes, Missao } from "../../services/missaoService";
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
            <div className="tipoHabilidade">{missao.status}</div>
            <h3 className="nomeHabilidade">{missao.nome}</h3>
            <p className="descricaoHabilidade">{missao.descricao}</p>
            <div className="statsHabilidade">
               <div className="statHabilidade">
                  <span className="statLabel">Objetivo:</span>
                  <span className="statValor">{missao.objetivo}</span>
               </div>
               <div className="statHabilidade">
                  <span className="statLabel">Recompensa:</span>
                  <span className="statValor">{missao.recompensa}</span>
               </div>
            </div>
          </div>
          <div className="acoesHabilidade">
             <Link href={`/missoes/${missao.id}`} className="botaoHabilidade botaoEditarHabilidade">Ver Detalhes</Link>
          </div>
        </div>
      ))}
    </div>
  );
}
