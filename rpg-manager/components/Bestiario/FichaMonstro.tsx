"use client";

import Image from "next/image";

type Props = {
  monstro: any;
};

export default function FichaMonstro({
  monstro
}: Props) {
  const habilidades = monstro.habilidadesDetalhes || monstro.habilidades || [];


const nomes={

forca:"💪 Força",
destreza:"🏃 Destreza",
constituicao:"🛡️ Constituição",
inteligencia:"🧠 Inteligência",
sabedoria:"✨ Sabedoria",
carisma:"🎭 Carisma"

};


return(

<div className="ficha">

<h1>

👹 {monstro.nome}

</h1>

<Image
src={
monstro.imagem ||
"/imagens/monstros/goblin.png"
}
alt={monstro.nome}
width={350}
height={350}
className="imagemFichaMonstro"
/>


<div className="informacoesBasicas">

<div className="infoCard">

🏷️ Tipo

<p>

{monstro.tipo}

</p>

</div>


<div className="infoCard">

⭐ Nível

<p>

{monstro.nivel || 1}

</p>

</div>


<div className="infoCard">

❤️ Vida

<p>

{monstro.vida || 0}

</p>

</div>


<div className="infoCard">

🛡️ Defesa

<p>

{monstro.defesa || monstro.armadura || 0}

</p>

</div>


<div className="infoCard">

🚶 Deslocamento

<p>

{monstro.deslocamento || 0}

</p>

</div>


<div className="infoCard">

✨ Experiência

<p>

{monstro.experiencia || 0}

</p>

</div>

</div>


<h2>

📊 Atributos

</h2>

<div className="atributosGrid">

{

Object.entries(
monstro.atributos || {}
)

.map(

([nome,valor])=>(

<div
key={nome}
className="atributoCard"
>

<h3>

{

nomes[
nome as keyof typeof nomes
]

}

</h3>

<p>

{valor as number}

</p>

</div>

)

)

}

</div>


<h2>

🪄 Habilidades

</h2>

<div className="inventarioGrid">

{

habilidades.length>0

?

habilidades.map(
(item:any,index:number)=>(

<div
key={item.id || index}
className="itemCard"
>

<h3>

{item.nome}

</h3>

{

item.dano && (

<p>

💥 Dano:
{item.dano}

</p>

)

}

<p>

{item.descricao}

</p>

</div>

)

)

:

<p>

Nenhuma habilidade cadastrada

</p>

}

</div>


{

monstro.efeitos?.length>0 && (

<>

<h2>

☠️ Efeitos

</h2>

<div className="inventarioGrid">

{

monstro.efeitos.map(
(item:any,index:number)=>(

<div
key={index}
className="itemCard"
>

<h3>

{item.tipo}

</h3>

<p>

Valor:
{item.valor}

</p>

</div>

)

)

}

</div>

</>

)

}


{

monstro.loot?.length>0 && (

<>

<h2>

🎁 Loot

</h2>

<div className="inventarioGrid">

{

monstro.loot.map(
(item:any,index:number)=>(

<div
key={index}
className="itemCard"
>

<h3>

{item.nome}

</h3>

<p>

Chance:
{item.chance}%

</p>

</div>

)

)

}

</div>

</>

)

}

</div>

);

}
