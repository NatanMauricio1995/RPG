"use client";

type Props={

personagemAtual:any;

setSubindoNivel:any;

}

export default function InformacoesBasicas({

personagemAtual,

setSubindoNivel

}:Props){

return(

<div className="informacoesBasicas">

<div className="infoCard">

🧬 Raça

<p>

{personagemAtual.raca}

</p>

</div>


<div className="infoCard">

🎭 Classe

<p>

{personagemAtual.classe}

</p>

</div>


<div className="infoCard">

⭐ Nível

<p>

{personagemAtual.nivel}

</p>

<button
onClick={()=>
setSubindoNivel(true)
}
>

⬆️ Subir nível

</button>

</div>


<div className="infoCard">

❤️ Vida

<p>

{personagemAtual.vidaAtual}/
{personagemAtual.vidaMaxima}

</p>

</div>


<div className="infoCard">

💰 Ouro

<p>

{personagemAtual.ouro}

</p>

</div>

</div>

);

}