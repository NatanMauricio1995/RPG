"use client";

import {useState} from "react";

import personagensData from "../../../data/campanha/personagens.json";

import racas from "../../../data/sistema/racas.json";

import classes from "../../../data/sistema/classes.json";

import CardPersonagem
from "./CardPersonagem";

import FiltrosPersonagem
from "./FiltrosPersonagem";

export default function ListaPersonagens(){

const [pesquisa,setPesquisa]=
useState("");

const [classe,setClasse]=
useState("");

const [raca,setRaca]=
useState("");


const personagens=

personagensData

.map(
(personagem)=>{

const classeEncontrada=

classes.find(
(c)=>
c.id===
personagem.classeId
);


const racaEncontrada=

racas.find(
(r)=>
r.id===
personagem.racaId
);


const vidaBase=10;

const vidaMaxima=

vidaBase+

(
(classeEncontrada?.vidaPorNivel || 0)
*
personagem.nivel
)

+

personagem
.atributosBase
.constituicao;


return{

...personagem,

classe:
classeEncontrada?.nome || "",

raca:
racaEncontrada?.nome || "",

vidaMaxima

};

}

)

.filter(
(personagem)=>{

const nomeOk=

(personagem.nome || "")

.toLowerCase()

.includes(

pesquisa
.toLowerCase()

);


const classeOk=

(personagem.classe || "")

.toLowerCase()

.includes(

classe
.toLowerCase()

);


const racaOk=

(personagem.raca || "")

.toLowerCase()

.includes(

raca
.toLowerCase()

);


return(

nomeOk &&
classeOk &&
racaOk

);

}

);


const classesUnicas=

[

...new Set(

personagens.map(
p=>p.classe
)

)

];


const racasUnicas=

[

...new Set(

personagens.map(
p=>p.raca
)

)

];


return(

<div>

<h1>

👥 Personagens

</h1>


<FiltrosPersonagem

pesquisa={pesquisa}
setPesquisa={setPesquisa}

classe={classe}
setClasse={setClasse}

raca={raca}
setRaca={setRaca}

classes={classesUnicas}

racas={racasUnicas}

/>


<div className="listaPersonagensGrid">

{

personagens.map(
(personagem)=>(

<CardPersonagem

key={
personagem.id
}

personagem={
personagem
}

/>

)

)

}

</div>

</div>

);

}