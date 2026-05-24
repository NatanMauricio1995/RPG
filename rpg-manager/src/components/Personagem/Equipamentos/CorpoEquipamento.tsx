"use client";

import Image from "next/image";
import { useState } from "react";
import { ItemSlot } from "../../../types";
import { useInventario } from "../../../contexts/InventarioContext";

type Props={
equipados:any;
setEquipados:any;
inventario:any[];
setInventario:any;
personagemId: string;
};

export default function CorpoEquipamento({
equipados,
setEquipados,
inventario,
setInventario,
personagemId
}:Props){

const { salvarMudancas } = useInventario();
const [tooltip, setTooltip] = useState<{item: any, x: number, y: number} | null>(null);

function permitirDrop(evento:any){
evento.preventDefault();
}

async function soltarItem(
evento:any,
slot:string
){

evento.preventDefault();

const itemId=
evento.dataTransfer.getData("id");

const item=

inventario.find(
(i:any)=>
i.id===itemId || i.id===Number(itemId)
);

if(!item)return;

// Verificar compatibilidade
if (item.slotCompativel && !item.slotCompativel.includes(slot as ItemSlot)) {
  alert(`Este item não pode ser equipado no slot: ${slot}`);
  return;
}

const novosEquipados = { ...equipados };
let novoInventario = [...inventario];

if (equipados[slot]) {
  // Verificar se o item que está saindo já existe no inventário para empilhar
  const itemSaindo = equipados[slot];
  const itemExistenteNoInv = novoInventario.find((i: any) => i.id === itemSaindo.id);
  if (itemExistenteNoInv) {
    novoInventario = novoInventario.map((i: any) => 
      i.id === itemSaindo.id ? { ...i, quantidade: (i.quantidade || 1) + 1 } : i
    );
  } else {
    novoInventario.push(itemSaindo);
  }
}

// Se o item que está entrando tem quantidade > 1, equipa 1 e reduz no inventário
if (item.quantidade && item.quantidade > 1) {
  novosEquipados[slot] = { ...item, quantidade: 1 };
  novoInventario = novoInventario.map((i: any) => 
    i.id === item.id ? { ...i, quantidade: i.quantidade - 1 } : i
  );
} else {
  novosEquipados[slot] = item;
  novoInventario = novoInventario.filter((i: any) => i.id !== item.id);
}

setEquipados(novosEquipados);
setInventario(novoInventario);

await salvarMudancas(personagemId, novoInventario, novosEquipados);
}

const slots: {nome: ItemSlot, rotulo: string}[] = [
  { nome: "capacete", rotulo: "Capacete" },
  { nome: "peitoral", rotulo: "Peitoral" },
  { nome: "armaPrincipal", rotulo: "Arma Principal" },
  { nome: "armaSecundaria", rotulo: "Arma Secundária" },
  { nome: "luvas", rotulo: "Luvas" },
  { nome: "botas", rotulo: "Botas" },
  { nome: "acessorio1", rotulo: "Acessório 1" },
  { nome: "acessorio2", rotulo: "Acessório 2" },
  { nome: "itemEspecial", rotulo: "Item Especial" }
];

const handleMouseEnter = (item: any, e: React.MouseEvent) => {
  if (item) {
    setTooltip({ item, x: e.clientX, y: e.clientY });
  }
};

const handleMouseLeave = () => {
  setTooltip(null);
};

return(

<div className="containerCorpo">

<Image
src="/imagens/interface/corpo.png"
alt="Corpo do personagem"
width={850}
height={850}
className="imagemCorpo"
/>

{

slots.map((slot)=>(

<div
key={slot.nome}
className={`slotEquipamento slot-${slot.nome} ${equipados[slot.nome] ? `raridade-${equipados[slot.nome].raridade}` : ""}`}
onDragOver={permitirDrop}
onDrop={(evento)=>
soltarItem(
evento,
slot.nome
)
}
onMouseEnter={(e) => handleMouseEnter(equipados[slot.nome], e)}
onMouseLeave={handleMouseLeave}
>

{

equipados[slot.nome]

?

<Image
src={
equipados[slot.nome]?.imagem?.trim()

?

equipados[slot.nome].imagem

:

"/imagens/itens/padrao.png"
}
alt={
equipados[slot.nome]?.nome ||
"Item equipado"
}
width={90}
height={90}
className="imagemSlot"
/>

:

<div className="slotVazio" title={slot.rotulo}>

+

</div>

}

</div>

))

}

{tooltip && (
  <div className="tooltip-item" style={{ top: tooltip.y + 10, left: tooltip.x + 10 }}>
    <h4 className={`raridade-${tooltip.item.raridade}`}>{tooltip.item.nome}</h4>
    <p><small>{tooltip.item.tipo} - {tooltip.item.subtipo}</small></p>
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