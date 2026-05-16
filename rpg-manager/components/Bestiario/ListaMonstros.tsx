"use client";

import {useState} from "react";

import monstrosData
from "../../data/monstros.json";

import tiposMonstros
from "../../data/tiposMonstros.json";

import CardMonstro
from "./CardMonstro";

import FiltrosMonstros
from "./FiltrosMonstros";

export default function ListaMonstros(){

const [pesquisa,setPesquisa]=
useState("");

const [tipo,setTipo]=
useState("");


const monstros=

monstrosData

.map(
(monstro)=>{

const tipoEncontrado=

tiposMonstros.find(
(t)=>
t.id===
monstro.tipoId
);

return{

...monstro,

tipo:
tipoEncontrado?.nome || ""

};

}

)

.filter(
(monstro)=>{

const nomeOk=

monstro.nome

.toLowerCase()

.includes(

pesquisa
.toLowerCase()

);


const tipoOk=

monstro.tipo

.toLowerCase()

.includes(

tipo
.toLowerCase()

);


return(

nomeOk &&
tipoOk

);

}

);


const tiposUnicos=

[

...new Set(

monstros.map(
m=>m.tipo
)

)

];


return(

<div>

<h1>

👹 Bestiário

</h1>


<FiltrosMonstros

pesquisa={pesquisa}
setPesquisa={setPesquisa}

tipo={tipo}
setTipo={setTipo}

tipos={tiposUnicos}

/>


<div className="listaMonstrosGrid">

{

monstros.map(
(monstro)=>(

<CardMonstro

key={
monstro.id
}

monstro={
monstro
}

/>

)

)

}

</div>

</div>

);

}