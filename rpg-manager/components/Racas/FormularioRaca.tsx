"use client";

import {useState,useEffect} from "react";
import {useRouter} from "next/navigation";
import Image from "next/image";
import {salvarRaca, listarRacas, editarRaca} from "../../services/personagemService";
import {useParams} from "next/navigation";

type Props={

modoEdicao?:boolean;

};

export default function FormularioRaca({

modoEdicao=false

}:Props){

const router=
useRouter();

const params=
useParams();

const id=
params?.id;

const[
raca,
setRaca
]=useState({

id:Date.now(),

nome:"",
tamanho:"Médio",
deslocamento:9,

bonus:{
forca:0,
destreza:0,
constituicao:0,
inteligencia:0,
sabedoria:0,
carisma:0
},

idiomas:[] as string[],

imagem:"/imagens/racas/padrao.png"

});

useEffect(()=>{

async function carregar(){

if(
!modoEdicao ||
!id
)
return;

const lista=

await listarRacas();

const encontrada=

lista.find(
(item:any)=>

String(item.id)===String(id)
);

if(
encontrada
){

setRaca(
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

setRaca({

...raca,

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


function alterarBonus(
atributo:string,
valor:number
){

setRaca({

...raca,

bonus:{

...raca.bonus,

[atributo]:
valor

}

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

setRaca({

...raca,

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

try{

if(
modoEdicao
){

await editarRaca(

String(
raca.id
),

raca

);

}else{

await salvarRaca(
raca
);

}

router.push(
"/racas"
);

}catch(erro){

console.error(
erro
);

}

}


return(

<div className="formulario">

<h2>

✦ Criar Raça ✦

</h2>

<label>

Nome

</label>

<input
name="nome"
value={raca.nome}
onChange={alterarCampo}
/>


<label>

Tamanho

</label>

<select
name="tamanho"
value={raca.tamanho}
onChange={alterarCampo}
>

<option>
Pequeno
</option>

<option>
Médio
</option>

<option>
Grande
</option>

</select>


<label>

Deslocamento

</label>

<input
name="deslocamento"
type="number"
value={raca.deslocamento}
onChange={alterarCampo}
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
raca.imagem
}
alt="Preview"
width={180}
height={180}
/>

</div>


<label>

Bônus

</label>

<div
className="bonusGrid"
>

{

Object.keys(
raca.bonus
)

.map(
(atributo)=>(

<div
key={atributo}
>

<label>

{atributo}

</label>

<input
type="number"

value={
raca.bonus[
atributo as keyof typeof raca.bonus
]
}

onChange={(evento)=>

alterarBonus(

atributo,

Number(
evento.target.value
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

💾 Salvar

</button>

</div>

);

}