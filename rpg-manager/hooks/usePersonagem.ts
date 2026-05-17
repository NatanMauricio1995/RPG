"use client";

import {useState}
from "react";

import personagens
from "../data/personagens.json";

import racas
from "../data/racas.json";

import classes
from "../data/classes.json";

import niveis
from "../data/niveis.json";

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


const dadosNivel=

niveis.find(
(n)=>

n.nivel===
personagemBase.nivel
);


const atributosComBonus={

forca:

personagemBase
.atributosBase
.forca+

(raca?.bonus?.forca||0),


destreza:

personagemBase
.atributosBase
.destreza+

(raca?.bonus?.destreza||0),


constituicao:

personagemBase
.atributosBase
.constituicao+

(raca?.bonus?.constituicao||0),


inteligencia:

personagemBase
.atributosBase
.inteligencia+

(raca?.bonus?.inteligencia||0),


sabedoria:

personagemBase
.atributosBase
.sabedoria+

(raca?.bonus?.sabedoria||0),


carisma:

personagemBase
.atributosBase
.carisma+

(raca?.bonus?.carisma||0)

};


const vidaMaxima=

(classe?.vidaBase||8)

+

(

atributosComBonus
.constituicao
*
personagemBase.nivel

);


const personagemCompleto={

...personagemBase,

classe:
classe?.nome || "",

raca:
raca?.nome || "",

classeDados:
classe,

racaDados:
raca,

dadosNivel:
dadosNivel,

atributos:
atributosComBonus,

vidaMaxima

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