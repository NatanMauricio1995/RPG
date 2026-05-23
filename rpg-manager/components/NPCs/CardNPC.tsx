"use client";

import Image from "next/image";
import Link from "next/link";
import {NPC,excluirNPC} from "../../services/npcService";

type Props={
npc:NPC;
onExcluir:()=>void;
};

export default function CardNPC({
npc,
onExcluir
}:Props){

function confirmarExclusao(){

if(npc.padrao){
window.alert("NPCs padrão não são removidos da base. Edite para criar uma versão personalizada.");
return;
}

if(!window.confirm(`Deseja excluir ${npc.nome}?`))
return;

excluirNPC(npc.id);
onExcluir();

}

return(
<article className="cartaNPC">
<div className="topoCartaNPC">
<h2>{npc.nome}</h2>
<span>{npc.relacionamento}</span>
</div>

<div className="imagemCartaNPC">
<Image
src={npc.imagem || "/imagens/npcs/ChatGPT Image 18 de mai. de 2026, 18_23_40.png"}
alt={npc.nome}
fill
className="imagemNPC"
/>
</div>

<div className="corpoCartaNPC">
<p><strong>Profissão:</strong> {npc.profissao || "Sem profissão"}</p>
<p><strong>Alinhamento:</strong> {npc.alinhamento}</p>
<p><strong>Personalidade:</strong> {npc.personalidade || "Não definida"}</p>
</div>

<div className="rodapeCartaNPC">
<Link href={`/npcs/${npc.id}`}>
<button>Abrir</button>
</Link>
<Link href={`/npcs/${npc.id}/editar`}>
<button>Editar</button>
</Link>
<button onClick={confirmarExclusao}>Excluir</button>
</div>
</article>
);

}
