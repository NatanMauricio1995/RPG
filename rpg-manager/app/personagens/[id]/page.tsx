"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import personagens from "../../../data/personagens.json";
import itens from "../../../data/itens.json";

import Link from "next/link";
import SistemaEquipamento from "../../../components/Personagem/SistemaEquipamento";

export default function Ficha(){

const params=useParams();

const personagemInicial=
personagens.find(
(item)=>item.id===Number(params.id)
);

if(!personagemInicial){

return(

<div>

<h1>
❌ Personagem não encontrado
</h1>

</div>

);

}


const [personagemAtual,setPersonagemAtual]=
useState(personagemInicial);

const [inventario,setInventario]=
useState(itens);

const [equipados,setEquipados]=
useState({

arma:null,
armadura:null,
acessorio:null,
municao:null

});

const [subindoNivel,setSubindoNivel]=
useState(false);

const [pontosRestantes,setPontosRestantes]=
useState(4);

const [atributosTemp,setAtributosTemp]=
useState({

forca:0,
destreza:0,
constituicao:0,
inteligencia:0,
sabedoria:0,
carisma:0

});


function bonus(atributo:string){

let total=0;

Object.values(
equipados
).forEach((item:any)=>{

if(item?.bonus?.[atributo]){

total+=item.bonus[atributo];

}

});

return total;

}


function adicionarPonto(
atributo:string
){

if(
pontosRestantes<=0
)return;

setAtributosTemp(
(anterior:any)=>({

...anterior,
[atributo]:
anterior[atributo]+1

})
);

setPontosRestantes(
anterior=>anterior-1
);

}


function removerPonto(
atributo:string
){

if(
atributosTemp[
atributo as keyof typeof atributosTemp
]<=0
)return;

setAtributosTemp(
(anterior:any)=>({

...anterior,
[atributo]:
anterior[atributo]-1

})
);

setPontosRestantes(
anterior=>anterior+1
);

}



function confirmarNivel(){

const novosAtributos={

forca:
personagemAtual.atributos.forca+
atributosTemp.forca,

destreza:
personagemAtual.atributos.destreza+
atributosTemp.destreza,

constituicao:
personagemAtual.atributos.constituicao+
atributosTemp.constituicao,

inteligencia:
personagemAtual.atributos.inteligencia+
atributosTemp.inteligencia,

sabedoria:
personagemAtual.atributos.sabedoria+
atributosTemp.sabedoria,

carisma:
personagemAtual.atributos.carisma+
atributosTemp.carisma

};

const vidaGanha=6;

setPersonagemAtual({

...personagemAtual,

nivel:
personagemAtual.nivel+1,

vidaMaxima:
personagemAtual.vidaMaxima+
vidaGanha,

vidaAtual:
personagemAtual.vidaMaxima+
vidaGanha,

atributos:
novosAtributos

});

setSubindoNivel(false);

setPontosRestantes(4);

setAtributosTemp({

forca:0,
destreza:0,
constituicao:0,
inteligencia:0,
sabedoria:0,
carisma:0

});

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

<h1>

🧙 {personagemAtual.nome}

</h1>


<div className="informacoesBasicas">

<div className="infoCard">

🎭 Classe

<p>
{personagemAtual.classe}
</p>

</div>


<div className="infoCard">

⭐ Nível

<p>

{personagemAtual.nivel}

</p>

<button
onClick={()=>
setSubindoNivel(true)
}
>

⬆️ Subir nível

</button>

</div>


<div className="infoCard">

❤️ Vida

<p>

{personagemAtual.vidaAtual}/
{personagemAtual.vidaMaxima}

</p>

</div>


<div className="infoCard">

💰 Ouro

<p>

{personagemAtual.ouro}

</p>

</div>

</div>



<h2>
📊 Atributos
</h2>

<div className="atributosGrid">

{

Object.entries(
personagemAtual.atributos
).map(

([nome,valor])=>(

<div
key={nome}
className="atributoCard"
>

<h3>

{nome}

</h3>

<p>

{valor as number}

<span
className="bonus"
>

+{
bonus(nome)
}

</span>

=

{
(valor as number)+
bonus(nome)
}

</p>

</div>

)

)

}

</div>


<SistemaEquipamento

inventario={inventario}
setInventario={setInventario}

equipados={equipados}
setEquipados={setEquipados}

/>


{

subindoNivel && (

<div
className="modalNivel"
>

<h2>

🎉 Subiu de nível

</h2>

<p>

Pontos restantes:

{pontosRestantes}

</p>


{

Object.entries(
personagemAtual.atributos
).map(

([nome,valor])=>(

<div
key={nome}
>

{nome}

{" "}

(
{(valor as number)+
atributosTemp[
nome as keyof typeof atributosTemp
]
}

)

<button
onClick={()=>
adicionarPonto(nome)
}
>

+

</button>

<button
onClick={()=>
removerPonto(nome)
}
>

-

</button>

</div>

)

)

}


<button

disabled={
pontosRestantes>0
}

onClick={
confirmarNivel
}

>

Confirmar

</button>

</div>

)

}

</div>

</div>

);

}