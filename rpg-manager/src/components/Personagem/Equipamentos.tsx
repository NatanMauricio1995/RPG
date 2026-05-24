export default function Equipamentos(){

const equipamentos={

arma:"⚔️ Espada Longa",
armadura:"🛡️ Armadura de Couro",
acessorio:"💍 Anel de Mana",
municao:"🏹 Flechas (20)"

};

return(

<div>

<h2>⚔️ Equipamentos</h2>

<div className="inventarioGrid">

<div className="itemCard">

<h3>Mão principal</h3>

<p>
{equipamentos.arma}
</p>

</div>


<div className="itemCard">

<h3>Armadura</h3>

<p>
{equipamentos.armadura}
</p>

</div>


<div className="itemCard">

<h3>Acessório</h3>

<p>
{equipamentos.acessorio}
</p>

</div>


<div className="itemCard">

<h3>Munição</h3>

<p>
{equipamentos.municao}
</p>

</div>

</div>

</div>

);

}