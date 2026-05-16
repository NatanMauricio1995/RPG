"use client";

import Link from "next/link";

type Props={

monstro:any;

}

export default function CardMonstro({

monstro

}:Props){

return(

<div className="cardMonstro">

<h2>

👹 {monstro.nome}

</h2>

<div className="dadosMonstro">

<p>

🏷️ Tipo:
{monstro.tipo}

</p>

<p>

⭐ Nível:
{monstro.nivel}

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

<div className="acoesMonstro">

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