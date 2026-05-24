"use client";

import Image from "next/image";
import {useParams,useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {buscarNPC, atualizarNPC, criarNPC} from "../../services/npcService";
import { uploadImage } from "../../firebase/storage";

type Props={
modoEdicao?:boolean;
};

export default function FormularioNPC({
modoEdicao=false
}:Props){

const router=useRouter();
const params=useParams();
const id = params?.id as string;

const [loading, setLoading] = useState(true);
const[npc,setNPC]=useState<any>({
  nome: "",
  idade: 30,
  profissao: "",
  alinhamento: "Neutro",
  personalidade: "",
  relacionamento: 0,
  dialogos: [""],
  inventario: [],
  imagem: "/imagens/npcs/ChatGPT Image 18 de mai. de 2026, 18_23_40.png"
});

const [arquivoImagem, setArquivoImagem] = useState<File | null>(null);

useEffect(() => {
  const carregar = async () => {
    if (modoEdicao && id) {
      const encontrado = await buscarNPC(id);
      if (encontrado) {
        setNPC(encontrado);
      }
    }
    setLoading(false);
  };
  carregar();
}, [modoEdicao, id]);

function alterarCampo(evento:any){

const campo=evento.target.name;
const valor=evento.target.type==="number"
? Number(evento.target.value)
: evento.target.value;

setNPC((anterior: any)=>({
...anterior,
[campo]:valor
}));

}

function alterarDialogo(
index:number,
valor:string
){

setNPC((anterior: any)=>{
const dialogos=[...anterior.dialogos];
dialogos[index]=valor;

return{
...anterior,
dialogos
};
});

}

function adicionarDialogo(){

setNPC((anterior: any)=>({
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

setNPC((anterior: any)=>({
...anterior,
dialogos:anterior.dialogos.filter((_: any,i: number)=>i!==index)
}));

}

function alterarInventario(
valor:string
){

setNPC((anterior: any)=>({
...anterior,
inventario:valor
.split(",")
.map((item)=>item.trim())
.filter((item)=>item !== "")
}));

}

function carregarImagem(
evento:any
){

const arquivo=evento.target.files?.[0];

if(!arquivo)
return;

setArquivoImagem(arquivo);

const leitor=new FileReader();

leitor.onload=()=>{
setNPC((anterior: any)=>({
...anterior,
imagem:String(leitor.result || anterior.imagem)
}));
};

leitor.readAsDataURL(arquivo);

}

async function salvar(){
  setLoading(true);
  let urlImagem = npc.imagem;
  if (arquivoImagem) {
    urlImagem = await uploadImage(`npcs/${Date.now()}_${arquivoImagem.name}`, arquivoImagem);
  }

  const dados = {
    ...npc,
    imagem: urlImagem,
    dialogos: npc.dialogos.filter((d: string) => d.trim() !== "")
  };

  if (modoEdicao && id) {
    await atualizarNPC(id, dados);
  } else {
    await criarNPC(dados);
  }

  router.push("/npcs");
}

if (loading) return <p>Carregando...</p>;

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
