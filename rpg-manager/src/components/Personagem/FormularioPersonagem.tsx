"use client";

import {useEffect, useState} from "react";
import {useParams,useRouter} from "next/navigation";
import Image from "next/image";
import { useAuth } from "../../contexts/AuthContext";
import { listDocuments } from "../../firebase/firestore";
import { uploadImage } from "../../firebase/storage";
import {
buscarPersonagem,
atualizarPersonagem,
criarPersonagem,
normalizarPersonagem,
equipamentosPadrao
} from "../../services/personagemService";

type Props={
modoEdicao?:boolean;
};

export default function FormularioPersonagem({
modoEdicao=false
}:Props){

const { user } = useAuth();
const router=useRouter();
const params=useParams();

const id=params?.id as string;

const [loading, setLoading] = useState(true);
const [classes, setClasses] = useState<any[]>([]);
const [racas, setRacas] = useState<any[]>([]);

const[
personagem,
setPersonagem
]=useState<any>({
  nome: "",
  imagem: "",
  racaId: "",
  classeId: "",
  nivel: 1,
  xpAtual: 0,
  xpNecessario: 100,
  vidaAtual: 10,
  ouro: 0,
  inventario: [],
  equipados: { ...equipamentosPadrao },
  atributosBase: {
    forca: 10,
    destreza: 10,
    constituicao: 10,
    inteligencia: 10,
    sabedoria: 10,
    carisma: 10
  }
});

const [arquivoImagem, setArquivoImagem] = useState<File | null>(null);

useEffect(() => {
  const carregarDados = async () => {
    const cls = await listDocuments("classes");
    const rcs = await listDocuments("racas");
    setClasses(cls);
    setRacas(rcs);

    if (modoEdicao && id) {
      const encontrado = await buscarPersonagem(id);
      if (encontrado) {
        setPersonagem(normalizarPersonagem(encontrado));
      }
    } else if (rcs.length > 0 && cls.length > 0) {
      setPersonagem(prev => ({
        ...prev,
        racaId: rcs[0].id,
        classeId: cls[0].id
      }));
    }
    setLoading(false);
  };
  carregarDados();
}, [modoEdicao, id]);

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
item=>item.trim()
)
.filter(
item=>item !== ""
)
})
);

}

function carregarImagem(
evento:any
){

const arquivo=
evento.target.files?.[0];

if(
!arquivo
)return;

setArquivoImagem(arquivo);

const leitor=
new FileReader();

leitor.onload=()=>{

setPersonagem(
anterior=>({
...anterior,
imagem:
String(leitor.result)
})
);

};

leitor.readAsDataURL(
arquivo
);

}

async function salvar(){
  if (!user) {
    alert("Você precisa estar logado para salvar um personagem.");
    return;
  }

  setLoading(true);
  let urlImagem = personagem.imagem;

  if (arquivoImagem) {
    urlImagem = await uploadImage(`personagens/${user.uid}/${Date.now()}_${arquivoImagem.name}`, arquivoImagem);
  }

  const dadosSalvar = {
    ...personagem,
    uid: user.uid,
    imagem: urlImagem
  };

  if (modoEdicao && id) {
    await atualizarPersonagem(id, dadosSalvar);
  } else {
    await criarPersonagem(dadosSalvar);
  }

  router.push("/personagens");
}

if (loading) return <p>Carregando formulário...</p>;

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
classes.map(
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
disabled={loading}
onClick={salvar}
>

{
loading ? "⌛ Salvando..." :
modoEdicao
? "💾 Salvar Alterações"
: "💾 Salvar Personagem"
}

</button>

</div>

);

}
