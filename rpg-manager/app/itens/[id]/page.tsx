"use client";

import {useParams}
from "next/navigation";

import Link
from "next/link";

import itens
from "../../../data/itens.json";

import FichaItem
from "../../../components/Itens/FichaItem";

export default function Item(){

const params=
useParams();

const id=
Number(
params.id
);

const item=

itens.find(
(i)=>

i.id===id
);


if(!item){

return(

<div>

<h1>

❌ Item não encontrado

</h1>

</div>

);

}


return(

<div>

<Link
href="/itens"
>

<button
className="botaoVoltar"
>

⬅️ Voltar

</button>

</Link>


<FichaItem

item={item}

/>

</div>

);

}