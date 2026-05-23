"use client";

import {useState,useEffect} from "react";
import {useRouter,useParams} from "next/navigation";
import Image from "next/image";

type Props={

modoEdicao?:boolean;

};

export default function FormularioMonstro({

modoEdicao=false

}:Props){

const router=useRouter();

const params=
useParams();

const id=
Number(
params?.id
);


const modeloMonstro={

id:Date.now(),

nome:"",
tipo:"Besta",
nivel:1,

vida:10,
mana:0,
armadura:0,

imagem:"/imagens/monstros/goblin.png",

atributos:{
forca:0,
destreza:0,
constituicao:0,
inteligencia:0,
sabedoria:0,
carisma:0
},

habilidades:[{
nome:"",
descricao:"",
dano:""
}],

efeitos:[{
tipo:"Veneno",
valor:0
}],

loot:[{
nome:"",
chance:0
}]

};


const[monstro,setMonstro]=
useState(modeloMonstro);


const nomesAtributos={

forca:"Força",
destreza:"Destreza",
constituicao:"Constituição",
inteligencia:"Inteligência",
sabedoria:"Sabedoria",
carisma:"Carisma"

};


useEffect(()=>{

if(
!modoEdicao
)return;

const monstros=

JSON.parse(

localStorage.getItem(
"monstrosPersonalizados"
)

||"[]"

);

const encontrado=

monstros.find(
(m:any)=>

m.id===id
);

if(
!encontrado
)return;


setMonstro({

...modeloMonstro,

...encontrado,

atributos:{

...modeloMonstro.atributos,

...encontrado.atributos

},

habilidades:

encontrado.habilidades ||

modeloMonstro.habilidades,

efeitos:

encontrado.efeitos ||

modeloMonstro.efeitos,

loot:

encontrado.loot ||

modeloMonstro.loot

});

},[
modoEdicao,
id
]);


function alterarCampo(
evento:any
){

setMonstro(
anterior=>({

...anterior,

[evento.target.name]:

evento.target.value

})

);

}


function alterarAtributo(
atributo:string,
valor:number
){

setMonstro(
anterior=>({

...anterior,

atributos:{

...anterior.atributos,

[atributo]:
valor

}

})

);

}


function alterarLista(
lista:string,
index:number,
campo:string,
valor:any
){

setMonstro(
anterior=>{

const novaLista=[

...(anterior[
lista as keyof typeof anterior
] as any[])

];

novaLista[index]={

...novaLista[index],

[campo]:
valor

};

return{

...anterior,

[lista]:
novaLista

};

}

);

}


function adicionar(
lista:string,
objeto:any
){

setMonstro(
anterior=>({

...anterior,

[lista]:[

...(anterior[
lista as keyof typeof anterior
] as any[]),

objeto

]

})

);

}


function remover(
lista:string,
index:number
){

setMonstro(
anterior=>({

...anterior,

[lista]:

(anterior[
lista as keyof typeof anterior
] as any[])

.filter(
(_:any,i:number)=>

i!==index
)

})

);

}


function carregarImagem(
evento:any
){

const arquivo=
evento.target.files?.[0];

if(!arquivo)
return;

const leitor=
new FileReader();

leitor.onload=()=>{

setMonstro(
anterior=>({

...anterior,

imagem:
String(leitor.result || "/imagens/monstros/goblin.png")

})

);

};

leitor.readAsDataURL(
arquivo
);

}


function salvar(){

const monstros=

JSON.parse(

localStorage.getItem(
"monstrosPersonalizados"
)

||"[]"

);

if(
modoEdicao
){

const atualizados=

monstros.map(
(m:any)=>

m.id===id

? monstro

: m
);

localStorage.setItem(

"monstrosPersonalizados",

JSON.stringify(
atualizados
)

);

}else{

localStorage.setItem(

"monstrosPersonalizados",

JSON.stringify([

...monstros,

monstro

])

);

}

router.push(
"/bestiario"
);

}


return(

<div className="formulario">

<h2 className="formularioTitulo">

{

modoEdicao

?

"✦ Editar Monstro ✦"

:

"✦ Criar Monstro ✦"

}

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


<div className="previewImagem">

<Image
src={monstro.imagem}
alt="Preview Monstro"
width={200}
height={200}
/>

</div>


<label>Atributos</label>

<div className="bonusGrid">

{

Object.keys(
monstro.atributos
)

.map(
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
Number(
e.target.value
)
)

}
/>

</div>

)

)

}

</div>


<button
className="botaoSalvar"
onClick={salvar}
>

{

modoEdicao

?

"💾 Salvar Alterações"

:

"💾 Salvar Monstro"

}

</button>

</div>

);

}
