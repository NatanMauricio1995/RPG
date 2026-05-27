"use client";

import {useEffect,useState} from "react";
import Link from "next/link";

import CardClasse
from "./CardClasse";

import { listarClasses } from "../../services/personagemService";

export default function ListaClasses(){

const[
classes,
setClasses
]=useState<any[]>([]);

const [carregando, setCarregando] = useState(true);

useEffect(()=>{
async function carregar(){
const resultado = await listarClasses();
setClasses(resultado.classes || []);
setCarregando(false);
}
carregar();
},[]);

if (carregando) return <div className="carregando">Consultando guildas...</div>;

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