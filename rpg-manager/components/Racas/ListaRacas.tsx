"use client";

import {useEffect,useState} from "react";
import Link from "next/link";
import {listarRacas} from "../../services/personagemService";
import CardRaca from "./CardRaca";

export default function ListaRacas(){

const[
racas,
setRacas
]=useState<any[]>([]);

const [carregando, setCarregando] = useState(true);

useEffect(()=>{
async function carregar(){
const resultado = await listarRacas();
setRacas(resultado.racas || []);
setCarregando(false);
}
carregar();
},[]);

if (carregando) return <div className="carregando">Consultando linhagens...</div>;

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