"use client";
import Image from "next/image";
import habilidadesMonstros
from "../../data/sistema/habilidadesMonstros.json";

type Props={

monstro:any;

}

export default function FichaMonstro({

monstro

}:Props){

const habilidades=

habilidadesMonstros.filter(
(h)=>

monstro.habilidades.includes(
h.id
)

);


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

"/imagens/monstros/padrao.png"

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

{monstro.nivel}

</p>

</div>


<div className="infoCard">

❤️ Vida

<p>

{monstro.vida}

</p>

</div>


<div className="infoCard">

🛡️ Defesa

<p>

{monstro.defesa}

</p>

</div>


<div className="infoCard">

🚶 Deslocamento

<p>

{monstro.deslocamento}

</p>

</div>


<div className="infoCard">

✨ Experiência

<p>

{monstro.experiencia}

</p>

</div>

</div>


<h2>

📊 Atributos

</h2>


<div className="atributosGrid">

{

Object.entries(
monstro.atributos
).map(

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

habilidades.map(
(item)=>(

<div
key={item.id}
className="itemCard"
>

<h3>

{item.nome}

</h3>

<p>

{item.descricao}

</p>

</div>

)

)

}

</div>

</div>

);

}