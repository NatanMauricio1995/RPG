"use client";

import Image from "next/image";
import {Combatente} from "../../services/combateService";
import BarraStatusCombate from "./BarraStatusCombate";

type Props={
titulo:string;
combatentes:Combatente[];
atualId:string;
};

export default function GrupoCombatentes({
titulo,
combatentes,
atualId
}:Props){

return(
<div className="grupoCombatentes">
<h2>{titulo}</h2>
{combatentes.map((combatente)=>(
<article
key={combatente.id}
className={`cardCombatente ${combatente.id===atualId ? "ativo" : ""} ${!combatente.vivo ? "morto" : ""}`}
>
<Image
src={combatente.imagem}
alt={combatente.nome}
width={86}
height={86}
/>
<div className="dadosCombatente">
<div className="linhaNomeCombatente">
<h3>{combatente.nome}</h3>
<span>CA {combatente.armadura}</span>
</div>
<BarraStatusCombate
classe="vida"
valor={combatente.vidaAtual}
maximo={combatente.vidaMaxima}
rotulo="Vida"
/>
<BarraStatusCombate
classe="mana"
valor={combatente.manaAtual}
maximo={Math.max(1,combatente.manaMaxima)}
rotulo="Mana"
/>
<div className="metasCombatente">
<span>Crítico {combatente.critico}%</span>
<span>Esquiva {combatente.esquiva}%</span>
<span>Escudo {combatente.escudo}</span>
</div>
{combatente.efeitos.length>0 &&(
<div className="efeitosAtivosCombate">
{combatente.efeitos.map((efeito,index)=>(
<span key={`${efeito.tipo}-${index}`}>
{efeito.tipo} {efeito.valor}/{efeito.duracao}
</span>
))}
</div>
)}
</div>
</article>
))}
</div>
);

}
