"use client";

import {useState,useEffect} from "react";
import {useParams,useRouter} from "next/navigation";
import Image from "next/image";

import {enviarImagem} from "../../services/uploadImagem";

import {
buscarPersonagem,
criarModeloPersonagem,
normalizarPersonagem,
salvarPersonagem
} from "../../services/personagemService";

import classesBase from "../../data/sistema/classes.json";
import racasBase from "../../data/sistema/racas.json";

import {listarClasses} from "../../services/classeServiceFirebase";
import {listarRacas} from "../../services/racaServiceFirebase";
import {listarHabilidades} from "../../services/habilidadeServiceFirebase";

type Props={
modoEdicao?:boolean;
};

type PersonagemFormulario=
ReturnType<typeof criarModeloPersonagem>;

export default function FormularioPersonagem({
modoEdicao=false
}:Props){

const router=useRouter();
const params=useParams();

const id=Number(
params?.id
);

const[
classes,
setClasses
]=useState<any[]>([]);

const[
racas,
setRacas
]=useState<any[]>([]);

const[
habilidadesDisponiveis,
setHabilidadesDisponiveis
]=useState<any[]>([]);

const[
habilidadesClasse,
setHabilidadesClasse
]=useState<any[]>([]);

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
){

return normalizarPersonagem(
encontrado
) as PersonagemFormulario;

}

}

return criarModeloPersonagem();

});

useEffect(()=>{

async function carregarDados(){

const classesFirebase=
await listarClasses();

const racasFirebase=
await listarRacas();

const habilidadesFirebase=
await listarHabilidades();

setClasses([
...classesBase,
...classesFirebase
]);

setRacas([
...racasBase,
...racasFirebase
]);

setHabilidadesDisponiveis(
habilidadesFirebase
);

}

carregarDados();

},[]);

const nomesAtributos={

forca:"Força",
destreza:"Destreza",
constituicao:"Constituição",
inteligencia:"Inteligência",
sabedoria:"Sabedoria",
carisma:"Carisma"

};

async function atualizarHabilidadesClasse(
classeId:number|string,
nivel:number
){

const classe=

classes.find(
(item:any)=>

String(item.id)===
String(classeId)
);

if(
!classe
)
return;

const ids=

classe.habilidadesPorNivel

.filter(
(item:any)=>

item.nivel<=nivel
)

.flatMap(
(item:any)=>

item.habilidades
);

const desbloqueadas=

habilidadesDisponiveis.filter(
(item:any)=>

ids.includes(
item.id
)
);

setHabilidadesClasse(
desbloqueadas
);

}

function alterarCampo(
evento:any
){

const campo=
evento.target.name;

const valor=

evento.target.type==="number"

?

Number(
evento.target.value
)

:

evento.target.value;

setPersonagem(
anterior=>({

...anterior,

[campo]:
valor

})
);

if(
campo==="classeId"
||
campo==="nivel"
){

atualizarHabilidadesClasse(

campo==="classeId"
? valor
: personagem.classeId,

campo==="nivel"
? valor
: personagem.nivel

);

}

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
item=>
Number(
item.trim()
)
)
.filter(
item=>
!Number.isNaN(item)
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
erro
);

}

}

async function salvar(){

const personagemCompleto={

...personagem,

habilidades:

habilidadesClasse.map(
(item:any)=>({

id:item.id,
nome:item.nome,
tipo:item.tipo,
dano:item.dano,
cura:item.cura,
custoMana:item.custoMana,
cooldown:item.cooldown,
efeito:item.efeito

}))

};

await salvarPersonagem(
personagemCompleto
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
racas.map(
(raca:any)=>(

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
classes.map(
(classe:any)=>(

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
value={personagem.xpAtual}
onChange={alterarCampo}
/>
</div>

<div>
<label>XP Necessário</label>
<input
type="number"
name="xpNecessario"
value={personagem.xpNecessario}
onChange={alterarCampo}
/>
</div>

<div>
<label>Vida Atual</label>
<input
type="number"
name="vidaAtual"
value={personagem.vidaAtual}
onChange={alterarCampo}
/>
</div>

<div>
<label>Ouro</label>
<input
type="number"
name="ouro"
value={personagem.ouro}
onChange={alterarCampo}
/>
</div>

</div>

<label>Inventário</label>

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
"/imagens/personagens/padrao.png"
}
alt="Preview"
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

<label>Habilidades desbloqueadas</label>

<div className="listaHabilidadesClasse">

{
habilidadesClasse.map(
(item:any)=>(

<div key={item.id}>
🪄 {item.nome}
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