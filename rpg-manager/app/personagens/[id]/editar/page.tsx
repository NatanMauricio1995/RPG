import FormularioPersonagem
from "../../../../components/Personagem/FormularioPersonagem";

import Link
from "next/link";

export default function EditarPersonagem(){

return(

<div>

<Link href="/personagens">
<button className="botaoVoltar">Voltar</button>
</Link>

<FormularioPersonagem modoEdicao/>

</div>

);

}
