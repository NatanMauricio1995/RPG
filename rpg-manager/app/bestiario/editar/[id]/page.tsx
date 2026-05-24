"use client";

import FormularioMonstro
from "../../../../components/Bestiario/FormularioMonstro";

import Link
from "next/link";

export default function EditarMonstro(){

return(

<div>

<Link href="/bestiario">
<button className="botaoVoltar">Voltar</button>
</Link>

<FormularioMonstro
modoEdicao={true}
/>

</div>

);

}
