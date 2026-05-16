import SistemaEquipamento from "../../../components/Personagem/SistemaEquipamento";
import Equipamentos from "../../../components/Personagem/Equipamentos";
import personagens from "../../../data/personagens.json";
import Inventario from "../../../components/Personagem/Inventario";
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

<div className="ficha">

<div className="cabecalhoFicha">

<h1>
🧙 {personagem.nome}
</h1>

<div className="informacoesBasicas">

<div className="infoCard">
🎭 Classe
<p>{personagem.classe}</p>
</div>

<div className="infoCard">
⭐ Nível
<p>{personagem.nivel}</p>
</div>

<div className="infoCard">
❤️ Vida
<p>
{personagem.vidaAtual}/{personagem.vidaMaxima}
</p>
</div>

<div className="infoCard">
💰 Ouro
<p>{personagem.ouro}</p>
</div>

</div>

</div>


<h2>📊 Atributos</h2>

<div className="atributosGrid">

<div className="atributoCard">
💪
<h3>Força</h3>
<p>{personagem.atributos.forca}</p>
</div>

<div className="atributoCard">
🏃
<h3>Destreza</h3>
<p>{personagem.atributos.destreza}</p>
</div>

<div className="atributoCard">
🛡️
<h3>Constituição</h3>
<p>{personagem.atributos.constituicao}</p>
</div>

<div className="atributoCard">
🧠
<h3>Inteligência</h3>
<p>{personagem.atributos.inteligencia}</p>
</div>

<div className="atributoCard">
✨
<h3>Sabedoria</h3>
<p>{personagem.atributos.sabedoria}</p>
</div>

<div className="atributoCard">
🎭
<h3>Carisma</h3>
<p>{personagem.atributos.carisma}</p>
</div>

</div>
<SistemaEquipamento/>
</div>

</div>

);

}