"use client";

import Image from "next/image";

type Props={

equipados:any;

setEquipados:any;

inventario:any[];

setInventario:any;

};

export default function CorpoEquipamento({

equipados,
setEquipados,

inventario,
setInventario

}:Props){


function permitirDrop(
evento:any
){

evento.preventDefault();

}


function soltarItem(

evento:any,
slot:string

){

evento.preventDefault();

const itemId=

evento.dataTransfer.getData(
"id"
);


const item=

inventario.find(
(i:any)=>

i.id===
Number(itemId)
);

if(!item)
return;


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


const slots=[

{
nome:"cabeca",
classe:"slotCabeca"
},

{
nome:"arma",
classe:"slotArma"
},

{
nome:"escudo",
classe:"slotEscudo"
},

{
nome:"armadura",
classe:"slotArmadura"
},

{
nome:"cintura",
classe:"slotCintura"
},

{
nome:"acessorio",
classe:"slotAcessorio"
},

{
nome:"bolsa",
classe:"slotBolsa"
}

];


return(

<div className="containerCorpo">

<Image

src="/imagens/interface/corpo.png"

alt="Corpo"

width={850}

height={850}

className="imagemCorpo"

/>


{

slots.map(
(slot)=>(

<div

key={slot.nome}

className={
`slotEquipamento ${slot.classe}`
}

onDragOver={
permitirDrop
}

onDrop={(evento)=>

soltarItem(
evento,
slot.nome
)

}

>

{

equipados[
slot.nome
]

?

<Image

src={
equipados[
slot.nome
].imagem
}

alt=""

width={90}

height={90}

className="imagemSlot"

/>

:

<div
className="slotVazio"
>

+

</div>

}

</div>

)

)

}

</div>

);

}