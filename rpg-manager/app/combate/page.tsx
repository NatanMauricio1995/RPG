"use client";

import Image from "next/image";
import {useMemo,useState} from "react";
import {listarPersonagens} from "../../services/personagemService";
import {
Combatente,
EstadoCombate,
executarAtaqueBasico,
executarHabilidade,
iniciarCombate,
listarMonstrosCombate,
passarTurno
} from "../../services/combateService";

export default function CombatePage(){

const personagens=useMemo(()=>listarPersonagens(),[]);
const monstros=useMemo(()=>listarMonstrosCombate(),[]);

const[personagensSelecionados,setPersonagensSelecionados]=useState<number[]>([]);
const[monstrosSelecionados,setMonstrosSelecionados]=useState<number[]>([]);
const[estado,setEstado]=useState<EstadoCombate | null>(null);
const[alvoSelecionado,setAlvoSelecionado]=useState("");

const combatenteAtual=estado
? estado.combatentes.find((combatente)=>combatente.id===estado.ordem[estado.indiceTurno])
: null;

const alvosDisponiveis=estado && combatenteAtual
? estado.combatentes.filter((combatente)=>combatente.lado!==combatenteAtual.lado && combatente.vivo)
: [];

function alternarSelecao(
id:number,
lista:number[],
setLista:(valor:number[])=>void
){

setLista(
lista.includes(id)
? lista.filter((item)=>item!==id)
: [...lista,id]
);

}

function comecarCombate(){

const aliados=personagens.filter((personagem:any)=>personagensSelecionados.includes(Number(personagem.id)));
const inimigos=monstros.filter((monstro:any)=>monstrosSelecionados.includes(Number(monstro.id)));

if(aliados.length===0 || inimigos.length===0)
return;

const novoEstado=iniciarCombate(aliados,inimigos);
setEstado(novoEstado);

const atual=novoEstado.combatentes.find((combatente)=>combatente.id===novoEstado.ordem[novoEstado.indiceTurno]);
const primeiroAlvo=novoEstado.combatentes.find((combatente)=>combatente.lado!==atual?.lado && combatente.vivo);
setAlvoSelecionado(primeiroAlvo?.id || "");

}

function atualizarEstado(
novoEstado:EstadoCombate
){

setEstado(novoEstado);

const atual=novoEstado.combatentes.find((combatente)=>combatente.id===novoEstado.ordem[novoEstado.indiceTurno]);
const alvoAtual=novoEstado.combatentes.find((combatente)=>combatente.id===alvoSelecionado);

if(!alvoAtual?.vivo || alvoAtual.lado===atual?.lado){
const novoAlvo=novoEstado.combatentes.find((combatente)=>combatente.lado!==atual?.lado && combatente.vivo);
setAlvoSelecionado(novoAlvo?.id || "");
}

}

function acaoAtaque(){

if(!estado || !combatenteAtual || !alvoSelecionado)
return;

atualizarEstado(
executarAtaqueBasico(estado,combatenteAtual.id,alvoSelecionado)
);

}

function acaoHabilidade(
habilidadeId:string
){

if(!estado || !combatenteAtual || !alvoSelecionado)
return;

atualizarEstado(
executarHabilidade(estado,combatenteAtual.id,alvoSelecionado,habilidadeId)
);

}

function acaoInimiga(){

if(!estado || !combatenteAtual)
return;

const alvo=estado.combatentes.find((combatente)=>combatente.lado==="aliado" && combatente.vivo);

if(!alvo)
return;

const habilidade=combatenteAtual.habilidades.find((item)=>
combatenteAtual.manaAtual>=item.custoMana &&
(combatenteAtual.cooldowns[item.id] || 0)===0
);

atualizarEstado(
habilidade
? executarHabilidade(estado,combatenteAtual.id,alvo.id,habilidade.id)
: executarAtaqueBasico(estado,combatenteAtual.id,alvo.id)
);

}

return(

<div className="paginaCombate">

<div className="topoCombate">
<div>
<h1>Sistema de Combate</h1>
<p>Batalhas com iniciativa, turnos, dano, defesa, efeitos, habilidades e histórico completo.</p>
</div>

<button
className="botaoNovo"
onClick={comecarCombate}
disabled={personagensSelecionados.length===0 || monstrosSelecionados.length===0}
>
Iniciar Combate
</button>
</div>

<section className="preparacaoCombate">
<PainelSelecao
titulo="Aliados"
itens={personagens}
selecionados={personagensSelecionados}
onAlternar={(id)=>
alternarSelecao(id,personagensSelecionados,setPersonagensSelecionados)
}
/>

<PainelSelecao
titulo="Inimigos"
itens={monstros}
selecionados={monstrosSelecionados}
onAlternar={(id)=>
alternarSelecao(id,monstrosSelecionados,setMonstrosSelecionados)
}
/>
</section>

{estado && combatenteAtual &&(
<section className="mesaCombate">
<div className="estadoCombate">
<div className={`placarCombate ${estado.status}`}>
<span>Turno {estado.turno}</span>
<strong>{textoStatus(estado.status)}</strong>
</div>

<div className="ordemTurnos">
{estado.ordem.map((id)=>{
const combatente=estado.combatentes.find((item)=>item.id===id);

if(!combatente)
return null;

return(
<span
key={id}
className={`${combatente.id===combatenteAtual.id ? "turnoAtual" : ""} ${!combatente.vivo ? "abatido" : ""}`}
>
{combatente.nome}
</span>
);
})}
</div>
</div>

<div className="gridCombatentes">
<GrupoCombatentes
titulo="Grupo"
combatentes={estado.combatentes.filter((combatente)=>combatente.lado==="aliado")}
atualId={combatenteAtual.id}
/>
<GrupoCombatentes
titulo="Ameaças"
combatentes={estado.combatentes.filter((combatente)=>combatente.lado==="inimigo")}
atualId={combatenteAtual.id}
/>
</div>

{estado.status==="em_andamento" &&(
<div className="painelAcoesCombate">
<div>
<small>Turno atual</small>
<h2>{combatenteAtual.nome}</h2>
<p>Iniciativa {combatenteAtual.rolagemIniciativa}+{Math.round(combatenteAtual.velocidade)} = {Math.round(combatenteAtual.iniciativa)}</p>
</div>

<label>
Alvo
<select
value={alvoSelecionado}
onChange={(evento)=>setAlvoSelecionado(evento.target.value)}
>
{alvosDisponiveis.map((combatente)=>(
<option
key={combatente.id}
value={combatente.id}
>
{combatente.nome}
</option>
))}
</select>
</label>

{combatenteAtual.lado==="aliado" ? (
<div className="acoesDisponiveis">
<button onClick={acaoAtaque}>Ataque Básico</button>
{combatenteAtual.habilidades.map((habilidade)=>(
<button
key={habilidade.id}
onClick={()=>acaoHabilidade(habilidade.id)}
disabled={
combatenteAtual.manaAtual<habilidade.custoMana ||
(combatenteAtual.cooldowns[habilidade.id] || 0)>0
}
title={`${habilidade.tipo} | mana ${habilidade.custoMana} | recarga ${habilidade.cooldown}`}
>
{habilidade.nome}
<span>{habilidade.dano} mana {habilidade.custoMana}</span>
</button>
))}
<button onClick={()=>atualizarEstado(passarTurno(estado,combatenteAtual.id))}>Passar</button>
</div>
) : (
<div className="acoesDisponiveis">
<button onClick={acaoInimiga}>Executar Ação do Inimigo</button>
</div>
)}
</div>
)}

<LogCombate estado={estado}/>
</section>
)}

</div>

);

}

