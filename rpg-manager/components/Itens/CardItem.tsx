"use client";

import Image from "next/image";

type Props={

item:any;

onExcluir:any;

}

export default function CardItem({

item,
onExcluir

}:Props){

return(

<div className="cartaItem">

<div className="topoCartaItem">

<h2>

🎒 {item.nome}

</h2>

</div>


<div className="imagemCartaItem">

<Image

src={
item.imagem ||
"/imagens/itens/padrao.png"
}

alt={
item.nome
}

fill

className="imagemItem"

/>

</div>


<div className="corpoCartaItem">

<p>

📦 Tipo:
{item.tipo}

</p>

<p>

🏷️ Categoria:
{item.subtipo}

</p>

<p>

✨ Raridade:
{item.raridade}

</p>

</div>


<div className="rodapeCartaItem">

<button>

📖 Abrir

</button>

<button>

✏️ Editar

</button>

<button

onClick={()=>

onExcluir(
item.id
)

}

>

🗑️ Excluir

</button>

</div>

</div>

);

}