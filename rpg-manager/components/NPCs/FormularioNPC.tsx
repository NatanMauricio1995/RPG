"use client";

import Image from "next/image";
import {useParams,useRouter} from "next/navigation";
import {useState} from "react";
import {buscarNPC,criarModeloNPC,NPC,normalizarNPC,salvarNPC} from "../../services/npcService";

type Props={
modoEdicao?:boolean;
};

export default function FormularioNPC({
modoEdicao=false
}:Props){

const router=useRouter();
const params=useParams();
const id=Number(params?.id);

const[npc,setNPC]=useState<NPC>(()=>{
if(modoEdicao && id){
const encontrado=buscarNPC(id);

if(encontrado)
return normalizarNPC(encontrado);
}

return criarModeloNPC();
});

function alterarCampo(evento:any){

const campo=evento.target.name;
const valor=evento.target.type==="number"
? Number(evento.target.value)
: evento.target.value;

setNPC((anterior)=>({
...anterior,
[campo]:valor
}));

}

function alterarDialogo(
index:number,
valor:string
){

setNPC((anterior)=>{
const dialogos=[...anterior.dialogos];
dialogos[index]=valor;

return{
...anterior,
dialogos
};
});

}

function adicionarDialogo(){

setNPC((anterior)=>({
...anterior,
dialogos:[
...anterior.dialogos,
""
]
}));

}

function removerDialogo(
index:number
){

setNPC((anterior)=>({
...anterior,
dialogos:anterior.dialogos.filter((_,i)=>i!==index)
}));

}

function alterarInventario(
valor:string
){

setNPC((anterior)=>({
...anterior,
inventario:valor
.split(",")
.map((item)=>Number(item.trim()))
.filter((item)=>!Number.isNaN(item))
}));

}

function carregarImagem(
evento:any
){

const arquivo=evento.target.files?.[0];

if(!arquivo)
return;

const leitor=new FileReader();

leitor.onload=()=>{
setNPC((anterior)=>({
...anterior,
imagem:String(leitor.result || anterior.imagem)
}));
};

leitor.readAsDataURL(arquivo);

}

function salvar(){

salvarNPC({
...npc,
dialogos:npc.dialogos.filter((dialogo)=>dialogo.trim())
});

router.push("/npcs");

}

return(
<div className="formularioNPC">
<h2 className="formularioTitulo">
{modoEdicao ? "Editar NPC" : "Criar NPC"}
</h2>

<div className="formularioNPCGrid">
<div>
<label>Nome</label>
<input
name="nome"
value={npc.nome}
onChange={alterarCampo}
/>
</div>

<div>
<label>Idade</label>
<input
name="idade"
type="number"
min={0}
value={npc.idade}
onChange={alterarCampo}
/>
</div>

<div>
<label>Profissão</label>
<input
name="profissao"
value={npc.profissao}
onChange={alterarCampo}
/>
</div>

<div>
<label>Alinhamento</label>
<select
name="alinhamento"
value={npc.alinhamento}
onChange={alterarCampo}
>
<option>Leal Bom</option>
<option>Neutro Bom</option>
<option>Caótico Bom</option>
<option>Leal Neutro</option>
<option>Neutro</option>
<option>Caótico Neutro</option>
<option>Leal Mau</option>
<option>Neutro Mau</option>
<option>Caótico Mau</option>
</select>
</div>
</div>

<label>Personalidade</label>
<textarea
name="personalidade"
value={npc.personalidade}
onChange={alterarCampo}
/>

<label>Inventário por IDs, separados por vírgula</label>
<input
value={npc.inventario.map((item:any)=>item.id || item).join(", ")}
onChange={(evento)=>alterarInventario(evento.target.value)}
/>

<label>Relacionamento com o jogador</label>
<input
name="relacionamento"
type="number"
min={-100}
max={100}
value={npc.relacionamento}
onChange={alterarCampo}
/>

<label>Diálogos</label>
<div className="listaDialogosNPC">
{npc.dialogos.map((dialogo,index)=>(
<div
key={index}
className="linhaDialogoNPC"
>
<textarea
value={dialogo}
onChange={(evento)=>alterarDialogo(index,evento.target.value)}
/>
<button
type="button"
onClick={()=>removerDialogo(index)}
>
Remover
</button>
</div>
))}
</div>

<button
type="button"
className="botaoSecundarioNPC"
onClick={adicionarDialogo}
>
Adicionar diálogo
</button>

<label>Imagem</label>
<input
type="file"
accept="image/*"
onChange={carregarImagem}
/>

<div className="previewNPC">
<Image
src={npc.imagem || "/imagens/npcs/ChatGPT Image 18 de mai. de 2026, 18_23_40.png"}
alt="Preview do NPC"
width={220}
height={220}
/>
</div>

<button
className="botaoSalvarNPC"
onClick={salvar}
>
Salvar NPC
</button>
</div>
);

}
