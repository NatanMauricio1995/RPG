"use client";

import{useInventario}
from "../../../contexts/InventarioContext";

import CorpoEquipamento
from "./CorpoEquipamento";

import Image
from "next/image";

import Link
from "next/link";


export default function SistemaEquipamento(){

const{

inventario,
setInventario,

equipados,
setEquipados

}=useInventario();{


function equipar(
item:any
){

let slot="";


switch(
item.subtipo
){

case "Arma":

slot="arma";

break;


case "Armadura":

slot="armadura";

break;


case "Acessório":

slot="acessorio";

break;


case "Munição":

slot="municao";

break;


default:

return;

}


if(
equipados[slot]
){

setInventario(
(anterior:any)=>[

...anterior,

equipados[
slot
]

]

);

}


setEquipados(
(anterior:any)=>({

...anterior,

[slot]:
item

})

);


setInventario(
(anterior:any)=>

anterior.filter(
(i:any)=>

i.id!==item.id

)

);

}



function desequipar(
slot:string
){

const item=

equipados[
slot
];

if(
!item
)
return;


setInventario(
(anterior:any)=>[

...anterior,

item

]

);


setEquipados(
(anterior:any)=>({

...anterior,

[slot]:
null

})

);

}



function desequiparTudo(){

const itens=

Object.values(
equipados
)

.filter(
Boolean
);


setInventario(
(anterior:any)=>[

...anterior,

...itens

]

);


setEquipados({

arma:null,

armadura:null,

acessorio:null,

municao:null

});

}

}

return(

<div>

<h2>

⚔️ Equipamentos

</h2>


<button

className="botaoAcao"

onClick={
desequiparTudo
}

>

Desequipar tudo

</button>


<CorpoEquipamento

equipados={equipados}

setEquipados={setEquipados}

inventario={inventario}

setInventario={setInventario}

/>


<h2>

🎒 Inventário

</h2>


<div
className="inventarioGrid"
>

{

inventario.map(
(item:any)=>(

<div

key={item.id}

className="itemCard"

draggable

onDragStart={(evento)=>

evento
.dataTransfer
.setData(
"id",
item.id
)

}

>
<Image

src={
item.imagem ||
"/imagens/itens/padrao.png"
}

alt={
item.nome
}

width={120}

height={120}

className="imagemItemInventario"

/>


<h3>

{item.nome}

</h3>


<p>

📦
{item.subtipo}

</p>


<Link
href={`/itens/${item.id}`}
>

<button>

📖 Abrir

</button>

</Link>


{

item.tipo==="Equipamento"

&& (

<button

onClick={()=>

equipar(
item
)

}

>

Equipar

</button>

)

}

</div>

)

)

}

</div>

</div>

);

}