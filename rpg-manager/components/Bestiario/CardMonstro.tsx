"use client";

import Link from "next/link";
import Image from "next/image";

type Props={

monstro:any;

}

export default function CardMonstro({

monstro

}:Props){

return(

<div className="cartaMonstro">

<div className="topoCarta">

<h2>

👹 {monstro.nome}

</h2>

<span>

⭐ {monstro.nivel}

</span>

</div>


<div className="imagemCarta">

<Image

src={
monstro.imagem
}

alt={
monstro.nome
}

fill

className="imagemMonstro"

/>

</div>


<div className="corpoCarta">

<p>

🏷️ {monstro.tipo}

</p>

<p>

❤️ Vida:
{monstro.vida}

</p>

<p>

🛡️ Defesa:
{monstro.defesa}

</p>

<p>

✨ Experiência:
{monstro.experiencia}

</p>

</div>


<div className="rodapeCarta">

<Link
href={`/bestiario/${monstro.id}`}
>

<button>

📖 Abrir

</button>

</Link>

</div>

</div>

);

}