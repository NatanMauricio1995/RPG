"use client";

import Image from "next/image";
import Link from "next/link";
import {NPC} from "../../services/npcService";

type Props={
npc:NPC;
};

export default function FichaNPC({
npc
}:Props){

return(
<div className="fichaNPC">
<div className="acoesFichaNPC">
<Link href="/npcs">
<button className="botaoVoltar">Voltar</button>
</Link>
<Link href={`/npcs/${npc.id}/editar`}>
<button className="botaoVoltar">Editar</button>
</Link>
</div>

<h1>{npc.nome}</h1>

<Image
src={npc.imagem || "/imagens/npcs/ChatGPT Image 18 de mai. de 2026, 18_23_40.png"}
alt={npc.nome}
width={360}
height={360}
className="imagemFichaNPC"
/>

<div className="infoNPCGrid">
<div><small>Idade</small><p>{npc.idade}</p></div>
<div><small>Profissão</small><p>{npc.profissao || "Sem profissão"}</p></div>
<div><small>Alinhamento</small><p>{npc.alinhamento}</p></div>
<div><small>Relacionamento</small><p>{npc.relacionamento}</p></div>
</div>

<section className="blocoFichaNPC">
<h2>Personalidade</h2>
<p>{npc.personalidade || "Não definida."}</p>
</section>

<section className="blocoFichaNPC">
<h2>Diálogos</h2>
{npc.dialogos.length>0 ? (
npc.dialogos.map((dialogo,index)=>(
<blockquote key={index}>{dialogo}</blockquote>
))
) : (
<p>Nenhum diálogo registrado.</p>
)}
</section>

<section className="blocoFichaNPC">
<h2>Inventário</h2>
{npc.inventario.length>0 ? (
<div className="inventarioNPC">
{npc.inventario.map((item:any,index)=>(
<span key={`${item.id}-${index}`}>{item.nome || item.id}</span>
))}
</div>
) : (
<p>Nenhum item registrado.</p>
)}
</section>
</div>
);

}
