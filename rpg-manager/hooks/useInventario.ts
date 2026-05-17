"use client";

import {useState}
from "react";

import armas
from "../data/armas.json";

import armaduras
from "../data/armaduras.json";

import acessorios
from "../data/acessorios.json";

import consumiveis
from "../data/consumiveis.json";


export default function useInventario(
personagemAtual:any
){

const bancoItens=[

...armas,
...armaduras,
...acessorios,
...consumiveis

];


const inventarioInicial=

personagemAtual?.inventario
?.map(
(id:number)=>

bancoItens.find(
(item)=>

item.id===id
)

)

.filter(
Boolean
)

||[];


const equipadosInicial={

arma:

bancoItens.find(
(item)=>

item.id===
personagemAtual
?.equipados
?.arma
)

||null,


armadura:

bancoItens.find(
(item)=>

item.id===
personagemAtual
?.equipados
?.armadura
)

||null,


acessorio:

bancoItens.find(
(item)=>

item.id===
personagemAtual
?.equipados
?.acessorio
)

||null,

municao:null

};


const[
inventario,
setInventario
]=useState(
inventarioInicial
);


const[
equipados,
setEquipados
]=useState(
equipadosInicial
);


return{

inventario,
setInventario,

equipados,
setEquipados

};

}