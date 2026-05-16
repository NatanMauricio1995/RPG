"use client";

import { useState } from "react";

export default function useNivel(
personagemAtual:any,
setPersonagemAtual:any
){

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

return{

subindoNivel,
setSubindoNivel,

pontosRestantes,

atributosTemp,

adicionarPonto,
removerPonto,

confirmarNivel

};

}