"use client";

import Image from "next/image";

type Props={

item:any;
equipar:any;

}

export default function ItemCard({

item,
equipar

}:Props){

return(

<div className="itemCard">

<Image

src={
item.imagem ||
"/imagens/itens/padrao.png"
}

alt={
item.nome
}

width={120}

height={120}

className="imagemItemInventario"

/>

<h3>

{item.nome}

</h3>

<p>

📦 {item.subtipo}

</p>

{

item.dano && (

<p>

⚔️ Dano:
{item.dano}

</p>

)

}

{

item.defesa && (

<p>

🛡️ Defesa:
{item.defesa}

</p>

)

}

{

item.efeito && (

<p>

🧪 Efeito:
{item.efeito}

</p>

)

}

<button

onClick={()=>
equipar(item)
}

>

Equipar

</button>

</div>

);

}