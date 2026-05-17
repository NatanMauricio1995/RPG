"use client";

import {useState}
from "react";

import personagens
from "../data/personagens.json";

import racas
from "../data/racas.json";

import classes
from "../data/classes.json";

export default function usePersonagem(
id:number
){

const personagemBase=

personagens.find(
(p)=>

p.id===id
);


if(!personagemBase){

return{

personagemAtual:null,

setPersonagemAtual:()=>{}

};

}


const classe=

classes.find(
(c)=>

c.id===
personagemBase.classeId
);


const raca=

racas.find(
(r)=>

r.id===
personagemBase.racaId
);


const personagemCompleto={

...personagemBase,

classe:
classe?.nome || "",

raca:
raca?.nome || ""

};


const[

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