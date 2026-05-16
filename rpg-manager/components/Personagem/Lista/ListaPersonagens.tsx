"use client";

import {useState} from "react";

import personagensData
from "../../../data/personagens.json";

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

personagensData.filter(
(personagem)=>{

const nomeOk=

personagem.nome
.toLowerCase()

.includes(

pesquisa
.toLowerCase()

);


const classeOk=

personagem.classe
.toLowerCase()

.includes(

classe
.toLowerCase()

);


const racaOk=

personagem.raca
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