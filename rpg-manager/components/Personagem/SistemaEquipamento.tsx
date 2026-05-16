"use client";

import { useState } from "react";
import itensIniciais from "../../data/itens.json";

export default function SistemaEquipamento() {

const [inventario,setInventario]=useState(itensIniciais);

const [equipados,setEquipados]=useState({

arma:null,
armadura:null,
acessorio:null,
municao:null

} as Record<string,any>);


function equipar(item:any){

if(
item.tipo!=="arma" &&
item.tipo!=="armadura" &&
item.tipo!=="acessorio" &&
item.tipo!=="municao"
){
return;
}

const slot=item.tipo;

setEquipados((anterior)=>({

...anterior,
[slot]:item

}));

setInventario(
inventario.filter(
(i)=>i.id!==item.id
)
);

}


function desequipar(slot:string){

const item=equipados[slot];

if(!item)return;

setInventario((anterior)=>[
...anterior,
item
]);

setEquipados((anterior)=>({
...anterior,
[slot]:null
}));

}


function desequiparTudo(){

const itensVolta=Object.values(
equipados
).filter(Boolean);

setInventario((anterior)=>[
...anterior,
...itensVolta
]);

setEquipados({

arma:null,
armadura:null,
acessorio:null,
municao:null

});

}


return(

<div>

<h2>⚔️ Equipamentos</h2>

<button
onClick={desequiparTudo}
className="botaoAcao"
>

Remover tudo

</button>

<div className="inventarioGrid">

<div className="itemCard">

<h3>Mão principal</h3>

<p>
{equipados.arma?.nome || "Vazio"}
</p>

<button
onClick={()=>desequipar("arma")}
>
Desequipar
</button>

</div>


<div className="itemCard">

<h3>Armadura</h3>

<p>
{equipados.armadura?.nome || "Vazio"}
</p>

<button
onClick={()=>desequipar("armadura")}
>
Desequipar
</button>

</div>


<div className="itemCard">

<h3>Acessório</h3>

<p>
{equipados.acessorio?.nome || "Vazio"}
</p>

<button
onClick={()=>desequipar("acessorio")}
>
Desequipar
</button>

</div>


<div className="itemCard">

<h3>Munição</h3>

<p>
{equipados.municao?.nome || "Vazio"}
</p>

<button
onClick={()=>desequipar("municao")}
>
Desequipar
</button>

</div>

</div>


<h2>🎒 Inventário</h2>

<div className="inventarioGrid">

{inventario.map((item)=>(

<div
key={item.id}
className="itemCard"
>

<h3>

{item.nome}

</h3>

<p>

Tipo:
{item.tipo}

</p>

<p>

Quantidade:
{item.quantidade}

</p>

{(
item.tipo==="arma" ||
item.tipo==="armadura" ||
item.tipo==="acessorio" ||
item.tipo==="municao"
)&&(

<button
onClick={()=>equipar(item)}
>

Equipar

</button>

)}

</div>

))}

</div>

</div>

);

}