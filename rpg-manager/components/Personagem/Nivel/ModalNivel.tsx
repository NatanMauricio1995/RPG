"use client";

type Props={

subindoNivel:boolean;

setSubindoNivel:any;

personagemAtual:any;

atributosTemp:any;

pontosRestantes:number;

adicionarPonto:any;

removerPonto:any;

confirmarNivel:any;

}

export default function ModalNivel({

subindoNivel,

setSubindoNivel,

personagemAtual,

atributosTemp,

pontosRestantes,

adicionarPonto,

removerPonto,

confirmarNivel

}:Props){

if(!subindoNivel){

return null;

}

return(

<div className="overlayNivel">

<div className="modalNivel">

<h1>

🎉 Subiu de nível

</h1>


<div className="infoNivel">

<div className="infoNivelCard">

⭐ Próximo nível

<p>

{personagemAtual.nivel}

→

{personagemAtual.nivel+1}

</p>

</div>


<div className="infoNivelCard">

❤️ Vida

<p>

+6

</p>

</div>


<div className="infoNivelCard">

⭐ Restantes

<p>

{pontosRestantes}

</p>

</div>

</div>


<h2>

Distribuir atributos

</h2>


<div className="atributosNivelGrid">

{

Object.entries(
personagemAtual.atributos
).map(

([nome,valor])=>(

<div
key={nome}
className="atributoNivelCard"
>

<h3>

{
{
forca:"💪 Força",
destreza:"🏃 Destreza",
constituicao:"🛡️ Constituição",
inteligencia:"🧠 Inteligência",
sabedoria:"✨ Sabedoria",
carisma:"🎭 Carisma"
}[nome]
}

</h3>


<p className="calculoNivel">

<span>

{valor as number}

</span>

<span className="bonusNivel">

+

{
atributosTemp[
nome as keyof typeof atributosTemp
]
}

</span>

<span>

=

{
(valor as number)+
atributosTemp[
nome as keyof typeof atributosTemp
]
}

</span>

</p>


<div className="controleAtributo">

<button
onClick={()=>
removerPonto(nome)
}
>

➖

</button>

<button
onClick={()=>
adicionarPonto(nome)
}
>

➕

</button>

</div>

</div>

)

)

}

</div>


<div className="botoesNivel">

<button
onClick={()=>
setSubindoNivel(false)
}
>

Cancelar

</button>


<button

disabled={
pontosRestantes>0
}

onClick={
confirmarNivel
}

>

Confirmar

</button>

</div>

</div>

</div>

);

}