"use client";

import { useState } from "react";
import personagens from "../data/personagens.json";

export default function usePersonagem(
id:number
){

const personagemInicial=

personagens.find(
(item)=>
item.id===id
);

const [personagemAtual,
setPersonagemAtual]=

useState(
personagemInicial
);

return{

personagemAtual,

setPersonagemAtual

};

}