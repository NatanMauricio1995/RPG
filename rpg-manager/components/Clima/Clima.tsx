"use client";

import { useState } from "react";
import dadosClima from "../../data/clima.json";

export default function Clima() {

const estacoes=dadosClima.estacoes;

const climasPorEstacao=
dadosClima.climasPorEstacao as Record<string,string[]>;

const intensidades=
dadosClima.intensidades;

const [estacao,setEstacao]=
useState("☀️ Verão");

const [clima,setClima]=
useState("☀️ Sol");

const [intensidade,setIntensidade]=
useState("🟡 Moderado");

function alterarEstacao(novaEstacao:string){

setEstacao(novaEstacao);

setClima(
climasPorEstacao[novaEstacao][0]
);

}

function gerarClima(){

const lista=
climasPorEstacao[estacao];

let novoClima=clima;

while(novoClima===clima){

novoClima=
lista[
Math.floor(
Math.random()*lista.length
)
];

}

const novaIntensidade=
intensidades[
Math.floor(
Math.random()*intensidades.length
)
];

setClima(novoClima);
setIntensidade(novaIntensidade);

}

return(

<>

<div>

Estação:

<select value={estacao} onChange={(e)=> alterarEstacao(e.target.value) }>

{estacoes.map((item)=>(

<option
key={item}
value={item}
>

{item}

</option>

))}

</select>

</div>


<div>

Clima:

<select
value={clima}
onChange={(e)=>
setClima(e.target.value)
}
>

{climasPorEstacao[estacao].map((item)=>(

<option
key={item}
value={item}
>

{item}

</option>

))}

</select>

</div>


<div>

Intensidade:

<select
value={intensidade}
onChange={(e)=>
setIntensidade(e.target.value)
}
>

{intensidades.map((item)=>(

<option
key={item}
value={item}
>

{item}

</option>

))}

</select>

</div>


<button onClick={gerarClima}>
🎲 Aleatório
</button>

</>

);

}