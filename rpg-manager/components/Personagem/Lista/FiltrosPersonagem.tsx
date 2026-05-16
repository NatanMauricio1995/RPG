"use client";

type Props={

pesquisa:string;
setPesquisa:any;

classe:string;
setClasse:any;

raca:string;
setRaca:any;

classes:string[];
racas:string[];

}

export default function FiltrosPersonagem({

pesquisa,
setPesquisa,

classe,
setClasse,

raca,
setRaca,

classes,
racas

}:Props){

return(

<div className="filtrosPersonagem">

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

value={classe}

onChange={(e)=>

setClasse(
e.target.value
)

}

>

<option value="">

🎭 Todas classes

</option>

{

classes.map(
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



<select

value={raca}

onChange={(e)=>

setRaca(
e.target.value
)

}

>

<option value="">

🧬 Todas raças

</option>

{

racas.map(
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


<button
className="novoPersonagem"
>

➕ Novo Personagem

</button>

</div>

);

}