"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import Image from "next/image";

export default function FormularioMonstro(){

const router=useRouter();

const[monstro,setMonstro]=useState({

id:Date.now(),

nome:"",
tipo:"Besta",
nivel:1,

vida:10,
mana:0,
armadura:0,

imagem:"/imagens/monstros/padrao.png",

atributos:{

forca:0,
destreza:0,
constituicao:0,
inteligencia:0,
sabedoria:0,
carisma:0

},

habilidades:[

{
nome:"",
descricao:"",
dano:""
}

],

efeitos:[

{
tipo:"veneno",
valor:0
}

]

});


const nomesAtributos={

forca:"Força",
destreza:"Destreza",
constituicao:"Constituição",
inteligencia:"Inteligência",
sabedoria:"Sabedoria",
carisma:"Carisma"

};


function alterarCampo(evento:any){

setMonstro(anterior=>({

...anterior,

[evento.target.name]:
evento.target.value

}));

}


function alterarAtributo(
atributo:string,
valor:number
){

setMonstro(anterior=>({

...anterior,

atributos:{

...anterior.atributos,

[atributo]:
valor

}

}));

}


function carregarImagem(
evento:any
){

const arquivo=
evento.target.files?.[0];

if(!arquivo)return;

const leitor=
new FileReader();

leitor.onload=()=>{

setMonstro(anterior=>({

...anterior,

imagem:
leitor.result

}));

};

leitor.readAsDataURL(
arquivo
);

}


function adicionarHabilidade(){

setMonstro(anterior=>({

...anterior,

habilidades:[

...anterior.habilidades,

{
nome:"",
descricao:"",
dano:""
}

]

}));

}


function removerHabilidade(
index:number
){

setMonstro(anterior=>({

...anterior,

habilidades:

anterior.habilidades.filter(
(_:any,i:number)=>i!==index
)

}));

}


function salvar(){

const monstros=

JSON.parse(

localStorage.getItem(
"monstrosPersonalizados"
)

||"[]"

);

localStorage.setItem(

"monstrosPersonalizados",

JSON.stringify([

...monstros,
monstro

])

);

router.push(
"/bestiario"
);

}


return(

<div className="formulario">

<h2 className="formularioTitulo">

✦ Criar Monstro ✦

</h2>

<label>Nome</label>

<input
name="nome"
value={monstro.nome}
onChange={alterarCampo}
/>

<label>Tipo</label>

<select
name="tipo"
value={monstro.tipo}
onChange={alterarCampo}
>

<option>Besta</option>
<option>Humanoide</option>
<option>Morto-vivo</option>
<option>Dragão</option>
<option>Demônio</option>
<option>Elemental</option>

</select>

<label>Nível</label>

<input
type="number"
name="nivel"
value={monstro.nivel}
onChange={alterarCampo}
/>

<label>Vida</label>

<input
type="number"
name="vida"
value={monstro.vida}
onChange={alterarCampo}
/>

<label>Mana</label>

<input
type="number"
name="mana"
value={monstro.mana}
onChange={alterarCampo}
/>

<label>Armadura</label>

<input
type="number"
name="armadura"
value={monstro.armadura}
onChange={alterarCampo}
/>

<label>Imagem</label>

<input
type="file"
accept="image/*"
onChange={carregarImagem}
/>

<label>Atributos</label>

<div className="bonusGrid">

{

Object.keys(
monstro.atributos
).map(
(atributo)=>(

<div key={atributo}>

<label>

{

nomesAtributos[
atributo as keyof typeof nomesAtributos
]

}

</label>

<input
type="number"
value={
monstro.atributos[
atributo as keyof typeof monstro.atributos
]
}
onChange={(e)=>

alterarAtributo(
atributo,
Number(e.target.value)
)

}
/>

</div>

)

)

}

</div>

<label>Habilidades</label>

<button
type="button"
onClick={adicionarHabilidade}
>

➕ Adicionar habilidade

</button>

<div className="previewImagem">

<Image
src={monstro.imagem}
alt="Monstro"
width={200}
height={200}
/>

</div>

<button
className="botaoSalvar"
onClick={salvar}
>

💾 Salvar Monstro

</button>

</div>

);

}