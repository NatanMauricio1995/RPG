"use client";

import {useEffect, useState, type ChangeEvent} from "react";
import {useParams,useRouter} from "next/navigation";
import Image from "next/image";
import { listDocuments } from "../../firebase/firestore";
import { uploadImage } from "../../firebase/storage";
import { buscarItem, criarItem, atualizarItem, normalizarItem } from "../../services/itemService";
import { ItemSlot, Rarity } from "../../types";

type Props={
modoEdicao?:boolean;
};

export default function FormularioItem({
modoEdicao=false
}:Props){

const router=useRouter();
const params=useParams();
const id = params?.id as string;

const [loading, setLoading] = useState(true);
const [classes, setClasses] = useState<any[]>([]);
const [racas, setRacas] = useState<any[]>([]);

const[item,setItem]=useState<any>({
  nome: "",
  descricao: "",
  tipo: "Equipamento",
  subtipo: "Arma",
  raridade: "Comum" as Rarity,
  imagem: "/imagens/itens/padrao.png",
  slotCompativel: [] as ItemSlot[],
  bonus: {
    ataque: 0, defesa: 0, vida: 0, mana: 0, velocidade: 0,
    forca: 0, destreza: 0, constituicao: 0, inteligencia: 0, sabedoria: 0, carisma: 0
  },
  efeitos: []
});

const [arquivoImagem, setArquivoImagem] = useState<File | null>(null);

useEffect(() => {
  const carregar = async () => {
    const cls = await listDocuments("classes");
    const rcs = await listDocuments("racas");
    setClasses(cls);
    setRacas(rcs);

    if (modoEdicao && id) {
      const encontrado = await buscarItem(id);
      if (encontrado) {
        setItem(normalizarItem(encontrado));
      }
    }
    setLoading(false);
  };
  carregar();
}, [modoEdicao, id]);

const nomesAtributos={
ataque: "Ataque",
defesa: "Defesa",
vida: "Vida",
mana: "Mana",
velocidade: "Velocidade",
forca:"Força",
destreza:"Destreza",
constituicao:"Constituição",
inteligencia:"Inteligência",
sabedoria:"Sabedoria",
carisma:"Carisma"
};

const todosSlots: {id: ItemSlot, label: string}[] = [
  { id: "armaPrincipal", label: "Arma Principal" },
  { id: "armaSecundaria", label: "Arma Secundária" },
  { id: "capacete", label: "Capacete" },
  { id: "peitoral", label: "Peitoral" },
  { id: "luvas", label: "Luvas" },
  { id: "botas", label: "Botas" },
  { id: "acessorio1", label: "Acessório 1" },
  { id: "acessorio2", label: "Acessório 2" },
  { id: "itemEspecial", label: "Item Especial" }
];

function alterarCampo(evento: any){
  setItem((prev: any) => ({ ...prev, [evento.target.name]: evento.target.value }));
}

function alterarBonus(atributo:string, valor:number){
  setItem((prev: any) => ({
    ...prev,
    bonus: { ...prev.bonus, [atributo]: valor }
  }));
}

function alternarSlot(slot: ItemSlot) {
  setItem((prev: any) => {
    const lista = prev.slotCompativel || [];
    return {
      ...prev,
      slotCompativel: lista.includes(slot) ? lista.filter((s: any) => s !== slot) : [...lista, slot]
    };
  });
}

function carregarImagem(evento:ChangeEvent<HTMLInputElement>){
  const arquivo = evento.target.files?.[0];
  if(!arquivo) return;
  setArquivoImagem(arquivo);
  const leitor = new FileReader();
  leitor.onload = () => {
    setItem((prev: any) => ({ ...prev, imagem: String(leitor.result) }));
  };
  leitor.readAsDataURL(arquivo);
}

async function salvar(){
  setLoading(true);
  let urlImagem = item.imagem;
  if (arquivoImagem) {
    urlImagem = await uploadImage(`itens/${Date.now()}_${arquivoImagem.name}`, arquivoImagem);
  }

  const dados = { ...item, imagem: urlImagem };

  if (modoEdicao && id) {
    await atualizarItem(id, dados);
  } else {
    await criarItem(dados);
  }
  router.push("/itens");
}

if (loading) return <p>Carregando formulário...</p>;

return(
<div className="formulario">
<h2 className="formularioTitulo">{modoEdicao ? "✦ Editar Item ✦" : "✦ Criar Item ✦"}</h2>

<label>Nome</label>
<input name="nome" value={item.nome} onChange={alterarCampo} />

<label>Descrição</label>
<textarea name="descricao" value={item.descricao} onChange={alterarCampo} />

<div className="formularioGrid">
  <div>
    <label>Tipo</label>
    <select name="tipo" value={item.tipo} onChange={alterarCampo}>
      <option value="Equipamento">Equipamento</option>
      <option value="Consumível">Consumível</option>
      <option value="Diversos">Diversos</option>
    </select>
  </div>
  <div>
    <label>Raridade</label>
    <select name="raridade" value={item.raridade} onChange={alterarCampo}>
      <option value="Comum">Comum</option>
      <option value="Incomum">Incomum</option>
      <option value="Raro">Raro</option>
      <option value="Épico">Épico</option>
      <option value="Lendário">Lendário</option>
    </select>
  </div>
</div>

{item.tipo === "Equipamento" && (
  <>
    <label>Slots Compatíveis</label>
    <div className="checkboxGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
      {todosSlots.map(slot => (
        <label key={slot.id} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <input type="checkbox" checked={(item.slotCompativel || []).includes(slot.id)} onChange={() => alternarSlot(slot.id)} />
          {slot.label}
        </label>
      ))}
    </div>
  </>
)}

<label>Bônus do Item</label>
<div className="bonusGrid">
  {Object.entries(nomesAtributos).map(([key, label]) => (
    <div key={key}>
      <label>{label}</label>
      <input type="number" value={item.bonus[key] || 0} onChange={(e) => alterarBonus(key, Number(e.target.value))} />
    </div>
  ))}
</div>

<label>Imagem</label>
<input type="file" accept="image/*" onChange={carregarImagem} />
<div className="previewImagem">
  <Image src={item.imagem} alt="Preview" width={180} height={180} />
</div>

<button className="botaoSalvar" disabled={loading} onClick={salvar}>
  {loading ? "⌛ Salvando..." : (modoEdicao ? "💾 Salvar Alterações" : "💾 Salvar Item")}
</button>
</div>
);
}
