"use client";

import {useEffect,useState} from "react";
import Link from "next/link";

import CardClasse
from "./CardClasse";

import classesBase
from "../../data/sistema/classes.json";

import {
listarClasses
}
from "../../services/classeServiceFirebase";

export default function ListaClasses(){

const[
classes,
setClasses
]=useState<any[]>([]);

useEffect(()=>{

async function carregar(){

const firebase=

await listarClasses();

setClasses([

...classesBase,

...firebase

]);

}

carregar();

},[]);

return(

<div>

<div className="topoClasses">

<h1>

⚔️ Classes

</h1>

<Link
href="/classes/inserir"
>

<button
className="botaoNovo"
>

➕ Nova Classe

</button>

</Link>

</div>

<div className="listaClassesGrid">

{

classes.map(
(classe:any,index:number)=>(

<CardClasse
key={`${classe.id}-${index}`}
classe={classe}
/>

)

)

}

</div>

</div>

);

}