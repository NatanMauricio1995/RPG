import Link from "next/link";
import personagens from "../../data/personagens.json";

export default function ListaPersonagens(){

return(

<div>

<h1>Personagens</h1>

{personagens.map((personagem)=>(

<div
key={personagem.id}
className="card"
>

<h3>{personagem.nome}</h3>

<p>
Classe: {personagem.classe}
</p>

<p>
Nível: {personagem.nivel}
</p>

<p>

HP:
{personagem.vidaAtual}/
{personagem.vidaMaxima}

</p>

<Link href={`/personagens/${personagem.id}`}>

<button>

Abrir ficha

</button>

</Link>

<hr/>

</div>

))}

</div>

);

}