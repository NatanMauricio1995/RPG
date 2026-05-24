"use client";

import {calcularModificador} from "./calculoService";
import {resolverEquipados} from "./itemService";

export const atributosCombate=[
"forca",
"destreza",
"constituicao",
"inteligencia",
"sabedoria",
"carisma"
];

export type EfeitoAtivo={
tipo:string;
valor:number;
duracao:number;
origem?:string;
};

export function coletarEfeitosEquipados(
equipados:any
){

return Object.values(resolverEquipados(equipados))
.filter(Boolean)
.flatMap((item:any)=>
(item.efeitos || []).map((efeito:any)=>({
...efeito,
origem:item.nome
}))
);

}

export function calcularBonusEquipados(
equipados: Record<string, any>
){

const bonus:Record<string,number>={
forca:0,
destreza:0,
constituicao:0,
inteligencia:0,
sabedoria:0,
carisma:0,
vida:0,
mana:0,
critico:0,
armadura:0,
velocidade:0,
escudo:0,
ataque:0,
defesa:0
};

Object.values(equipados)
.filter(Boolean)
.forEach((item:any)=>{
Object.entries(item.bonus || {}).forEach(
([atributo,valor])=>{
const key = normalizarTipoEfeito(atributo);
bonus[key]=(bonus[key] || 0)+Number(valor || 0);
}
);

(item.efeitos || []).forEach((efeito:any)=>{
const tipo=normalizarTipoEfeito(efeito.tipo);

if(tipo in bonus){
bonus[tipo]+=Number(efeito.valor || 0);
}
});

if(item.defesa){
bonus.armadura+=Number(item.defesa || 0);
}
});

return bonus;

}

export function calcularAtributosComEquipamento(
personagem:any
){

const bonus=calcularBonusEquipados(personagem.equipados);
const atributos:Record<string,number>={};

atributosCombate.forEach((atributo)=>{
atributos[atributo]=
Number(personagem.atributos?.[atributo] ?? personagem.atributosBase?.[atributo] ?? 10)+
Number(bonus[atributo] || 0);
});

return atributos;

}

export function calcularStatusDerivados(
personagem:any
){

const bonus=calcularBonusEquipados(personagem.equipados);
const atributos=calcularAtributosComEquipamento(personagem);
const nivel=Number(personagem.nivel || 1);

const vidaBase=Number(personagem.vidaMaxima || personagem.vidaAtual || 10);
const manaBase=Number(
personagem.manaMaxima ||
personagem.mana ||
10 + Math.max(0,calcularModificador(atributos.inteligencia))*nivel
);

const vidaMaxima=Math.max(1,vidaBase + Number(bonus.vida || 0));
const manaMaxima=Math.max(0,manaBase + Number(bonus.mana || 0));

return{
atributos,
bonus,
vidaMaxima,
manaMaxima,
armadura:
10+
calcularModificador(atributos.destreza)+
Number(bonus.armadura || 0),
velocidade:
calcularModificador(atributos.destreza)+
Number(bonus.velocidade || 0),
critico:
5+
Number(bonus.critico || 0),
escudo:
Number(bonus.escudo || 0),
efeitosEquipados:
coletarEfeitosEquipados(personagem.equipados)
};

}

export function normalizarTipoEfeito(
tipo:string
){

const valor=String(tipo || "").toLowerCase();

if(valor.includes("veneno")) return "veneno";
if(valor.includes("sangramento")) return "sangramento";
if(valor.includes("paralis")) return "paralisia";
if(valor.includes("medo")) return "medo";
if(valor.includes("cura")) return "cura";
if(valor.includes("escudo")) return "escudo";
if(valor.includes("vida")) return "vida";
if(valor.includes("mana")) return "mana";
if(valor.includes("crit")) return "critico";
if(valor.includes("armadura")) return "armadura";
if(valor.includes("veloc")) return "velocidade";

return valor;

}
