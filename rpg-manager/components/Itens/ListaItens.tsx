"use client";

import {useState} from "react";
import Link from "next/link";

import {listarItens}
from "../../services/itemService";

import CardItem
from "./CardItem";

type ItemSalvo={
id:number | string;
};

export default function ListaItens(){

const[
itens,
setItens
]=useState(
()=>listarItens()
);

const[
tipo,
setTipo
]=useState("");


function excluirItem(
id:number
){

const itensPersonalizados=
JSON.parse(
localStorage.getItem("itensPersonalizados") || "[]"
);

localStorage.setItem(
"itensPersonalizados",
JSON.stringify(
(itensPersonalizados as ItemSalvo[]).filter((item)=>Number(item.id)!==Number(id))
)
);

setItens(

itens.filter(
(item)=>

Number(item.id)!==Number(id)

)

);

}


const itensFiltrados=

itens.filter(
(item)=>{

if(!tipo)
return true;

return(
item.tipo===tipo
);

}
);


return(

<div>

<div
className="topoItens"
>

<h1>

🎒 Itens

</h1>


<Link
href="/itens/inserir"
>

<button
className="botaoNovo"
>

➕ Novo Item

</button>

</Link>

</div>


<select
value={tipo}
onChange={(e)=>

setTipo(
e.target.value
)

}
>

<option value="">

Todos

</option>

<option>

Equipamento

</option>

<option>

Consumível

</option>

<option>

Diversos

</option>

</select>


<div
className="listaItensGrid"
>

{

itensFiltrados.map(
(item)=>(

<CardItem
key={item.id}
item={item}
onExcluir={excluirItem}
/>

)

)

}

</div>

</div>

);

}
