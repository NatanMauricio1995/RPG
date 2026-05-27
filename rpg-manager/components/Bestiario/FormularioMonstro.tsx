"use client";

import {useState,useEffect} from "react";
import {useRouter,useParams} from "next/navigation";
import Image from "next/image";
import { buscarMonstro, salvarMonstro, editarMonstro } from "../../services/combateService";

type Props={
  modoEdicao?:boolean;
};

export default function FormularioMonstro({
  modoEdicao=false
}:Props){
  const router=useRouter();
  const params=useParams();
  const id=params?.id ? String(params.id) : null;

  const modeloMonstro={
    nome:"",
    tipo:"Besta",
    nivel:1,
    vida:10,
    mana:0,
    armadura:0,
    imagem:"/imagens/monstros/goblin.png",
    atributos:{
      forca:10,
      destreza:10,
      constituicao:10,
      inteligencia:10,
      sabedoria:10,
      carisma:10
    },
    habilidades:[],
    efeitos:[],
    loot:[]
  };

  const[monstro,setMonstro]=useState<any>(modeloMonstro);
  const[carregando,setCarregando]=useState(modoEdicao);

  const nomesAtributos={
    forca:"Força",
    destreza:"Destreza",
    constituicao:"Constituição",
    inteligencia:"Inteligência",
    sabedoria:"Sabedoria",
    carisma:"Carisma"
  };

  useEffect(()=>{
    if(!modoEdicao || !id) return;
    async function carregar() {
      const encontrado = await buscarMonstro(id!);
      if (encontrado) {
        setMonstro({ ...modeloMonstro, ...encontrado });
      }
      setCarregando(false);
    }
    carregar();
  },[modoEdicao, id]);

  function alterarCampo(evento:any){
    setMonstro(anterior=>({
      ...anterior,
      [evento.target.name]: evento.target.value
    }));
  }

  function alterarAtributo(atributo:string, valor:number){
    setMonstro(anterior=>({
      ...anterior,
      atributos:{
        ...anterior.atributos,
        [atributo]: valor
      }
    }));
  }

  function carregarImagem(evento:any){
    const arquivo=evento.target.files?.[0];
    if(!arquivo) return;
    const leitor=new FileReader();
    leitor.onload=()=>{
      setMonstro(anterior=>({
        ...anterior,
        imagem: String(leitor.result || "/imagens/monstros/goblin.png")
      }));
    };
    leitor.readAsDataURL(arquivo);
  }

  async function salvar(){
    try {
      if(modoEdicao && id){
        await editarMonstro(id, monstro);
      }else{
        await salvarMonstro(monstro);
      }
      router.push("/bestiario");
    } catch (error) {
      console.error("Erro ao salvar monstro:", error);
    }
  }

  if (carregando) return <div className="carregando">Invocando criatura...</div>;

  return (
    <div className="formulario">
      <h2 className="formularioTitulo">
        {modoEdicao ? "✦ Editar Monstro ✦" : "✦ Criar Monstro ✦"}
      </h2>

      <label>Nome</label>
      <input name="nome" value={monstro.nome} onChange={alterarCampo} />

      <label>Tipo</label>
      <select name="tipo" value={monstro.tipo} onChange={alterarCampo}>
        <option>Besta</option>
        <option>Humanoide</option>
        <option>Morto-vivo</option>
        <option>Dragão</option>
        <option>Demônio</option>
        <option>Elemental</option>
      </select>

      <label>Nível</label>
      <input type="number" name="nivel" value={monstro.nivel} onChange={alterarCampo} />

      <label>Vida</label>
      <input type="number" name="vida" value={monstro.vida} onChange={alterarCampo} />

      <label>Mana</label>
      <input type="number" name="mana" value={monstro.mana} onChange={alterarCampo} />

      <label>Armadura</label>
      <input type="number" name="armadura" value={monstro.armadura} onChange={alterarCampo} />

      <label>Imagem</label>
      <input type="file" accept="image/*" onChange={carregarImagem} />

      <div className="previewImagem">
        <Image src={monstro.imagem} alt="Preview Monstro" width={200} height={200} />
      </div>

      <label>Atributos</label>
      <div className="bonusGrid">
        {Object.keys(monstro.atributos).map((atributo) => (
          <div key={atributo}>
            <label>{(nomesAtributos as any)[atributo]}</label>
            <input
              type="number"
              value={monstro.atributos[atributo]}
              onChange={(e) => alterarAtributo(atributo, Number(e.target.value))}
            />
          </div>
        ))}
      </div>

      <button className="botaoSalvar" onClick={salvar}>
        {modoEdicao ? "💾 Salvar Alterações" : "💾 Salvar Monstro"}
      </button>
    </div>
  );
}
