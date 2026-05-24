"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { buscarPersonagem } from "../../../services/personagemService";
import { resolverEquipados } from "../../../services/itemService";
import { calcularBonusEquipados, calcularStatusDerivados } from "../../../services/efeitosService";

import InformacoesBasicas from "../../../components/Personagem/Ficha/InformacoesBasicas";
import Atributos from "../../../components/Personagem/Ficha/Atributos";
import ModalNivel from "../../../components/Personagem/Nivel/ModalNivel";
import SistemaEquipamento from "../../../components/Personagem/Equipamentos/SistemaEquipamento";
import { useInventario } from "../../../contexts/InventarioContext";

export default function Ficha(){

const params=useParams();
const id = params.id as string;

const [personagemAtual, setPersonagemAtual] = useState<any>(null);
const [loading, setLoading] = useState(true);
const [subindoNivel, setSubindoNivel] = useState(false);

const { carregarInventario, equipados: contextEquipados } = useInventario();

useEffect(() => {
  const carregar = async () => {
    setLoading(true);
    const p = await buscarPersonagem(id);
    if (p) {
      setPersonagemAtual(p);
      const eqResolvidos = await resolverEquipados(p.equipados);
      carregarInventario(p.inventario || [], eqResolvidos);
    }
    setLoading(false);
  };
  carregar();
}, [id]);

if(loading) return <p>Carregando ficha...</p>;

if(!personagemAtual){

return(

<div>

<h1>

❌ Personagem não encontrado

</h1>

</div>

);

}

const statusDerivados = calcularStatusDerivados({
  ...personagemAtual,
  equipados: contextEquipados
});


return(

<div>

<Link href="/personagens">

<button
className="botaoVoltar"
>

⬅️ Voltar

</button>

</Link>

<Link href={`/personagens/${personagemAtual.id}/editar`}>

<button
className="botaoVoltar"
>

✏️ Editar

</button>

</Link>


<div className="ficha">

<h1>

🧙 {personagemAtual.nome}

</h1>


<Image
src={
personagemAtual.imagem ||
"/imagens/racas/padrao.png"
}
alt={
personagemAtual.nome
}
width={350}
height={350}
className="imagemFichaPersonagem"
/>


<InformacoesBasicas
personagemAtual={personagemAtual}
setSubindoNivel={setSubindoNivel}
/>


<Atributos
personagemAtual={personagemAtual}
statusDerivados={statusDerivados}
/>


<SistemaEquipamento personagemId={personagemAtual.id} />


{/* ModalNivel precisaria de atualização similar para async se fosse o foco agora, mas manteremos o fluxo de ficha primeiro */}

</div>

</div>

);

}
