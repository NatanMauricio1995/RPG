"use client";

import {useState,useEffect} from "react";
import {useRouter,useParams} from "next/navigation";
import Image from "next/image";

import {salvarClasse, editarClasse, listarClasses} from "../../services/classeServiceFirebase";

type Props={
modoEdicao?:boolean;
};

export default function FormularioClasse({
modoEdicao=false
}:Props){

const router=
useRouter();

const params=
useParams();

const id=
params?.id;

const[
classe,
setClasse
]=useState({

id:Date.now(),

nome:"",
descricao:"",
dadoVida:"1d6",
vidaBase:6,

proficiencias:[] as string[],

imagem:
"/imagens/classes/padrao.png",

habilidadesPorNivel:[

{
nivel:1,
habilidades:[]
}

]

});

useEffect(()=>{

async function carregar(){

if(
!modoEdicao ||
!id
)
return;

const lista=

await listarClasses();

const encontrada=

lista.find(
(item:any)=>

String(item.id)===
String(id)
);

if(
encontrada
){

setClasse(
encontrada as any
);

}

}

carregar();

},[
modoEdicao,
id
]);


function alterarCampo(
evento:any
){

setClasse({

...classe,

[evento.target.name]:

evento.target.type==="number"

?

Number(
evento.target.value
)

:

evento.target.value

});

}


function alterarProficiencias(
valor:string
){

setClasse({

...classe,

proficiencias:

valor

.split(",")

.map(
(item)=>

item.trim()
)

});

}

function adicionarNivel(){

setClasse({

...classe,

habilidadesPorNivel:[

...classe.habilidadesPorNivel,

{
nivel:
classe.habilidadesPorNivel.length+1,

habilidades:[]
}

]

});

}


function alterarHabilidadesNivel(
indice:number,
valor:string
){

const atualizadas=[

...classe.habilidadesPorNivel

];

atualizadas[indice]={

...atualizadas[indice],

habilidades:

valor

.split(",")

.map(
(item)=>

Number(
item.trim()
)
)

.filter(
item=>

!Number.isNaN(
item
)
)

};

setClasse({

...classe,

habilidadesPorNivel:
atualizadas

});

}

function carregarImagem(
evento:any
){

const arquivo=

evento.target.files?.[0];

if(
!arquivo
)
return;

const leitor=
new FileReader();

leitor.onload=()=>{

setClasse({

...classe,

imagem:
String(
leitor.result
)

});

};

leitor.readAsDataURL(
arquivo
);

}


async function salvar(){

if(
modoEdicao
){

await editarClasse(

String(
classe.id
),

classe

);

}else{

await salvarClasse(
classe
);

}

router.push(
"/classes"
);

}


return(

<div className="formulario">

<h2>

{

modoEdicao

?

"✦ Editar Classe ✦"

:

"✦ Criar Classe ✦"

}

</h2>


<label>

Nome

</label>

<input
name="nome"
value={classe.nome}
onChange={alterarCampo}
/>


<label>

Descrição

</label>

<textarea
name="descricao"
value={classe.descricao}
onChange={alterarCampo}
/>


<label>

Dado de Vida

</label>

<select
name="dadoVida"
value={classe.dadoVida}
onChange={alterarCampo}
>

<option>1d6</option>
<option>1d8</option>
<option>1d10</option>
<option>1d12</option>

</select>


<label>

Vida Base

</label>

<input
type="number"
name="vidaBase"
value={classe.vidaBase}
onChange={alterarCampo}
/>


<label>

Proficiências
(separadas por vírgula)

</label>

<input
value={classe.proficiencias.join(", ")}
onChange={(evento)=>

alterarProficiencias(
evento.target.value
)

}
/>


<label>

Imagem

</label>

<input
type="file"
accept="image/*"
onChange={carregarImagem}
/>


<div
className="previewImagem"
>

<Image
src={
classe.imagem
}
alt="Preview"
width={200}
height={200}
/>

</div>

<label>

Habilidades por nível

</label>

{

classe.habilidadesPorNivel.map(
(item,index)=>(

<div
key={index}
className="nivelHabilidades"
>

<h4>

Nível
{item.nivel}

</h4>

<input

placeholder="
IDs separados por vírgula
"

value={
item.habilidades.join(", ")
}

onChange={(evento)=>

alterarHabilidadesNivel(

index,

evento.target.value

)

}

/>

</div>

)

)

}


<button
type="button"
onClick={adicionarNivel}
>

➕ Adicionar Nível

</button>

<button
className="botaoSalvar"
onClick={salvar}
>

💾 Salvar

</button>

</div>

);

}