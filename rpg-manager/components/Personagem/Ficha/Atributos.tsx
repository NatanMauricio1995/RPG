"use client";

export default function Atributos({
  personagemAtual,
}: {
  personagemAtual: any;
}) {
  const nomes = {
    forca: "💪 Força",
    destreza: "🏃 Destreza",
    constituicao: "🛡️ Constituição",
    inteligencia: "🧠 Inteligência",
    sabedoria: "✨ Sabedoria",
    carisma: "🎭 Carisma",
  } as Record<string, string>;

  // O personagemAtual já vem com os atributos finais via completarPersonagem()
  const atributos = personagemAtual.atributos || {};

  return (
    <>
      <h2>📊 Atributos</h2>
      <div className="atributosGrid">
        {Object.entries(nomes).map(([chave, rotulo]) => (
          <div key={chave} className="atributoCard">
            <h3>{rotulo}</h3>
            <p>
              <span className="valorBase">
                {personagemAtual.atributosBase?.[chave] || 10}
              </span>
              <span className="bonusSign"> + </span>
              <span className="bonusCalculado">
                {(atributos[chave] || 10) - (personagemAtual.atributosBase?.[chave] || 10)}
              </span>
              <span className="finalTotal"> = {atributos[chave] || 10}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="atributosGrid atributosDerivados">
        {[
          ["vidaMaxima", "Vida Máxima", "❤️"],
          ["manaMaxima", "Mana", "✨"],
          ["vidaAtual", "Vida Atual", "🩸"],
          ["armadura", "Armadura", "🛡️"],
          ["velocidade", "Velocidade", "🏃"],
          ["ouro", "Ouro", "🪙"],
        ].map(([chave, rotulo, icone]) => (
          <div key={chave} className="atributoCard">
            <h3>
              {icone} {rotulo}
            </h3>
            <p>{personagemAtual[chave] ?? 0}</p>
          </div>
        ))}
      </div>
    </>
  );
}
