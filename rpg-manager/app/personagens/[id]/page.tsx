"use client";

import Image from "next/image";
import usePersonagem from "../../../hooks/usePersonagem";
import useNivel from "../../../hooks/useNivel";
import useEquipamento from "../../../hooks/useEquipamento";
import useInventario from "../../../hooks/useInventario";
import InformacoesBasicas from "../../../components/Personagem/Ficha/InformacoesBasicas";
import Atributos from "../../../components/Personagem/Ficha/Atributos";
import ModalNivel from "../../../components/Personagem/Nivel/ModalNivel";

import { useParams } from "next/navigation";
import Link from "next/link";

import SistemaEquipamento from "../../../components/Personagem/Equipamentos/SistemaEquipamento";

export default function Ficha(){

const params=useParams();


const{

personagemAtual,
setPersonagemAtual

}=usePersonagem(
Number(params.id)
);


if(!personagemAtual){

return(

<div>

<h1>

❌ Personagem não encontrado

</h1>

</div>

);

}
const{

inventario,

equipados

}=useInventario();

const{

bonus

}=useEquipamento(
equipados
);

const{

subindoNivel,
setSubindoNivel,

pontosRestantes,

atributosTemp,

adicionarPonto,
removerPonto,

confirmarNivel

}=useNivel(

personagemAtual,
setPersonagemAtual

);



return(

<div>

<Link href="/personagens">

<button
className="botaoVoltar"
>

⬅️ Voltar

</button>

</Link>


<div className="ficha">

<h1>

🧙 {personagemAtual.nome}

</h1>

<Image

src={
personagemAtual.imagem ||
"/imagens/personagens/padrao.png"
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

bonus={bonus}

/>


<SistemaEquipamento/>


<ModalNivel

subindoNivel={subindoNivel}

setSubindoNivel={setSubindoNivel}

personagemAtual={personagemAtual}

atributosTemp={atributosTemp}

pontosRestantes={pontosRestantes}

adicionarPonto={adicionarPonto}

removerPonto={removerPonto}

confirmarNivel={confirmarNivel}

/>

</div>

</div>

);

}