"use client";

import npcsData from "../data/campanha/npcs.json";
import {resolverInventario} from "./itemService";

export const NPCS_STORAGE_KEY="npcsPersonalizados";

export type NPC={
id:number;
nome:string;
imagem:string;
idade:number;
profissao:string;
alinhamento:string;
personalidade:string;
dialogos:string[];
inventario:any[];
relacionamento:number;
padrao?:boolean;
};

export function criarModeloNPC():NPC{

return{
id:Date.now(),
nome:"",
imagem:"/imagens/npcs/ChatGPT Image 18 de mai. de 2026, 18_23_40.png",
idade:30,
profissao:"",
alinhamento:"Neutro",
personalidade:"",
dialogos:[""],
inventario:[],
relacionamento:0
};

}

export function normalizarNPC(
npc:any
):NPC{

const modelo=criarModeloNPC();

return{
...modelo,
...npc,
id:Number(npc?.id || modelo.id),
idade:Number(npc?.idade || 0),
dialogos:Array.isArray(npc?.dialogos) ? npc.dialogos : [],
inventario:resolverInventario(npc?.inventario || []),
relacionamento:Number(npc?.relacionamento || 0)
};

}

export function carregarNPCsPersonalizados(){

if(typeof window==="undefined")
return[];

return JSON.parse(
localStorage.getItem(NPCS_STORAGE_KEY) || "[]"
);

}

export function salvarNPCsPersonalizados(
npcs:NPC[]
){

localStorage.setItem(
NPCS_STORAGE_KEY,
JSON.stringify(npcs)
);

}

export function listarNPCs(){

const porId=new Map<number,NPC>();

(npcsData as any[]).forEach((npc:any)=>{
porId.set(
Number(npc.id),
{
...normalizarNPC(npc),
padrao:true
}
);
});

carregarNPCsPersonalizados().forEach((npc:any)=>{
porId.set(
Number(npc.id),
{
...normalizarNPC(npc),
padrao:false
}
);
});

return Array.from(porId.values());

}

export function buscarNPC(
id:number
){

return listarNPCs().find((npc)=>npc.id===id) || null;

}

export function salvarNPC(
npc:NPC
){

const personalizados=carregarNPCsPersonalizados();
const normalizado=normalizarNPC(npc);
const existe=personalizados.some((item:any)=>Number(item.id)===normalizado.id);

const atualizados=existe
? personalizados.map((item:any)=>Number(item.id)===normalizado.id ? normalizado : item)
: [...personalizados,normalizado];

salvarNPCsPersonalizados(atualizados);

}

export function excluirNPC(
id:number
){

const atualizados=carregarNPCsPersonalizados()
.filter((npc:any)=>Number(npc.id)!==id);

salvarNPCsPersonalizados(atualizados);

}
