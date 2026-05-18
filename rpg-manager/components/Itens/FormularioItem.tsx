"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import Image from "next/image";

import classes from "../../data/sistema/classes.json";
import racas from "../../data/sistema/racas.json";

export default function FormularioItem(){

const router=useRouter();

const[item,setItem]=useState({

id:Date.now(),
nome:"",
descricao:"",
tipo:"Equipamento",
subtipo:"Arma",
nivelMinimo:1,
imagem:"/imagens/itens/padrao.png",

classePermitida:[] as string[],
racaPermitida:[] as string[],

bonus:{
forca:0,
destreza:0,
constituicao:0,
inteligencia:0,
sabedoria:0,
carisma:0
},

efeitos:[
{
tipo:"vida",
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

setItem(anterior=>({
...anterior,
[evento.target.name]:evento.target.value
}));

}


function alterarBonus(
atributo:string,
valor:number
){

setItem(anterior=>({
...anterior,

bonus:{
...anterior.bonus,
[atributo]:valor
}

}));

}


function alternarLista(
campo:string,
valor:string
){

setItem(anterior=>{

const lista=

anterior[
campo as keyof typeof anterior
] as string[];

return{

...anterior,

[campo]:

lista.includes(valor)

? lista.filter(
v=>v!==valor
)

: [...lista,valor]

};

});

}


function alterarEfeito(
index:number,
campo:string,
valor:any
){

setItem(anterior=>{

const novosEfeitos=[
...anterior.efeitos
];

novosEfeitos[index]={

...novosEfeitos[index],

[campo]:valor

};

return{

...anterior,

efeitos:
novosEfeitos

};

});

}


function adicionarEfeito(){

setItem(anterior=>({

...anterior,

efeitos:[

...anterior.efeitos,

{
tipo:"vida",
valor:0
}

]

}));

}


function removerEfeito(
index:number
){

setItem(anterior=>({

...anterior,

efeitos:

anterior.efeitos.filter(
(_:any,i:number)=>i!==index
)

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

setItem(anterior=>({

...anterior,

imagem:
leitor.result

}));

};

leitor.readAsDataURL(
arquivo
);

}


function salvar(){

const itensSalvos=

JSON.parse(

localStorage.getItem(
"itensPersonalizados"
)

||"[]"

);

localStorage.setItem(

"itensPersonalizados",

JSON.stringify([

...itensSalvos,
item

])

);

router.push("/itens");

}


const imagemClasse=(classe:any)=>

classe.imagem?.startsWith("/")
? classe.imagem
: "/imagens/classes/padrao.png";


const imagemRaca=(raca:any)=>

raca.imagem?.startsWith("/")
? raca.imagem
: "/imagens/racas/padrao.png";


return(

<div className="formulario">

<h2 className="formularioTitulo">

✦ Criar Item ✦

</h2>

<label>Nome</label>

<input
name="nome"
value={item.nome}
onChange={alterarCampo}
/>

<label>Descrição</label>

<textarea
name="descricao"
value={item.descricao}
onChange={alterarCampo}
/>

<label>Tipo</label>

<select
name="subtipo"
value={item.subtipo}
onChange={alterarCampo}
>
<option>Arma</option>
<option>Armadura</option>
<option>Acessório</option>
<option>Munição</option>
<option>Consumível</option>
</select>

<label>Nível mínimo</label>

<input
name="nivelMinimo"
type="number"
value={item.nivelMinimo}
onChange={alterarCampo}
/>

<label>Efeitos especiais</label>

{

item.efeitos.map(
(efeito:any,index:number)=>(

<div
key={index}
className="efeitoContainer"
>

<div className="bonusGrid">

<select
value={efeito.tipo}
onChange={(e)=>

alterarEfeito(
index,
"tipo",
e.target.value
)

}
>

<option value="vida">Vida</option>
<option value="mana">Mana</option>
<option value="critico">Crítico</option>
<option value="armadura">Armadura</option>
<option value="velocidade">Velocidade</option>

</select>

<input
type="number"
value={efeito.valor}
onChange={(e)=>

alterarEfeito(
index,
"valor",
Number(e.target.value)
)

}
/>

</div>

<button
type="button"
className="botaoRemover"
onClick={()=>
removerEfeito(index)
}
>

🗑 Remover

</button>

</div>

)

)

}

<button
type="button"
onClick={adicionarEfeito}
>

➕ Adicionar efeito

</button>

<label>Imagem</label>

<input
type="file"
accept="image/*"
onChange={carregarImagem}
/>

<label>Classes Permitidas</label>

<div className="checkboxGrid">

{

classes.map(
(classe:any)=>(

<div
key={classe.id}
className="cardSelecao"
>

<Image
src={imagemClasse(classe)}
alt={classe.nome}
width={80}
height={80}
className="imagemSelecao"
/>

<label>

<input
type="checkbox"
checked={item.classePermitida.includes(classe.nome)}
onChange={()=>alternarLista("classePermitida",classe.nome)}
/>

{classe.nome}

</label>

</div>

)

)

}

</div>

<label>Raças Permitidas</label>

<div className="checkboxGrid">

{

racas.map(
(raca:any)=>(

<div
key={raca.id}
className="cardSelecao"
>

<Image
src={imagemRaca(raca)}
alt={raca.nome}
width={80}
height={80}
className="imagemSelecao"
/>

<label>

<input
type="checkbox"
checked={item.racaPermitida.includes(raca.nome)}
onChange={()=>alternarLista("racaPermitida",raca.nome)}
/>

{raca.nome}

</label>

</div>

)

)

}

</div>

<label>Bônus do Item</label>

<div className="bonusGrid">

{

Object.keys(item.bonus).map(
(atributo)=>(

<div key={atributo}>

<label>

{nomesAtributos[
atributo as keyof typeof nomesAtributos
]}

</label>

<input
type="number"
value={item.bonus[
atributo as keyof typeof item.bonus
]}
onChange={(e)=>
alterarBonus(
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

<div className="previewImagem">

<Image
src={item.imagem}
alt="Preview item"
width={180}
height={180}
/>

</div>

<button
className="botaoSalvar"
onClick={salvar}
>

💾 Salvar Item

</button>

</div>

);

}