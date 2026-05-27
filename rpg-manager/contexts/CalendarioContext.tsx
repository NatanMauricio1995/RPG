"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";
import { buscarCalendario, salvarCalendario } from "../services/calendarioService";

const CalendarioContext = createContext<any>(null);

export function CalendarioProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [dados, setDados] = useState<any>(null);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    async function carregar() {
      // Tentar Firebase primeiro
      const firebaseDados = await buscarCalendario();
      if (firebaseDados) {
        setDados(firebaseDados);
        setCarregado(true);
        return;
      }

      // Fallback cache local
      const salvo = localStorage.getItem("calendarioRPG");
      if (salvo) {
        setDados(JSON.parse(salvo));
      } else {
        // Se nada existir, inicializa vazio mas sem import JSON
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
      setCarregado(true);
    }
    carregar();
  }, []);

  useEffect(() => {
    if (carregado && dados) {
      localStorage.setItem("calendarioRPG", JSON.stringify(dados));
      // Opcional: Salvar no Firebase automaticamente em cada mudança
      // salvarCalendario(dados);
    }
  }, [dados, carregado]);


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


return(

<CalendarioContext.Provider

value={{

dados,

carregado,

avancarDia,

mudarDia

}}

>

{children}

</CalendarioContext.Provider>

);

}


export function useCalendario(){

return useContext(
CalendarioContext
);

}