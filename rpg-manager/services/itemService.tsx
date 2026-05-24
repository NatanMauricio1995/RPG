"use client";

import itensData from "../data/sistema/itens.json";
import armasData from "../data/sistema/armas.json";
import armadurasData from "../data/sistema/armaduras.json";
import acessoriosData from "../data/sistema/acessorios.json";
import consumiveisData from "../data/sistema/consumiveis.json";

const ITENS_STORAGE_KEY="itensPersonalizados";

export function listarItens(){

const personalizados=
typeof window==="undefined"
? []
: JSON.parse(
localStorage.getItem(ITENS_STORAGE_KEY) || "[]"
);

const todos=[
...(itensData as any[]),
...(armasData as any[]),
...(armadurasData as any[]),
...(acessoriosData as any[]),
...(consumiveisData as any[]),
...personalizados
];

const porId=new Map<number,any>();

todos.forEach((item:any)=>{
porId.set(
Number(item.id),
normalizarItem(item)
);
});

return Array.from(porId.values());

}

export function buscarItem(
referencia:any
){

if(!referencia)
return null;

if(typeof referencia==="object")
return normalizarItem(referencia);

const id=Number(referencia);

return listarItens().find(
(item:any)=>Number(item.id)===id
) || null;

}

export function resolverInventario(
inventario:any[]
){

return (inventario || [])
.map(buscarItem)
.filter(Boolean);

}

export function resolverEquipados(
equipados:any
){

const resultado:Record<string,any>={
cabeca:null,
arma:null,
escudo:null,
armadura:null,
cintura:null,
acessorio:null,
bolsa:null,
municao:null
};

Object.entries(equipados || {}).forEach(
([slot,item])=>{
resultado[slot]=buscarItem(item);
}
);

return resultado;

}

export function normalizarItem(
item:any
){

const slot=
item.slot ||
slotPorSubtipo(item.subtipo);

return{
...item,
id:Number(item.id),
slot,
tipo:
item.tipo ||
(slot ? "Equipamento" : "Diversos"),
subtipo:
item.subtipo ||
subtipoPorSlot(slot),
bonus:{
...(item.bonus || {})
},
efeitos:
normalizarEfeitos(item)
};

}

function slotPorSubtipo(
subtipo:string
){

switch(subtipo){
case "Arma":
case "Arma Mágica":
return "arma";
case "Armadura":
return "armadura";
case "Acessório":
return "acessorio";
case "Munição":
return "municao";
default:
return "";
}

}

function subtipoPorSlot(
slot:string
){

switch(slot){
case "arma":
return "Arma";
case "armadura":
return "Armadura";
case "acessorio":
return "Acessório";
case "municao":
return "Munição";
default:
return "Diversos";
}

}

function normalizarEfeitos(
item:any
){

if(Array.isArray(item.efeitos))
return item.efeitos.map((efeito:any)=>({
tipo:String(efeito.tipo || "").toLowerCase(),
valor:Number(efeito.valor || 0),
duracao:Number(efeito.duracao || 3)
}));

if(typeof item.efeito==="string"){
const cura=item.efeito.match(/(\d+)/);

if(item.efeito.toLowerCase().includes("vida") && cura){
return[
{
tipo:"cura",
valor:Number(cura[1]),
duracao:1
}
];
}
}

return[];

}
