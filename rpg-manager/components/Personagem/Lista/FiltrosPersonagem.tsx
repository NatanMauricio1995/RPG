"use client";

type Props={

pesquisa:string;

setPesquisa:any;

classe:string;

setClasse:any;

raca:string;

setRaca:any;

}

export default function FiltrosPersonagem({

pesquisa,
setPesquisa,

classe,
setClasse,

raca,
setRaca

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


<input

placeholder="🎭 Classe"

value={classe}

onChange={(e)=>

setClasse(
e.target.value
)

}

/>


<input

placeholder="🧬 Raça"

value={raca}

onChange={(e)=>

setRaca(
e.target.value
)

}

/>

</div>

);

}