function PainelSelecao({
titulo,
itens,
selecionados,
onAlternar
}:{
titulo:string;
itens:any[];
selecionados:number[];
onAlternar:(id:number)=>void;
}){

return(
<div className="painelSelecaoCombate">
<h2>{titulo}</h2>
<div className="listaSelecaoCombate">
{itens.map((item:any)=>(
<button
key={item.id}
className={selecionados.includes(Number(item.id)) ? "selecionado" : ""}
onClick={()=>onAlternar(Number(item.id))}
>
<Image
src={item.imagem || "/imagens/racas/padrao.png"}
alt={item.nome}
width={64}
height={64}
/>
<span>{item.nome}</span>
<small>Nível {item.nivel || 1}</small>
</button>
))}
</div>
</div>
);

}

function GrupoCombatentes({
titulo,
combatentes,
atualId
}:{
titulo:string;
combatentes:Combatente[];
atualId:string;
}){

return(
<div className="grupoCombatentes">
<h2>{titulo}</h2>
{combatentes.map((combatente)=>(
<article
key={combatente.id}
className={`cardCombatente ${combatente.id===atualId ? "ativo" : ""} ${!combatente.vivo ? "morto" : ""}`}
>
<Image
src={combatente.imagem}
alt={combatente.nome}
width={86}
height={86}
/>
<div className="dadosCombatente">
<div className="linhaNomeCombatente">
<h3>{combatente.nome}</h3>
<span>CA {combatente.armadura}</span>
</div>
<BarraStatus
classe="vida"
valor={combatente.vidaAtual}
maximo={combatente.vidaMaxima}
rotulo="Vida"
/>
<BarraStatus
classe="mana"
valor={combatente.manaAtual}
maximo={Math.max(1,combatente.manaMaxima)}
rotulo="Mana"
/>
<div className="metasCombatente">
<span>Crítico {combatente.critico}%</span>
<span>Esquiva {combatente.esquiva}%</span>
<span>Escudo {combatente.escudo}</span>
</div>
{combatente.efeitos.length>0 &&(
<div className="efeitosAtivosCombate">
{combatente.efeitos.map((efeito,index)=>(
<span key={`${efeito.tipo}-${index}`}>
{efeito.tipo} {efeito.valor}/{efeito.duracao}
</span>
))}
</div>
)}
</div>
</article>
))}
</div>
);

}

function BarraStatus({
classe,
valor,
maximo,
rotulo
}:{
classe:string;
valor:number;
maximo:number;
rotulo:string;
}){

const largura=Math.max(0,Math.min(100,(valor/maximo)*100));

return(
<div className="barraCombate">
<div className="barraTopo">
<span>{rotulo}</span>
<span>{Math.round(valor)} / {Math.round(maximo)}</span>
</div>
<div className="barraTrilho">
<div
className={`barraPreenchimento ${classe}`}
style={{width:`${largura}%`}}
/>
</div>
</div>
);

}

function LogCombate({
estado
}:{
estado:EstadoCombate;
}){

return(
<div className="logCombate">
<h2>Histórico de Combate</h2>
{estado.log.map((entrada)=>(
<div
key={entrada.id}
className={`entradaLog ${entrada.tipo}`}
>
<small>Turno {entrada.turno}</small>
<p>{entrada.texto}</p>
</div>
))}
</div>
);

}

function textoStatus(
status:EstadoCombate["status"]
){

switch(status){
case "vitoria":
return "Vitória";
case "derrota":
return "Derrota";
case "em_andamento":
return "Em andamento";
default:
return "Preparação";
}

}
