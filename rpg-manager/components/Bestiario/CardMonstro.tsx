"use client";

import Link from "next/link";
import Image from "next/image";

type Props={

monstro:any;

};

export default function CardMonstro({

monstro

}:Props){


function excluirMonstro(){

const monstros=

JSON.parse(

localStorage.getItem(
"monstrosPersonalizados"
)

||"[]"

);

const atualizados=

monstros.filter(
(m:any)=>

m.id!==monstro.id
);

localStorage.setItem(

"monstrosPersonalizados",

JSON.stringify(
atualizados
)

);

window.location.reload();

}


function confirmarExclusao(){

const confirmar=

window.confirm(

`Deseja excluir ${monstro.nome}?`

);

if(
confirmar
){

excluirMonstro();

}

}


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
monstro.imagem ||
"/imagens/monstros/padrao.png"
}
alt={monstro.nome}
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
{monstro.defesa || monstro.armadura || 0}

</p>

<p>

✨ Experiência:
{monstro.experiencia || 0}

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


<Link
href={`/bestiario/editar/${monstro.id}`}
>

<button>

✏️ Editar

</button>

</Link>


<button
onClick={confirmarExclusao}
>

🗑 Excluir

</button>

</div>

</div>

);

}