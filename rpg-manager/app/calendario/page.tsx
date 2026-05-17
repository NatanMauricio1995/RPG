"use client";

import useCalendario
from "../../hooks/useCalendario";

export default function Calendario(){

const{

dados,
avancarDia,
mudarDia

}=useCalendario();


const mes=

dados.meses.find(
(m)=>

m.id===
dados.mesAtual
);


const diasSemana=[

"Dom",
"Seg",
"Ter",
"Qua",
"Qui",
"Sex",
"Sab"

];


const diasMes=

Array.from(

{

length:
30

},

(_,i)=>i+1

);


return(

<div
className="paginaCalendario"
>

<h1>

📅 Calendário

</h1>


<h2>

{mes?.nome}

</h2>

<p>

Ano:
{dados.anoAtual}

</p>


<div
className="gridCalendario"
>

{

diasSemana.map(
(dia)=>(

<div

key={dia}

className="cabecalhoCalendario"

>

{dia}

</div>

)

)

}


{

diasMes.map(
(dia)=>(

<div

key={dia}

className={

dia===dados.diaAtual

?

"diaCalendario diaAtual"

:

"diaCalendario"

}

onClick={()=>

mudarDia(
dia
)

}

>

{dia}

</div>

)

)

}

</div>


<button

className="botaoAcao"

onClick={
avancarDia
}

>

➡️ Próximo dia

</button>

</div>

);

}