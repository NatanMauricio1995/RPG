"use client";

import { useInventario } from "../../../contexts/InventarioContext";
import CorpoEquipamento from "./CorpoEquipamento";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ItemSlot } from "../../../types";

export default function SistemaEquipamento({ personagemId }: { personagemId: string }){

const{
inventario,
setInventario,
equipados,
setEquipados,
salvarMudancas
}=useInventario();

const [tooltip, setTooltip] = useState<{item: any, x: number, y: number} | null>(null);


async function equipar(item:any){

  if (!item.slotCompativel || item.slotCompativel.length === 0) {
    alert("Este item não pode ser equipado.");
    return;
  }

  let slot = item.slotCompativel.find((s: ItemSlot) => !equipados[s]) || item.slotCompativel[0];

  const novosEquipados = { ...equipados };
  let novoInventario = [...inventario];

  if(equipados[slot]){
    novoInventario.push(equipados[slot]);
  }

  // Se o item tem quantidade > 1, equipa 1 e mantém o resto no inventário
  if (item.quantidade && item.quantidade > 1) {
    novosEquipados[slot] = { ...item, quantidade: 1 };
    novoInventario = novoInventario.map((i: any) => 
      i.id === item.id ? { ...i, quantidade: i.quantidade - 1 } : i
    );
  } else {
    novosEquipados[slot] = item;
    novoInventario = novoInventario.filter((i:any)=>i.id!==item.id);
  }

  setEquipados(novosEquipados);
  setInventario(novoInventario);
  
  await salvarMudancas(personagemId, novoInventario, novosEquipados);
}


async function desequipar(slot:string){

const item=equipados[slot];

if(!item)return;

const novosEquipados = { ...equipados };
let novoInventario = [...inventario];

// Verificar se já existe o mesmo item no inventário para empilhar
const itemExistente = novoInventario.find((i: any) => i.id === item.id);

if (itemExistente) {
  novoInventario = novoInventario.map((i: any) => 
    i.id === item.id ? { ...i, quantidade: (i.quantidade || 1) + 1 } : i
  );
} else {
  novoInventario.push(item);
}

novosEquipados[slot] = null;

setEquipados(novosEquipados);
setInventario(novoInventario);

await salvarMudancas(personagemId, novoInventario, novosEquipados);

}


async function desequiparTudo(){

const itens=

Object.values(
equipados
)

.filter(Boolean);

const novoInventario = [...inventario, ...itens];
const novosEquipados = {
  armaPrincipal: null,
  armaSecundaria: null,
  capacete: null,
  peitoral: null,
  luvas: null,
  botas: null,
  acessorio1: null,
  acessorio2: null,
  itemEspecial: null
};

setInventario(novoInventario);
setEquipados(novosEquipados);

await salvarMudancas(personagemId, novoInventario, novosEquipados);

}

const handleMouseEnter = (item: any, e: React.MouseEvent) => {
  setTooltip({ item, x: e.clientX, y: e.clientY });
};

const handleMouseLeave = () => {
  setTooltip(null);
};


return(

<div>

<h2>⚔️ Equipamentos</h2>

<button
className="botaoAcao"
onClick={desequiparTudo}
>

Desequipar tudo

</button>


<CorpoEquipamento
equipados={equipados}
setEquipados={setEquipados}
inventario={inventario}
setInventario={setInventario}
personagemId={personagemId}
/>


<h2>🎒 Inventário</h2>

<div className="inventarioGrid">

{

inventario.map(
(item:any,index:number)=>(

<div
key={`${item.id}-${index}`}
className={`itemCard raridade-${item.raridade}`}
draggable
onDragStart={(evento)=>
evento.dataTransfer.setData("id", item.id)
}
onMouseEnter={(e) => handleMouseEnter(item, e)}
onMouseLeave={handleMouseLeave}
>

<Image
src={
item.imagem?.trim()
? item.imagem
: "/imagens/itens/padrao.png"
}
alt={item.nome || "Item"}
width={120}
height={120}
className="imagemItemInventario"
/>
<h3 className={`raridade-${item.raridade}`}>
{item.nome}
</h3>

<p>
📦 {item.subtipo}
</p>

<div className="itemAcoes">
<Link href={`/itens/${item.id}`}>
<button>📖 Detalhes</button>
</Link>

{
item.tipo==="Equipamento"
&&(
<button onClick={()=>equipar(item)}>Equipar</button>
)
}
</div>

</div>

)

)

}

</div>

{tooltip && (
  <div className="tooltip-item" style={{ top: tooltip.y + 10, left: tooltip.x + 10 }}>
    <h4 className={`raridade-${tooltip.item.raridade}`}>{tooltip.item.nome}</h4>
    <p><small>{tooltip.item.tipo} - {tooltip.item.subtipo}</small></p>
    <p><em>{tooltip.item.raridade}</em></p>
    {tooltip.item.bonus && (
      <div className="tooltip-bonus">
        {Object.entries(tooltip.item.bonus).map(([key, val]) => (
          <p key={key} className="bonus">+{val} {key}</p>
        ))}
      </div>
    )}
  </div>
)}

</div>

);

}