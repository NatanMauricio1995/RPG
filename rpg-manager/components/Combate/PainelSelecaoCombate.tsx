"use client";

import Image from "next/image";

type Props={
titulo:string;
itens:any[];
selecionados:number[];
onAlternar:(id:number)=>void;
};

export default function PainelSelecaoCombate({
titulo,
itens,
selecionados,
onAlternar
}:Props){

return(
<div className="painelSelecaoCombate">
<h2>{titulo}</h2>
<div className="listaSelecaoCombate">
{itens.map((item:any)=>(
<button
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
</button>
))}
</div>
</div>
);

}
