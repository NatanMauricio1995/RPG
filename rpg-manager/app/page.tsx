"use client";

import { useState } from "react";

export default function Home() {

const estacoes=[
"Verão",
"Outono",
"Inverno",
"Primavera"
];

const climas=[
"Sol",
"Chuva",
"Vento",
"Nublado",
"Neblina",
"Tempestade"
];

const intensidades=[
"Muito fraco",
"Fraco",
"Médio",
"Forte",
"Muito forte"
];

const [estacao,setEstacao]=useState("Verão");
const [clima,setClima]=useState("Sol");
const [intensidade,setIntensidade]=useState("Médio");

function gerarClima(){

const novaEstacao=
estacoes[Math.floor(Math.random()*estacoes.length)];

const novoClima=
climas[Math.floor(Math.random()*climas.length)];

const novaIntensidade=
intensidades[Math.floor(Math.random()*intensidades.length)];

setEstacao(novaEstacao);
setClima(novoClima);
setIntensidade(novaIntensidade);

}

return (

<div className="container">

<header className="topo">

<div>
Estação:

<select
value={estacao}
onChange={(e)=>setEstacao(e.target.value)}
>

{estacoes.map((item)=>(

<option key={item}>
{item}
</option>

))}

</select>

</div>

<div>

Clima:

<select
value={clima}
onChange={(e)=>setClima(e.target.value)}
>

{climas.map((item)=>(

<option key={item}>
{item}
</option>

))}

</select>

</div>

<div>

Intensidade:

<select
value={intensidade}
onChange={(e)=>setIntensidade(e.target.value)}
>

{intensidades.map((item)=>(

<option key={item}>
{item}
</option>

))}

</select>

</div>

<button onClick={gerarClima}>
🎲 Aleatório
</button>

</header>

<div className="conteudo">

<aside className="menu">

<ul>

<li><a href="/personagens">Personagens</a></li>
<li><a href="/bestiario">Bestiário</a></li>
<li><a href="/combate">Sistema de Combate</a></li>
<li><a href="/itens">Itens</a></li>
<li><a href="/calendario">Calendário</a></li>
<li><a href="/npcs">NPCs</a></li>
<li><a href="/missoes">Missões</a></li>
<li><a href="/areas">Áreas</a></li>

</ul>

</aside>

<main className="principal">

<h1>RPG Manager</h1>

<p>
Bem-vindo ao gerenciador de mesa RPG
</p>

<p>
Clima atual:
{estacao} -
{clima} -
{intensidade}
</p>

</main>

</div>

</div>

);

}