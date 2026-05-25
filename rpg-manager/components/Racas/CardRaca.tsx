"use client";

import Link from "next/link";
import Image from "next/image";
import {useRouter} from "next/navigation";
import {excluirRaca} from "../../services/racaServiceFirebase";
export default function CardRaca({
raca
}:any){

const router=
useRouter();

async function excluir(){

if(

!window.confirm(
`Excluir ${raca.nome}?`
)

)

return;

await excluirRaca(
String(
raca.id
)
);

router.refresh();

window.location.reload();

}


return(

<div className="cardRaca">

<Image
src={
raca.imagem ||
"/imagens/racas/padrao.png"
}
alt={raca.nome}
width={140}
height={140}
/>

<h3>

{raca.nome}

</h3>

<p>

📏 Tamanho:
{raca.tamanho}

</p>

<p>

🚶 Deslocamento:
{raca.deslocamento}

</p>


<div className="acoesCard">

<Link
href={`/racas/editar/${raca.id}`}
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