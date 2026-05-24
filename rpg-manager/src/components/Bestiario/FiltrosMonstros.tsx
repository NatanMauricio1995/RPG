"use client";

type Props={

pesquisa:string;
setPesquisa:any;

tipo:string;
setTipo:any;

tipos:string[];

}

export default function FiltrosMonstros({

pesquisa,
setPesquisa,

tipo,
setTipo,

tipos

}:Props){

return(

<div className="filtrosMonstros">

<input

placeholder="🔎 Pesquisar"

value={pesquisa}

onChange={(e)=>

setPesquisa(
e.target.value
)

}

/>

<select

value={tipo}

onChange={(e)=>

setTipo(
e.target.value
)

}

>

<option value="">

🏷️ Todos tipos

</option>

{

tipos.map(
(item)=>(

<option
key={item}
>

{item}

</option>

)

)

}

</select>

</div>

);

}