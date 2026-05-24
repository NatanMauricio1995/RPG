"use client";

import {EstadoCombate} from "../../services/combateService";

type Props={
estado:EstadoCombate;
};

export default function LogCombate({
estado
}:Props){

return(
<div className="logCombate">
<h2>Histórico de Combate</h2>
{estado.log.map((entrada)=>(
<div
key={entrada.id}
className={`entradaLog ${entrada.tipo}`}
>
<small>Turno {entrada.turno}</small>
<p>{entrada.texto}</p>
</div>
))}
</div>
);

}
