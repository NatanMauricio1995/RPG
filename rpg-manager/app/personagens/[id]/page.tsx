import personagens from "../../../data/personagens.json";
import Link from "next/link";

export default async function Ficha({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

const { id } = await params;

const personagem = personagens.find(
(item) => item.id === Number(id)
);

if (!personagem) {

return (

<div>

<Link href="/personagens">

<button className="botaoVoltar">

⬅️ Voltar

</button>

</Link>

<h1>❌ Personagem não encontrado</h1>

<p>ID recebido: {id}</p>

</div>

);

}

return (

<div>

<Link href="/personagens">

<button className="botaoVoltar">

⬅️ Voltar

</button>

</Link>

<h1>🧙 {personagem.nome}</h1>

<p>
Classe: {personagem.classe}
</p>

<p>
Nível: {personagem.nivel}
</p>

<p>
❤️ HP:
{personagem.vidaAtual}/
{personagem.vidaMaxima}
</p>

<h2>📊 Atributos</h2>

<p>
💪 Força: {personagem.atributos.forca}
</p>

<p>
🏃 Destreza: {personagem.atributos.destreza}
</p>

<p>
🛡️ Constituição: {personagem.atributos.constituicao}
</p>

<p>
🧠 Inteligência: {personagem.atributos.inteligencia}
</p>

<p>
✨ Sabedoria: {personagem.atributos.sabedoria}
</p>

<p>
🎭 Carisma: {personagem.atributos.carisma}
</p>

<h2>
💰 Ouro: {personagem.ouro}
</h2>

</div>

);

}