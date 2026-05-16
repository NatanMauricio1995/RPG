"use client";

import { useState } from "react";

import personagens from "../data/personagens.json";
import racas from "../data/racas.json";
import classes from "../data/classes.json";
import habilidades from "../data/habilidades.json";

export default function usePersonagem(
id:number
){

const personagemBase=

personagens.find(
(item)=>
item.id===id
);

if(!personagemBase){

return{

personagemAtual:null,
setPersonagemAtual:()=>{}

};

}


const raca=

racas.find(
(item)=>
item.id===
personagemBase.racaId
);


const classe=

classes.find(
(item)=>
item.id===
personagemBase.classeId
);


const habilidadesLiberadas=

habilidades.filter(

(item)=>

item.classeId===

personagemBase.classeId

&&

item.nivelMinimo<=
personagemBase.nivel

);


const vidaBase=10;

const bonusConstituicao=

personagemBase
.atributosBase
.constituicao;

const vidaMaxima=

vidaBase+

(
(classe?.vidaPorNivel || 0)
*
personagemBase.nivel
)

+

bonusConstituicao;


const personagemCompleto={

...personagemBase,

raca:
raca?.nome,

classe:
classe?.nome,

vidaMaxima,

habilidades:
habilidadesLiberadas

};

const [

personagemAtual,
setPersonagemAtual

]=useState(
personagemCompleto
);

return{

personagemAtual,
setPersonagemAtual

};

}