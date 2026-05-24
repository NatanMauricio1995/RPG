"use client";

import Image from "next/image";

type Props={
titulo:string;
itens:ItemSelecao[];
selecionados:number[];
onAlternar:(id:number)=>void;
quantidades?:Record<number,number>;
onAlterarQuantidade?:(id:number,delta:number)=>void;
};

type ItemSelecao={
id:number | string;
nome:string;
imagem?:string;
nivel?:number;
};

export default function PainelSelecaoCombate({
titulo,
itens,
selecionados,
onAlternar,
quantidades={},
onAlterarQuantidade
}:Props){

return(
<div className="painelSelecaoCombate">
<h2>{titulo}</h2>
<div className="listaSelecaoCombate">
{itens.map((item)=>(
<article
key={item.id}
className={selecionados.includes(Number(item.id)) ? "selecionado" : ""}
onClick={()=>onAlternar(Number(item.id))}
>
<Image
src={item.imagem || "/imagens/racas/padrao.png"}
alt={item.nome}
width={64}
height={64}
/>
<span>{item.nome}</span>
<small>Nível {item.nivel || 1}</small>
{onAlterarQuantidade && selecionados.includes(Number(item.id)) &&(
<span
className="controleQuantidadeSelecao"
onClick={(evento)=>evento.stopPropagation()}
>
<button
type="button"
onClick={()=>onAlterarQuantidade(Number(item.id),-1)}
disabled={(quantidades[Number(item.id)] || 1)<=1}
>
-
</button>
<strong>{quantidades[Number(item.id)] || 1}</strong>
<button
type="button"
onClick={()=>onAlterarQuantidade(Number(item.id),1)}
>
+
</button>
</span>
)}
</article>
))}
</div>
</div>
);

}
