export default function Home() {
  return (
    <div className="container">

      <header className="topo">
        <div>
          Estação:
          <select>
            <option>Verão</option>
            <option>Outono</option>
            <option>Inverno</option>
            <option>Primavera</option>
          </select>
        </div>

        <div>
          Clima:
          <select>
            <option>Sol</option>
            <option>Chuva</option>
            <option>Vento</option>
            <option>Nublado</option>
          </select>
        </div>

        <div>
          Intensidade:
          <select>
            <option>Muito fraco</option>
            <option>Fraco</option>
            <option>Médio</option>
            <option>Forte</option>
            <option>Muito forte</option>
          </select>
        </div>

        <button>🎲 Aleatório</button>
      </header>

      <div className="conteudo">

        <aside className="menu">
          <ul>
            <li><a href="/personagens">Personagens</a></li>
            <li><a href="/bestiario">Bestiário</a></li>
            <li><a href="/combate">Sistema de Combate</a></li>
            <li><a href="/itens">Itens</a></li>
            <li><a href="/calendario">Calendário</a></li>
            <li><a href="/npcs">NPCs</a></li>
            <li><a href="/missoes">Missões</a></li>
            <li><a href="/areas">Áreas</a></li>
          </ul>
        </aside>

        <main className="principal">
          <h1>RPG Manager</h1>

          <p>
            Bem-vindo ao gerenciador de mesa RPG
          </p>

        </main>

      </div>

    </div>
  );
}