"use client";

import personagensData from "../data/campanha/personagens.json";
import classes from "../data/sistema/classes.json";
import racas from "../data/sistema/racas.json";
import niveis from "../data/sistema/niveis.json";
import {calcularVida} from "./calculoService";

export const PERSONAGENS_STORAGE_KEY="personagensPersonalizados";

export const atributosPadrao={
forca:10,
destreza:10,
constituicao:10,
inteligencia:10,
sabedoria:10,
carisma:10
};

export const equipamentosPadrao={
cabeca:null,
arma:null,
escudo:null,
armadura:null,
cintura:null,
acessorio:null,
bolsa:null
};

export function criarModeloPersonagem(){

return{
id:Date.now(),
nome:"",
imagem:"/imagens/racas/padrao.png",
racaId:(racas[0] as any)?.id || 1,
classeId:(classes[0] as any)?.id || 1,
nivel:1,
xpAtual:0,
xpNecessario:100,
vidaAtual:10,
ouro:0,
inventario:[] as number[],
equipados:{
...equipamentosPadrao
},
atributosBase:{
...atributosPadrao
}
};

}

export function carregarPersonagensPersonalizados(){

if(
typeof window==="undefined"
)return[];

return JSON.parse(
localStorage.getItem(
PERSONAGENS_STORAGE_KEY
) || "[]"
);

}

export function salvarPersonagensPersonalizados(
personagens:any[]
){

localStorage.setItem(
PERSONAGENS_STORAGE_KEY,
JSON.stringify(personagens)
);

}

export function normalizarPersonagem(
personagem:any
){

return{
...criarModeloPersonagem(),
...personagem,
inventario:
personagem?.inventario || [],
equipados:{
...equipamentosPadrao,
...(personagem?.equipados || {})
},
atributosBase:{
...atributosPadrao,
...(personagem?.atributosBase || {})
}
};

}

export function listarPersonagens(){

const personalizados=
carregarPersonagensPersonalizados();

const porId=new Map<number,any>();

(personagensData as any[]).forEach(
(personagem)=>
porId.set(
personagem.id,
normalizarPersonagem(personagem)
)
);

personalizados.forEach(
(personagem:any)=>
porId.set(
personagem.id,
normalizarPersonagem(personagem)
)
);

return Array.from(
porId.values()
);

}

export function buscarPersonagem(
id:number
){

return listarPersonagens().find(
(personagem:any)=>
personagem.id===id
);

}

export function salvarPersonagem(
personagem:any
){

const personalizados=
carregarPersonagensPersonalizados();

const personagemNormalizado=
normalizarPersonagem(personagem);

const existe=
personalizados.some(
(item:any)=>
item.id===personagemNormalizado.id
);

const atualizados=
existe
? personalizados.map(
(item:any)=>
item.id===personagemNormalizado.id
? personagemNormalizado
: item
)
: [
...personalizados,
personagemNormalizado
];

salvarPersonagensPersonalizados(
atualizados
);

}

export function completarPersonagem(
personagem:any
){

const personagemBase=
normalizarPersonagem(personagem);

const classe=
(classes as any[]).find(
(item)=>
item.id===personagemBase.classeId
);

const raca=
(racas as any[]).find(
(item)=>
item.id===personagemBase.racaId
);

const dadosNivel=
(niveis as any[]).find(
(item)=>
item.nivel===personagemBase.nivel
);

const atributosComBonus={
forca:
personagemBase.atributosBase.forca+
(raca?.bonus?.forca || 0),
destreza:
personagemBase.atributosBase.destreza+
(raca?.bonus?.destreza || 0),
constituicao:
personagemBase.atributosBase.constituicao+
(raca?.bonus?.constituicao || 0),
inteligencia:
personagemBase.atributosBase.inteligencia+
(raca?.bonus?.inteligencia || 0),
sabedoria:
personagemBase.atributosBase.sabedoria+
(raca?.bonus?.sabedoria || 0),
carisma:
personagemBase.atributosBase.carisma+
(raca?.bonus?.carisma || 0)
};

const vidaMaxima=
calcularVida(
classe?.vidaBase || 8,
atributosComBonus.constituicao,
personagemBase.nivel
);

return{
...personagemBase,
classe:
classe?.nome || "",
raca:
raca?.nome || "",
classeDados:
classe,
racaDados:
raca,
dadosNivel,
atributos:
atributosComBonus,
vidaMaxima
};

}
