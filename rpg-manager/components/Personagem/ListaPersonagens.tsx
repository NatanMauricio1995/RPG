import personagens from "../../data/personagens.json";

export default function ListaPersonagens(){

return(

<div>

<h2>Personagens</h2>

{personagens.map((personagem)=>(

<div key={personagem.id}>

<h3>{personagem.nome}</h3>

<p>Classe: {personagem.classe}</p>

<p>Nível: {personagem.nivel}</p>

<p>
HP:
{personagem.vidaAtual}/
{personagem.vidaMaxima}
</p>

<hr/>

</div>

))}

</div>

);

}