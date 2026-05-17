"use client";

import {useState}
from "react";

import calendario
from "../data/calendario.json";

export default function useCalendario(){

const[

dados,
setDados

]=useState(
calendario
);


function avancarDia(){

let{

diaAtual,
mesAtual,
anoAtual,

diaFestivoAtual,
emPeriodoFestivo

}=dados;


if(emPeriodoFestivo){

diaFestivoAtual++;


if(

diaFestivoAtual>

dados.diasFestivos.length

){

diaFestivoAtual=0;

emPeriodoFestivo=false;

diaAtual=1;

mesAtual=1;

anoAtual++;

}

}else{

diaAtual++;

if(diaAtual>30){

diaAtual=1;

mesAtual++;

}


if(mesAtual>12){

mesAtual=12;

diaAtual=30;

emPeriodoFestivo=true;

diaFestivoAtual=1;

}

}


setDados({

...dados,

diaAtual,

mesAtual,

anoAtual,

diaFestivoAtual,

emPeriodoFestivo

});

}

function mudarDia(
novoDia:number
){

setDados({

...dados,

diaAtual:novoDia,

emPeriodoFestivo:false

});

}

return{

dados,

avancarDia,

mudarDia

};

}