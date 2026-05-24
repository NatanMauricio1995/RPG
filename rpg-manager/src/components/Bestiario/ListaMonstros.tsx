"use client";

import {useEffect,useState} from "react";
import Link from "next/link";
import { listarMonstros } from "../../services/monstroService";

import CardMonstro from "./CardMonstro";
import FiltrosMonstros from "./FiltrosMonstros";

export default function ListaMonstros(){

const [pesquisa,setPesquisa]=useState("");
const [tipo,setTipo]=useState("");

const[
todosMonstros,
setTodosMonstros
]=useState<any[]>([]);

const [loading, setLoading] = useState(true);


useEffect(()=>{
  const carregar = async () => {
    setLoading(true);
    const data = await listarMonstros();
    setTodosMonstros(data);
    setLoading(false);
  };
  carregar();
},[]);


const monstros=

todosMonstros.filter(
(monstro:any)=>{

const nomeOk=

(monstro.nome || "")
.toLowerCase()
.includes(
pesquisa.toLowerCase()
);

const tipoOk=

(monstro.tipo || "")
.toLowerCase()
.includes(
tipo.toLowerCase()
);

return nomeOk && tipoOk;

});


const tiposUnicos=[

...new Set(

todosMonstros.map(
(m:any)=>m.tipo
)

)

];

if (loading) return <p>Carregando bestiário...</p>;


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