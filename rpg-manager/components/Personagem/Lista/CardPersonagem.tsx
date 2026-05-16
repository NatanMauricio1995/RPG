"use client";

import Link from "next/link";

type Props={

personagem:any;

}

export default function CardPersonagem({

personagem

}:Props){

return(

<div className="cardPersonagem">

<h2>

🧙 {personagem.nome}

</h2>

<p>

🧬 {personagem.raca}

</p>

<p>

🎭 {personagem.classe}

</p>

<p>

⭐ Nível:
{personagem.nivel}

</p>

<p>

❤️
{personagem.vidaAtual}
/
{personagem.vidaMaxima}

</p>


<div className="acoesPersonagem">

<Link
href={`/personagens/${personagem.id}`}
>

<button>

Abrir

</button>

</Link>


<button>

✏️

</button>


<button>

🗑️

</button>

</div>

</div>

);

}