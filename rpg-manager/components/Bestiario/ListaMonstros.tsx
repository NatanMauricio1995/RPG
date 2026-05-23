"use client";

import {useEffect,useState} from "react";
import Link from "next/link";

import monstrosData from "../../data/sistema/monstros.json";
import tiposMonstros from "../../data/sistema/tiposMonstros.json";

import CardMonstro from "./CardMonstro";
import FiltrosMonstros from "./FiltrosMonstros";

export default function ListaMonstros(){

const [pesquisa,setPesquisa]=useState("");
const [tipo,setTipo]=useState("");
const [monstrosPersonalizados,setMonstrosPersonalizados]=useState<any[]>([]);


useEffect(()=>{

const monstrosSalvos=

JSON.parse(

localStorage.getItem(
"monstrosPersonalizados"
)

||"[]"

);

setMonstrosPersonalizados(
monstrosSalvos
);

},[]);


const todosMonstros=[

...monstrosData,

...monstrosPersonalizados

];


const monstros=

todosMonstros

.map((monstro:any)=>{

if(monstro.tipo){

return monstro;

}

const tipoEncontrado=

tiposMonstros.find(
(t)=>t.id===monstro.tipoId
);

return{

...monstro,

tipo:
tipoEncontrado?.nome || ""

};

})

.filter((monstro:any)=>{

const nomeOk=

monstro.nome
.toLowerCase()
.includes(
pesquisa.toLowerCase()
);

const tipoOk=

monstro.tipo
.toLowerCase()
.includes(
tipo.toLowerCase()
);

return nomeOk && tipoOk;

});


const tiposUnicos=[

...new Set(
monstros.map(
(m:any)=>m.tipo
)
)

];


return(

<div>

<div className="topoBestiario">

<h1>

👹 Bestiário

</h1>

<Link
href="/bestiario/inserir"
>

<button
className="botaoNovo"
>

➕ Nova Besta

</button>

</Link>

</div>


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
(monstro:any,index:number)=>(

<CardMonstro
key={`${monstro.id}-${index}`}
monstro={monstro}
/>

)

)

}

</div>

</div>

);

}