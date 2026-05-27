"use client";

import Image from "next/image";
import Link from "next/link";
import {useRouter} from "next/navigation";

import { excluirClasse } from "../../services/personagemService";

export default function CardClasse({
classe
}:any){

const router=
useRouter();

async function excluir(){

if(
!window.confirm(
`Excluir ${classe.nome}?`
)
)
return;

await excluirClasse(
String(
classe.id
)
);

router.refresh();

window.location.reload();

}

return(

<div className="cardClasse">

<Image
src={
classe.imagem ||
"/imagens/classes/padrao.png"
}
alt={classe.nome}
width={140}
height={140}
/>

<h3>

{classe.nome}

</h3>

<p>

❤️ Vida Base:
{classe.vidaBase}

</p>

<p>

🎲 {classe.dadoVida}

</p>

<div className="acoesCard">

<Link
href={`/classes/editar/${classe.id}`}
>

<button>

✏️ Editar

</button>

</Link>

<button
onClick={excluir}
>

🗑 Excluir

</button>

</div>

</div>

);

}