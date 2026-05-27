"use client";

import {
  useEffect,
  useState
} from "react";
import { buscarCalendario } from "../services/calendarioService";

export default function useCalendario() {
  const [dados, setDados] = useState<any>(null);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    async function carregar() {
      const firebaseDados = await buscarCalendario();
      if (firebaseDados) {
        setDados(firebaseDados);
      } else {
        const salvo = localStorage.getItem("calendarioRPG");
        if (salvo) {
          setDados(JSON.parse(salvo));
        } else {
          setDados({
            anoAtual: 1,
            mesAtual: 1,
            diaAtual: 1,
            meses: [],
            diasSemana: [],
            fasesLua: [],
            climas: [],
            diasFestivos: []
          });
        }
      }
      setCarregado(true);
    }
    carregar();
  }, []);


useEffect(()=>{

if(carregado){

localStorage.setItem(

"calendarioRPG",

JSON.stringify(
dados
)

);

}

},[
dados,
carregado
]);


function avancarDia(){

let novoDia=
dados.diaAtual+1;

let novoMes=
dados.mesAtual;

let novoAno=
dados.anoAtual;


if(
novoDia>30
){

novoDia=1;

novoMes++;

}


if(
novoMes>12
){

novoMes=1;

novoAno++;

}


setDados({

...dados,

diaAtual:
novoDia,

mesAtual:
novoMes,

anoAtual:
novoAno

});

}


function mudarDia(
novoDia:number,
novoMes?:number
){

setDados({

...dados,

diaAtual:
novoDia,

mesAtual:
novoMes||
dados.mesAtual

});

}


return{

dados,

avancarDia,

mudarDia,

carregado

};

}