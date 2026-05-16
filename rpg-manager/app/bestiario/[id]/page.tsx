"use client";

import {useParams}
from "next/navigation";

import Link
from "next/link";

import monstros
from "../../../data/monstros.json";

import tiposMonstros
from "../../../data/tiposMonstros.json";

import FichaMonstro
from "../../../components/Bestiario/FichaMonstro";

export default function Monstro(){

const params=
useParams();

const id=
Number(params.id);


const monstroBase=

monstros.find(
(item)=>

item.id===id

);


if(!monstroBase){

return(

<div>

<h1>

❌ Monstro não encontrado

</h1>

</div>

);

}


const tipo=

tiposMonstros.find(
(item)=>

item.id===

monstroBase.tipoId

);


const monstro={

...monstroBase,

tipo:
tipo?.nome || ""

};


return(

<div>

<Link
href="/bestiario"
>

<button
className="botaoVoltar"
>

⬅️ Voltar

</button>

</Link>


<FichaMonstro

monstro={monstro}

/>

</div>

);

}