"use client";

import Image from "next/image";

type Props={

item:any;

}

export default function FichaItem({

item

}:Props){

return(

<div className="ficha">

<h1>

🎒 {item.nome}

</h1>


<Image

src={
item.imagem ||
"/imagens/itens/padrao.png"
}

alt={
item.nome
}

width={350}

height={350}

className="imagemFichaItem"

/>


<div className="informacoesBasicas">

<div className="infoCard">

📦 Tipo

<p>

{item.tipo}

</p>

</div>


<div className="infoCard">

🏷️ Categoria

<p>

{item.subtipo}

</p>

</div>


<div className="infoCard">

✨ Raridade

<p>

{item.raridade}

</p>

</div>


<div className="infoCard">

💰 Valor

<p>

{item.valor}

</p>

</div>


<div className="infoCard">

⚖️ Peso

<p>

{item.peso}

</p>

</div>

</div>


<h2>

📊 Informações

</h2>


<div className="atributosGrid">

{

item.dano && (

<div className="atributoCard">

⚔️ Dano

<p>

{item.dano}

</p>

</div>

)

}


{

item.defesa && (

<div className="atributoCard">

🛡️ Defesa

<p>

{item.defesa}

</p>

</div>

)

}


{

item.efeito && (

<div className="atributoCard">

🧪 Efeito

<p>

{item.efeito}

</p>

</div>

)

}

</div>

</div>

);

}