import itens from "../../../data/sistema/itens.json";

export default function Inventario(){

return(

<div>

<h2>🎒 Inventário</h2>

<div className="inventarioGrid">

{itens.map((item:any)=>(

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

</div>

))}

</div>

</div>

);

}
