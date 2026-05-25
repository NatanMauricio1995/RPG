"use client";

import {useEffect,useState} from "react";
import Link from "next/link";
import {listarRacas} from "../../services/racaServiceFirebase";
import CardRaca from "./CardRaca";
import racasBase from "../../data/sistema/racas.json";

export default function ListaRacas(){

const[
racas,
setRacas
]=useState<any[]>([]);

useEffect(()=>{

async function carregar(){

const firebase=

await listarRacas();

const locais=

JSON.parse(

localStorage.getItem(
"racasPersonalizadas"
)

||

"[]"

);

setRacas([

...racasBase,

...firebase,

...locais

]);

}

carregar();

},[]);

return(

<div>

<div className="topoRacas">

<h1>

🧬 Raças

</h1>

<Link
href="/racas/inserir"
>

<button
className="botaoNovo"
>

➕ Nova Raça

</button>

</Link>

</div>

<div className="listaRacasGrid">

{

racas.map(
(raca:any,index:number)=>(

<CardRaca

key={`${raca.id}-${index}`}

raca={raca}

/>

)

)

}

</div>

</div>

);

}