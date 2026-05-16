"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import personagens from "../../../data/personagens.json";
import itens from "../../../data/itens.json";

import Link from "next/link";
import SistemaEquipamento from "../../../components/Personagem/SistemaEquipamento";

export default function Ficha(){

const params=useParams();

const personagem=personagens.find(
(item)=>
item.id===Number(params.id)
);


const [inventario,setInventario]=
useState(itens);


const [equipados,setEquipados]=
useState({

arma:null,
armadura:null,
acessorio:null,
municao:null

});


function bonus(atributo:string){

let total=0;

Object.values(
equipados
).forEach((item:any)=>{

if(
item?.bonus?.[atributo]
){

total+=
item.bonus[atributo];

}

});

return total;

}


if(!personagem){

return(

<div>

<h1>
❌ Personagem não encontrado
</h1>

</div>

);

}


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

<div className="cabecalhoFicha">

<h1>

🧙 {personagem.nome}

</h1>


<div className="informacoesBasicas">

<div className="infoCard">

🎭 Classe

<p>

{personagem.classe}

</p>

</div>


<div className="infoCard">

⭐ Nível

<p>

{personagem.nivel}

</p>

</div>


<div className="infoCard">

❤️ Vida

<p>

{personagem.vidaAtual}/
{personagem.vidaMaxima}

</p>

</div>


<div className="infoCard">

💰 Ouro

<p>

{personagem.ouro}

</p>

</div>

</div>

</div>


<h2>

📊 Atributos

</h2>


<div className="atributosGrid">


<div className="atributoCard">

💪

<h3>

Força

</h3>

<p>

{personagem.atributos.forca}

<span className="bonus">

+{bonus("forca")}

</span>

=

{" "}

{personagem.atributos.forca+
bonus("forca")}

</p>

</div>



<div className="atributoCard">

🏃

<h3>

Destreza

</h3>

<p>

{personagem.atributos.destreza}

<span className="bonus">

+{bonus("destreza")}

</span>

=

{" "}

{personagem.atributos.destreza+
bonus("destreza")}

</p>

</div>



<div className="atributoCard">

🛡️

<h3>

Constituição

</h3>

<p>

{personagem.atributos.constituicao}

<span className="bonus">

+{bonus("constituicao")}

</span>

=

{" "}

{personagem.atributos.constituicao+
bonus("constituicao")}

</p>

</div>



<div className="atributoCard">

🧠

<h3>

Inteligência

</h3>

<p>

{personagem.atributos.inteligencia}

<span className="bonus">

+{bonus("inteligencia")}

</span>

=

{" "}

{personagem.atributos.inteligencia+
bonus("inteligencia")}

</p>

</div>



<div className="atributoCard">

✨

<h3>

Sabedoria

</h3>

<p>

{personagem.atributos.sabedoria}

<span className="bonus">

+{bonus("sabedoria")}

</span>

=

{" "}

{personagem.atributos.sabedoria+
bonus("sabedoria")}

</p>

</div>



<div className="atributoCard">

🎭

<h3>

Carisma

</h3>

<p>

{personagem.atributos.carisma}

<span className="bonus">

+{bonus("carisma")}

</span>

=

{" "}

{personagem.atributos.carisma+
bonus("carisma")}

</p>

</div>


</div>


<SistemaEquipamento

inventario={inventario}
setInventario={setInventario}

equipados={equipados}
setEquipados={setEquipados}

/>

</div>

</div>

);

}