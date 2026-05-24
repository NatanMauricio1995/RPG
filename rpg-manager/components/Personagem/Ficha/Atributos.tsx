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
personagemAtual.atributosBase || {}
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

<div className="atributosGrid atributosDerivados">

{[
["vida","Vida Máxima"],
["mana","Mana"],
["critico","Crítico"],
["armadura","Armadura"],
["velocidade","Velocidade"],
["escudo","Escudo"]
].map(([chave,rotulo])=>(

<div
key={chave}
className="atributoCard"
>
<h3>{rotulo}</h3>
<p>
{bonus(chave)>0 ? `+ ${bonus(chave)}` : bonus(chave)}
</p>
</div>

))}

</div>

</>

);

}
