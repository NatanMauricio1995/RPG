"use client";

import {calcularAtributoFinal} from "../../../services/calculoService";

type Props={

personagemAtual:any;

bonus:any;

}

export default function Atributos({

personagemAtual,

bonus

}:Props){

const nomes={

forca:"💪 Força",
destreza:"🏃 Destreza",
constituicao:"🛡️ Constituição",
inteligencia:"🧠 Inteligência",
sabedoria:"✨ Sabedoria",
carisma:"🎭 Carisma"

} as Record<string,string>;

return(

<>

<h2>

📊 Atributos

</h2>

<div className="atributosGrid">

{

Object.entries(
personagemAtual.atributos
).map(

([nome,valor])=>(

<div
key={nome}
className="atributoCard"
>

<h3>

{nomes[nome]}

</h3>

<p>

{valor as number}
<span
className="bonus"
>

+ {
bonus(nome)
}

</span>

= 

{
calcularAtributoFinal(

valor as number,

bonus(nome)

)
}

</p>

</div>

)

)

}

</div>

</>

);

}