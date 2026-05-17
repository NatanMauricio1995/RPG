"use client";

import {useState} from "react";

import itensData
from "../../data/itens.json";

import CardItem
from "./CardItem";

export default function ListaItens(){

const [itens,setItens]=
useState(itensData);

const [tipo,setTipo]=
useState("");


function excluirItem(
id:number
){

setItens(

itens.filter(
(item)=>

item.id!==id

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

<button
className="botaoNovo"
>

➕ Novo Item

</button>

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

key={
item.id
}

item={item}

onExcluir={
excluirItem
}

/>

)

)

}

</div>

</div>

);

}