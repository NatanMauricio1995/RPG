"use client";

import {useState,useEffect} from "react";
import {useParams,useRouter} from "next/navigation";
import Image from "next/image";
import {enviarImagem} from "../../services/uploadImagem";
import {buscarPersonagem, criarModeloPersonagem, normalizarPersonagem, salvarPersonagem} from "../../services/personagemService";
import classesBase from "../../data/sistema/classes.json";
import racasBase from "../../data/sistema/racas.json";
import {listarClasses} from "../../services/classeServiceFirebase";
import {listarRacas} from "../../services/racaServiceFirebase";

type Props={
modoEdicao?:boolean;
};

type PersonagemFormulario=ReturnType<typeof criarModeloPersonagem>;

export default function FormularioPersonagem({
modoEdicao=false
}:Props){

const router=useRouter();
const params=useParams();

const id=Number(
params?.id
);

const[
personagem,
setPersonagem
]=useState<PersonagemFormulario>(()=>{

if(
modoEdicao &&
id
){

const encontrado=
buscarPersonagem(id);

if(
encontrado
)return normalizarPersonagem(
encontrado
) as PersonagemFormulario;

}

return criarModeloPersonagem();

});

const nomesAtributos={
forca:"Força",
destreza:"Destreza",
constituicao:"Constituição",
inteligencia:"Inteligência",
sabedoria:"Sabedoria",
carisma:"Carisma"
};

function alterarCampo(
evento:any
){

const campo=
evento.target.name;

const valor=
evento.target.type==="number"
? Number(evento.target.value)
: evento.target.value;

setPersonagem(
anterior=>({
...anterior,
[campo]:
valor
})
);

}

function alterarAtributo(
atributo:string,
valor:number
){

setPersonagem(
anterior=>({
...anterior,
atributosBase:{
...anterior.atributosBase,
[atributo]:
valor
}
})
);

}

function alterarInventario(
valor:string
){

setPersonagem(
anterior=>({
...anterior,
inventario:
valor
.split(",")
.map(
item=>Number(item.trim())
)
.filter(
item=>!Number.isNaN(item)
)
})
);

}

async function carregarImagem(
evento:any
){

const arquivo=
evento.target.files?.[0];

if(
!arquivo
)
return;

try{

const url=

await enviarImagem(
arquivo,
"personagens"
);

setPersonagem(
anterior=>({

...anterior,

imagem:url

})
);

}catch(erro){

console.error(
"Erro ao enviar imagem:",
erro
);

}

}

async function salvar(){

await salvarPersonagem(
personagem
);

router.push(
"/personagens"
);

}

return(

<div className="formularioPersonagem">

<h2 className="formularioTitulo">

{
modoEdicao
? "✦ Editar Personagem ✦"
: "✦ Criar Personagem ✦"
}

</h2>

<div className="formularioPersonagemGrid">

<div>

<label>Nome</label>
<input
name="nome"
value={personagem.nome}
onChange={alterarCampo}
/>

</div>

<div>

<label>Raça</label>
<select
name="racaId"
value={personagem.racaId}
onChange={alterarCampo}
>

{
(racas as any[]).map(
(raca)=>(

<option
key={raca.id}
value={raca.id}
>

{raca.nome}

</option>

)
)
}

</select>

</div>

<div>

<label>Classe</label>
<select
name="classeId"
value={personagem.classeId}
onChange={alterarCampo}
>

{
(classes as any[]).map(
(classe)=>(

<option
key={classe.id}
value={classe.id}
>

{classe.nome}

</option>

)
)
}

</select>

</div>

<div>

<label>Nível</label>
<input
type="number"
name="nivel"
min={1}
value={personagem.nivel}
onChange={alterarCampo}
/>

</div>

<div>

<label>XP Atual</label>
<input
type="number"
name="xpAtual"
min={0}
value={personagem.xpAtual}
onChange={alterarCampo}
/>

</div>

<div>

<label>XP Necessário</label>
<input
type="number"
name="xpNecessario"
min={0}
value={personagem.xpNecessario}
onChange={alterarCampo}
/>

</div>

<div>

<label>Vida Atual</label>
<input
type="number"
name="vidaAtual"
min={0}
value={personagem.vidaAtual}
onChange={alterarCampo}
/>

</div>

<div>

<label>Ouro</label>
<input
type="number"
name="ouro"
min={0}
value={personagem.ouro}
onChange={alterarCampo}
/>

</div>

</div>

<label>Inventário por IDs, separados por vírgula</label>
<input
value={personagem.inventario.join(", ")}
onChange={(evento)=>
alterarInventario(
evento.target.value
)
}
/>

<label>Imagem</label>
<input
type="file"
accept="image/*"
onChange={carregarImagem}
/>

<div className="previewImagemPersonagem">

<Image
src={
personagem.imagem ||
"/imagens/racas/padrao.png"
}
alt="Preview do personagem"
width={220}
height={220}
/>

</div>

<label>Atributos Base</label>

<div className="atributosFormularioPersonagem">

{
Object.keys(
personagem.atributosBase
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
personagem.atributosBase[
atributo as keyof typeof personagem.atributosBase
]
}
onChange={(evento)=>
alterarAtributo(
atributo,
Number(evento.target.value)
)
}
/>

</div>

)
)
}

</div>

<button
className="botaoSalvarPersonagem"
onClick={salvar}
>

{
modoEdicao
? "💾 Salvar Alterações"
: "💾 Salvar Personagem"
}

</button>

</div>

);

}
