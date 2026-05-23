"use client";

import {useEffect,useState} from "react";
import Link from "next/link";
import CardNPC from "./CardNPC";
import {NPC,listarNPCs} from "../../services/npcService";

export default function ListaNPCs(){

const[npcs,setNPCs]=useState<NPC[]>([]);
const[pesquisa,setPesquisa]=useState("");
const[alinhamento,setAlinhamento]=useState("");

function recarregar(){
setNPCs(listarNPCs());
}

useEffect(()=>{
recarregar();
},[]);

const filtrados=npcs.filter((npc)=>{
const texto=`${npc.nome} ${npc.profissao} ${npc.personalidade}`.toLowerCase();
const pesquisaOk=texto.includes(pesquisa.toLowerCase());
const alinhamentoOk=!alinhamento || npc.alinhamento===alinhamento;

return pesquisaOk && alinhamentoOk;
});

const alinhamentos=[
...new Set(npcs.map((npc)=>npc.alinhamento).filter(Boolean))
];

return(
<div className="paginaNPCs">
<div className="topoNPCs">
<div>
<h1>NPCs</h1>
<p>Personagens vivos do mundo, com diálogos, inventário e relacionamento com o grupo.</p>
</div>
<Link href="/npcs/inserir">
<button className="botaoNovo">Novo NPC</button>
</Link>
</div>

<div className="filtrosNPCs">
<input
placeholder="Buscar por nome, profissão ou personalidade"
value={pesquisa}
onChange={(evento)=>setPesquisa(evento.target.value)}
/>
<select
value={alinhamento}
onChange={(evento)=>setAlinhamento(evento.target.value)}
>
<option value="">Todos os alinhamentos</option>
{alinhamentos.map((item)=>(
<option
key={item}
value={item}
>
{item}
</option>
))}
</select>
</div>

<div className="listaNPCsGrid">
{filtrados.map((npc)=>(
<CardNPC
key={npc.id}
npc={npc}
onExcluir={recarregar}
/>
))}
</div>
</div>
);

}
