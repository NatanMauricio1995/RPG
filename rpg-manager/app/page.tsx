import Topo from "../components/Topo/Topo";
import Sidebar from "../components/Sidebar/Sidebar";

export default function Home(){

return(

<div className="container">

<Topo/>

<div className="conteudo">

<Sidebar/>

<main className="principal">

<h1>🎲 RPG Manager</h1>

<p>
Bem-vindo ao gerenciador de mesa RPG
</p>

</main>

</div>

</div>

);

}