"use client";

import Link from "next/link";
import Image from "next/image";

type Props={

personagem:any;

}

export default function CardPersonagem({

personagem

}:Props){

return(

<div className="cartaPersonagem">

<div className="topoCartaPersonagem">

<h2>

🧙 {personagem.nome}

</h2>

<span>

⭐ {personagem.nivel}

</span>

</div>


<div className="imagemCartaPersonagem">

<Image

src={
personagem.imagem ||
"/imagens/personagens/padrao.png"
}

alt={
personagem.nome
}

fill

className="imagemPersonagem"

/>

</div>


<div className="corpoCartaPersonagem">

<p>

🧬 {personagem.raca}

</p>

<p>

🎭 {personagem.classe}

</p>

<p>

❤️ Vida:
{personagem.vidaAtual}
/
{personagem.vidaMaxima}

</p>

<p>

💰 Ouro:
{personagem.ouro}

</p>

</div>


<div className="rodapeCartaPersonagem">

<Link
href={`/personagens/${personagem.id}`}
>

<button>

📖 Abrir

</button>

</Link>

<button>

✏️ Editar

</button>

<button>

🗑️ Excluir

</button>

</div>

</div>

);

}