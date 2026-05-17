"use client";

import {useState} from "react";

import armas from "../data/sistema/armas.json";
import armaduras from "../data/sistema/armaduras.json";
import acessorios from "../data/sistema/acessorios.json";
import consumiveis from "../data/sistema/consumiveis.json";


export default function useInventario(
personagemAtual:any
){

const bancoItens=[

...armas,
...armaduras,
...acessorios,
...consumiveis

];


if(!personagemAtual){

return{

inventario:[],
setInventario:()=>{},

equipados:{},
setEquipados:()=>{}

};

}


const inventarioInicial=

personagemAtual.inventario

.map(
(id:number)=>

bancoItens.find(
(item)=>

item.id===id
)

)

.filter(
Boolean
);


const equipadosInicial={

cabeca:

bancoItens.find(
(item)=>

item.id===
personagemAtual
?.equipados
?.cabeca
)

||null,


arma:

bancoItens.find(
(item)=>

item.id===
personagemAtual
?.equipados
?.arma
)

||null,


escudo:

bancoItens.find(
(item)=>

item.id===
personagemAtual
?.equipados
?.escudo
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


cintura:

bancoItens.find(
(item)=>

item.id===
personagemAtual
?.equipados
?.cintura
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


bolsa:

bancoItens.find(
(item)=>

item.id===
personagemAtual
?.equipados
?.bolsa
)

||null

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