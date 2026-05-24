"use client";

import {useMemo,useState} from "react";
import {listarPersonagens} from "../../services/personagemService";
import {
EstadoCombate,
alterarQuantidadeMonstro,
combatenteEstaControlado,
executarAtaqueBasico,
executarHabilidade,
iniciarCombate,
listarMonstrosCombate,
passarTurno,
removerCombatente,
selecionarCombatenteAtivo
} from "../../services/combateService";
import PainelSelecaoCombate from "../../components/Combate/PainelSelecaoCombate";
import GrupoCombatentes from "../../components/Combate/GrupoCombatentes";
import LogCombate from "../../components/Combate/LogCombate";

type EntidadeSelecionavel={
id:number | string;
quantidade?:number;
};

export default function CombatePage(){

const personagens=useMemo(()=>listarPersonagens(),[]);
const monstros=useMemo(()=>listarMonstrosCombate(),[]);

const[personagensSelecionados,setPersonagensSelecionados]=useState<number[]>([]);
const[monstrosSelecionados,setMonstrosSelecionados]=useState<number[]>([]);
const[quantidadesMonstros,setQuantidadesMonstros]=useState<Record<number,number>>({});
const[estado,setEstado]=useState<EstadoCombate | null>(null);
const[alvoSelecionado,setAlvoSelecionado]=useState("");

const combatenteAtual=estado?.combatentes.find((combatente)=>combatente.id===estado.combatenteAtivoId) || null;

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

function alterarQuantidadePreparacao(
id:number,
delta:number
){

setQuantidadesMonstros((anteriores)=>({
...anteriores,
[id]:Math.max(1,(anteriores[id] || 1)+delta)
}));

}

function comecarCombate(){

const aliados=(personagens as EntidadeSelecionavel[]).filter((personagem)=>personagensSelecionados.includes(Number(personagem.id)));
const inimigos=monstros
.filter((monstro:EntidadeSelecionavel)=>monstrosSelecionados.includes(Number(monstro.id)))
.map((monstro:EntidadeSelecionavel)=>({
...monstro,
quantidade:quantidadesMonstros[Number(monstro.id)] || 1
}));

if(aliados.length===0 || inimigos.length===0)
return;

const novoEstado=iniciarCombate(aliados,inimigos);
setEstado(novoEstado);
setAlvoSelecionado("");

}

function atualizarEstado(
novoEstado:EstadoCombate
){

setEstado(novoEstado);

const atual=novoEstado.combatentes.find((combatente)=>combatente.id===novoEstado.combatenteAtivoId);
const alvoAtual=novoEstado.combatentes.find((combatente)=>combatente.id===alvoSelecionado);

if(!atual || !alvoAtual?.vivo || alvoAtual.lado===atual.lado){
const novoAlvo=atual
? novoEstado.combatentes.find((combatente)=>combatente.lado!==atual.lado && combatente.vivo)
: null;
setAlvoSelecionado(novoAlvo?.id || "");
}

}

function selecionarAtor(
combatenteId:string
){

if(!estado)
return;

const novoEstado=selecionarCombatenteAtivo(estado,combatenteId);
const atual=novoEstado.combatentes.find((combatente)=>combatente.id===combatenteId);
const primeiroAlvo=novoEstado.combatentes.find((combatente)=>combatente.lado!==atual?.lado && combatente.vivo);

setEstado(novoEstado);
setAlvoSelecionado(primeiroAlvo?.id || "");

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

function acaoFugir(
combatenteId:string
){

if(!estado)
return;

const combatente=estado.combatentes.find((item)=>item.id===combatenteId);

if(!combatente)
return;

if(!window.confirm(`Remover ${combatente.nome} do combate atual?`))
return;

atualizarEstado(removerCombatente(estado,combatenteId));

}

function alterarQuantidadeEmCombate(
combatenteId:string,
delta:number
){

if(!estado)
return;

atualizarEstado(alterarQuantidadeMonstro(estado,combatenteId,delta));

}

return(

<div className="paginaCombate">

<div className="topoCombate">
<div>
<h1>Sistema de Combate</h1>
<p>Batalhas controladas manualmente pelo mestre, com dano, defesa, efeitos, habilidades e histórico completo.</p>
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
<PainelSelecaoCombate
titulo="Aliados"
itens={personagens}
selecionados={personagensSelecionados}
onAlternar={(id)=>
alternarSelecao(id,personagensSelecionados,setPersonagensSelecionados)
}
/>

<PainelSelecaoCombate
titulo="Inimigos"
itens={monstros}
selecionados={monstrosSelecionados}
quantidades={quantidadesMonstros}
onAlternar={(id)=>
alternarSelecao(id,monstrosSelecionados,setMonstrosSelecionados)
}
onAlterarQuantidade={alterarQuantidadePreparacao}
/>
</section>

{estado &&(
<section className="mesaCombate">
<div className="estadoCombate">
<div className={`placarCombate ${estado.status}`}>
<span>Ações {Math.max(0,estado.turno-1)}</span>
<strong>{textoStatus(estado.status)}</strong>
</div>

<div className="listaParticipantesCombate">
{estado.combatentes.map((combatente)=>(
<button
key={combatente.id}
className={`${combatente.id===estado.combatenteAtivoId ? "turnoAtual" : ""} ${!combatente.vivo ? "abatido" : ""}`}
onClick={()=>selecionarAtor(combatente.id)}
disabled={!combatente.vivo || estado.status!=="em_andamento"}
>
{combatente.nome}
</button>
))}
</div>
</div>

<div className="gridCombatentes">
<GrupoCombatentes
titulo="Grupo"
combatentes={estado.combatentes.filter((combatente)=>combatente.lado==="aliado")}
atualId={estado.combatenteAtivoId}
onFugir={acaoFugir}
/>
<GrupoCombatentes
titulo="Ameaças"
combatentes={estado.combatentes.filter((combatente)=>combatente.lado==="inimigo")}
atualId={estado.combatenteAtivoId}
onFugir={acaoFugir}
onAlterarQuantidade={alterarQuantidadeEmCombate}
/>
</div>

{estado.status==="em_andamento" &&(
<div className="painelAcoesCombate">
{combatenteAtual ? (
<>
<div>
<small>Participante selecionado</small>
<h2>{combatenteAtual.nome}</h2>
<p>O sistema aguardará uma nova seleção do mestre após a ação.</p>
{combatenteEstaControlado(combatenteAtual) &&(
<p className="alertaControleCombate">Efeito de controle ativo. A ação pode ser anulada pelo combate.</p>
)}
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
<button onClick={()=>acaoFugir(combatenteAtual.id)}>Fugir</button>
</div>
) : (
<div className="acoesDisponiveis">
<button onClick={acaoInimiga}>Executar Ação do Inimigo</button>
<button onClick={()=>acaoFugir(combatenteAtual.id)}>Fugir</button>
</div>
)}
</>
) : (
<div className="avisoSelecaoCombate">
<small>Aguardando o mestre</small>
<h2>Selecione quem vai agir</h2>
<p>Escolha um participante na lista acima para liberar as ações.</p>
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
