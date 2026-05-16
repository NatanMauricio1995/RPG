"use client";

import { useRouter } from "next/navigation";

export default function Ficha() {

const router = useRouter();

return (

<div>

<button
onClick={() => router.back()}
className="botaoVoltar"
>

⬅️ Voltar

</button>

<h1>Ficha do Personagem</h1>

<p>
Aqui aparecerão os dados
</p>

</div>

);

}