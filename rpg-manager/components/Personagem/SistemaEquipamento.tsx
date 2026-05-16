"use client";

type Props = {
  inventario:any[];
  setInventario:any;
  equipados:any;
  setEquipados:any;
};

export default function SistemaEquipamento({
  inventario,
  setInventario,
  equipados,
  setEquipados
}:Props){

function equipar(item:any){

const slot=item.tipo;

if(
slot!=="arma" &&
slot!=="armadura" &&
slot!=="acessorio" &&
slot!=="municao"
){
return;
}

if(equipados[slot]){

setInventario((anterior:any)=>[
...anterior,
equipados[slot]
]);

}

setEquipados((anterior:any)=>({

...anterior,
[slot]:item

}));

setInventario((anterior:any)=>
anterior.filter(
(i:any)=>i.id!==item.id
)
);

}


function desequipar(slot:string){

const item=equipados[slot];

if(!item)return;

setInventario((anterior:any)=>[
...anterior,
item
]);

setEquipados((anterior:any)=>({

...anterior,
[slot]:null

}));

}


function desequiparTudo(){

const itens=Object.values(
equipados
).filter(Boolean);

setInventario((anterior:any)=>[
...anterior,
...itens
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
className="botaoAcao"
onClick={desequiparTudo}
>

Desequipar tudo

</button>

<div className="inventarioGrid">

<div className="itemCard">

<h3>⚔️ Mão principal</h3>

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

<h3>🛡️ Armadura</h3>

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

<h3>💍 Acessório</h3>

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

<h3>🏹 Munição</h3>

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

{inventario.map((item:any)=>(

<div
key={item.id}
className="itemCard"
>

<h3>

{item.nome}

</h3>

<p>

Tipo: {item.tipo}

</p>

<p>

Quantidade: {item.quantidade}

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