"use client";

type Props={
personagemAtual:any;
statusDerivados:any;
}

export default function Atributos({
personagemAtual,
statusDerivados
}:Props){

const { atributos, bonus, vidaMaxima, manaMaxima, armadura, velocidade, critico, escudo } = statusDerivados;

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

Object.entries(atributos || {}).map(

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

(+ {
bonus[nome] || 0
})

</span>

</p>

</div>

)

)

}

</div>

<div className="atributosGrid atributosDerivados">

{[
["vida", "Vida Máxima", vidaMaxima],
["mana", "Mana", manaMaxima],
["critico", "Crítico", `${critico}%`],
["armadura", "Armadura", armadura],
["velocidade", "Velocidade", velocidade],
["escudo", "Escudo", escudo]
].map(([chave, rotulo, valor])=>(

<div
key={chave as string}
className="atributoCard"
>
<h3>{rotulo as string}</h3>
<p>
{valor as any}
</p>
</div>

))}

</div>

</>

);

}
