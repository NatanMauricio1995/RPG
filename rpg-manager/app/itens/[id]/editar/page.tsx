"use client";

import Link from "next/link";
import FormularioItem from "../../../../components/Itens/FormularioItem";

export default function EditarItem(){

return(

<div>

<Link href="/itens">
<button className="botaoVoltar">Voltar</button>
</Link>

<FormularioItem modoEdicao/>

</div>

);

}
