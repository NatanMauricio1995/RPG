"use client";

import useCalendario
from "../../hooks/useCalendario";

export default function Calendario(){

const{

dados,
mudarDia,
avancarDia,
carregado

}=useCalendario();

if(
!carregado
){

return null;

}

return(

<div>

<h1>

📅 Ano {dados.anoAtual}

</h1>


{

dados.meses.map(
(mes)=>(

<div
key={mes.id}
className="blocoMes"
>

<h2>

{mes.nome}

</h2>

<p>

🍃 {mes.estacao}

</p>


<div
className="gridCalendario"
>

{

dados.diasSemana.map(
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

Array.from(

{
length:30
},

(_,i)=>i+1

)

.map(
(dia)=>(

<div

key={dia}

className={

mes.id===dados.mesAtual
&&
dia===dados.diaAtual

?

"diaCalendario diaAtual"

:

"diaCalendario"

}

onClick={()=>{

mudarDia(
dia,
mes.id
)

}}

>

{dia}

</div>

)

)

}

</div>

</div>

)

)

}


<h2>

🎉 Dias Festivos

</h2>

{

dados.diasFestivos.map(
(item:string)=>(

<p
key={item}
>

{item}

</p>

)

)

}

</div>

);

}