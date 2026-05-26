"use client";

import {useMemo,useState} from "react";
import {listarPersonagens} from "../../services/personagemService";
import Image from "next/image";

import {
EstadoCombate,
alterarQuantidadeMonstro,
combatenteEstaControlado,
executarAtaqueBasico,
executarHabilidade,
iniciarCombate,
listarMonstrosCombate,
passarTurno,
removerCombatente
} from "../../services/combateService";

import PainelSelecaoCombate from "../../components/Combate/PainelSelecaoCombate";
import GrupoCombatentes from "../../components/Combate/GrupoCombatentes";
import LogCombate from "../../components/Combate/LogCombate";
import ModalResultadoCombate from "../../components/Combate/ModalResultadoCombate";
import { salvarHistoricoCombate } from "../../services/combateService";


type EntidadeSelecionavel={

id:number|string;
quantidade?:number;

};


export default function CombatePage(){

const personagens=useMemo(
()=>listarPersonagens(),
[]
);

const monstros=useMemo(
()=>listarMonstrosCombate(),
[]
);

const[
personagensSelecionados,
setPersonagensSelecionados
]=useState<number[]>([]);

const[
monstrosSelecionados,
setMonstrosSelecionados
]=useState<number[]>([]);

const[
quantidadesMonstros,
setQuantidadesMonstros
]=useState<Record<number,number>>({});

const[
estado,
setEstado
]=useState<EstadoCombate|null>(null);

const[
atacanteSelecionado,
setAtacanteSelecionado
]=useState("");

const[
alvoSelecionado,
setAlvoSelecionado
]=useState("");

const [mostrarModalResultado, setMostrarModalResultado] = useState(false);


const combatenteAtual=

estado?.combatentes.find(
(c)=>
c.id===atacanteSelecionado
)

||

null;


const alvosDisponiveis=

estado && combatenteAtual

?

estado.combatentes.filter(
(c)=>

c.lado!==combatenteAtual.lado

&&

c.vivo
)

:

[];

{

const alvosDisponiveis=

estado

?

estado.combatentes.filter(
(c)=>

c.id!==atacanteSelecionado

&&

c.vivo
)

:

[];

}

function alternarSelecao(
id:number,
lista:number[],
setLista:(valor:number[])=>void
){

setLista(

lista.includes(id)

?

lista.filter(
(item)=>item!==id
)

:

[
...lista,
id
]

);

}


function alterarQuantidadePreparacao(
id:number,
delta:number
){

setQuantidadesMonstros(
(anteriores)=>({

...anteriores,

[id]:

Math.max(
1,
(anteriores[id]||1)+delta
)

})
);

}


function comecarCombate(){

const aliados=

(personagens as EntidadeSelecionavel[])

.filter(
(personagem)=>

personagensSelecionados.includes(
Number(personagem.id)
)
);


const inimigos=

monstros

.filter(
(monstro:any)=>

monstrosSelecionados.includes(
Number(monstro.id)
)
)

.map(
(monstro:any)=>({

...monstro,

quantidade:

quantidadesMonstros[
Number(monstro.id)
]

||

1

})
);


if(
aliados.length===0 ||
inimigos.length===0
)
return;


const novoEstado=

iniciarCombate(
aliados,
inimigos
);


setEstado(
novoEstado
);


const primeiro=

novoEstado.combatentes.find(
(c)=>c.vivo
);

setAtacanteSelecionado(
primeiro?.id || ""
);


const alvo=

novoEstado.combatentes.find(
(c)=>

c.lado!==primeiro?.lado

&&

c.vivo
);

setAlvoSelecionado(
alvo?.id || ""
);

}


function atualizarEstado(novoEstado: EstadoCombate) {
  setEstado(novoEstado);
  if (novoEstado.status !== "em_andamento") {
    setMostrarModalResultado(true);
    salvarHistoricoCombate({
      status: novoEstado.status,
      turno: novoEstado.turno,
      participantes: novoEstado.combatentes.map((c) => ({ nome: c.nome, lado: c.lado })),
    });
  }
}

const handleFecharModal = () => {
  setMostrarModalResultado(false);
  setEstado(null);
};


function acaoAtaque(){

if(
!estado ||
!combatenteAtual ||
!alvoSelecionado
)
return;


atualizarEstado(

executarAtaqueBasico(

estado,
combatenteAtual.id,
alvoSelecionado

)

);

}


function acaoHabilidade(
habilidadeId:string
){

if(
!estado ||
!combatenteAtual ||
!alvoSelecionado
)
return;


atualizarEstado(

executarHabilidade(

estado,
combatenteAtual.id,
alvoSelecionado,
habilidadeId

)

);

}


function acaoFugir(
combatenteId:string
){

if(
!estado
)
return;


atualizarEstado(

removerCombatente(
estado,
combatenteId
)

);

}


return(

<div className="paginaCombate">

<div className="topoCombate">

<div>

<h1>

Sistema de Combate

</h1>

<p>

Batalhas controladas manualmente pelo mestre

</p>

</div>


<button
className="botaoNovo"
onClick={comecarCombate}
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

alternarSelecao(
id,
personagensSelecionados,
setPersonagensSelecionados
)

}
/>


<PainelSelecaoCombate
titulo="Inimigos"
itens={monstros}
selecionados={monstrosSelecionados}
quantidades={quantidadesMonstros}
onAlternar={(id)=>

alternarSelecao(
id,
monstrosSelecionados,
setMonstrosSelecionados
)

}
onAlterarQuantidade={alterarQuantidadePreparacao}
/>

</section>


{

estado && (

<section className="mesaCombate">

<div className="listaParticipantesCombate">

{

estado.combatentes.map(
(combatente)=>(

<button
key={combatente.id}

className={`
participanteBotao
${combatente.id===atacanteSelecionado ? "turnoAtual" : ""}
${!combatente.vivo ? "abatido" : ""}
`}

onClick={()=>

setAtacanteSelecionado(
combatente.id
)

}

disabled={!combatente.vivo}
>

<Image
src={
combatente.imagem ||
"/imagens/personagens/padrao.png"
}
alt={combatente.nome}
width={60}
height={60}
className="imagemParticipante"
/>

<div className="dadosParticipante">

<strong>

{combatente.nome}

</strong>

<small>

Nível {combatente.nivel || 1}

</small>


<div className="barraContainer">

<div
className="barraVida"
style={{

width:`${
(combatente.vidaAtual/
combatente.vidaMaxima)*100
}%`

}}
/>

<span>

❤️
{combatente.vidaAtual}/
{combatente.vidaMaxima}

</span>

</div>


<div className="barraContainer">

<div
className="barraMana"
style={{

width:`${
(combatente.manaAtual/
Math.max(
1,
combatente.manaMaxima
))*100
}%`

}}
/>

<span>

🔷
{combatente.manaAtual}/
{combatente.manaMaxima}

</span>

</div>


{

combatente.efeitosAtivos?.length>0 &&(

<div className="statusCombatente">

{

combatente.efeitosAtivos.map(
(status:any)=>(

<span
key={status.id}
>

{status.nome}

</span>

)

)

}

</div>

)

}

</div>

</button>

)

)

}

</div>


<label>

Alvo

<select
value={alvoSelecionado}
onChange={(e)=>

setAlvoSelecionado(
e.target.value
)

}
>



</select>

</label>


<div className="acoesDisponiveis">

<button
onClick={acaoAtaque}
>

⚔ Ataque

</button>


{

combatenteAtual?.habilidades.map(
(habilidade)=>(

<button
key={habilidade.id}
onClick={()=>

acaoHabilidade(
habilidade.id
)

}
>

{habilidade.nome}

</button>

)

)

}


<button
onClick={()=>

combatenteAtual &&

acaoFugir(
combatenteAtual.id
)

}
>

🏃 Fugir

</button>

</div>

      <LogCombate estado={estado} />

      {mostrarModalResultado && estado && (
        <ModalResultadoCombate estado={estado} onClose={handleFecharModal} />
      )}
    </section>
  )
}

</div>

);

}