"use client";

type Props={
classe:string;
valor:number;
maximo:number;
rotulo:string;
};

export default function BarraStatusCombate({
classe,
valor,
maximo,
rotulo
}:Props){

const largura=Math.max(0,Math.min(100,(valor/maximo)*100));

return(
<div className="barraCombate">
<div className="barraTopo">
<span>{rotulo}</span>
<span>{Math.round(valor)} / {Math.round(maximo)}</span>
</div>
<div className="barraTrilho">
<div
className={`barraPreenchimento ${classe}`}
style={{"--progresso": `${largura}%`} as React.CSSProperties}
/>
</div>
</div>
);

}
