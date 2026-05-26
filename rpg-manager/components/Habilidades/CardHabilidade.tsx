"use client";

import Image from "next/image";
import Link from "next/link";
import type { Habilidade } from "../../types/domain";

type Props = {
  habilidade: Habilidade;
  onExcluir?: (id: string) => void;
};

export default function CardHabilidade({ habilidade, onExcluir }: Props) {
  return (
    <div className="cardHabilidade">
      <Image
        src={habilidade.imagem || "/imagens/habilidades/padrao.png"}
        alt={habilidade.nome}
        width={300}
        height={160}
        className="imagemHabilidade"
      />
      <div className="conteudoHabilidade">
        <div className="tipoHabilidade">{habilidade.tipo} | {habilidade.categoria}</div>
        <h3 className="nomeHabilidade">{habilidade.nome}</h3>
        <p className="descricaoHabilidade">{habilidade.descricao}</p>
        
        <div className="statsHabilidade">
          <div className="statHabilidade">
            <span className="statLabel">Custo:</span>
            <span className="statValor">{habilidade.custoMana} MP</span>
          </div>
          <div className="statHabilidade">
            <span className="statLabel">CD:</span>
            <span className="statValor">{habilidade.cooldown} T</span>
          </div>
          <div className="statHabilidade">
            <span className="statLabel">Alcance:</span>
            <span className="statValor">{habilidade.alcance}m</span>
          </div>
          <div className="statHabilidade">
            <span className="statLabel">Área:</span>
            <span className="statValor">{habilidade.area}m</span>
          </div>
        </div>
      </div>
      
      <div className="acoesHabilidade">
        <Link 
          href={`/habilidades/editar/${habilidade.id}`}
          className="botaoHabilidade botaoEditarHabilidade"
        >
          Editar
        </Link>
        <button 
          onClick={() => onExcluir?.(habilidade.id)}
          className="botaoHabilidade botaoExcluirHabilidade"
        >
          Excluir
        </button>
      </div>
    </div>
  );
}
