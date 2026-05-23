"use client";
import {useEffect,useState} from "react";
import {
buscarPersonagem,
completarPersonagem
} from "../services/personagemService";

export default function usePersonagem(
id:number
){

const[

personagemAtual,
setPersonagemAtual

]=useState<any>(()=>{

const personagemBase=
buscarPersonagem(
id
);

return personagemBase
? completarPersonagem(personagemBase)
: null;

});


useEffect(()=>{

const personagemAtualizado=
buscarPersonagem(
id
);

setPersonagemAtual(
personagemAtualizado
? completarPersonagem(personagemAtualizado)
: null
);

},[
id
]);


return{

personagemAtual,

setPersonagemAtual

};

}
