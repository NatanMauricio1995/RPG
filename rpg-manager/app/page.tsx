export default function Home(){

return(

<div>

<h1>🎲 RPG Manager</h1>

<p>
Bem-vindo ao gerenciador de mesa RPG. Utilize o menu lateral para gerenciar seus personagens, monstros, combates, itens, calendário, NPCs, missões e áreas.
</p>

<div className="home-acoes">
  <a href="/missoes" className="botaoNovo">Gerenciar Missões</a>
  <a href="/areas" className="botaoNovo">Explorar Áreas</a>
</div>

</div>

);

}