import "../styles/layout.css";
import "../styles/ficha.css";
import "../styles/inventario.css";
import "../styles/modalNivel.css";
import "../styles/vida.css";
import "../styles/componentes.css";
import "../styles/personagens.css";
import "./globals.css";
import "../styles/bestiario.css";
import "../styles/itens.css";
import {InventarioProvider} 
from "../contexts/InventarioContext";

import {CalendarioProvider}
from "../contexts/CalendarioContext";

import Topo
from "../components/Layout/Topo";

import Sidebar
from "../components/Layout/Sidebar";


export const metadata = {

title:"RPG Manager",

description:
"Gerenciador de mesa RPG"

};


export default function RootLayout({

children,

}:{

children:React.ReactNode

}){

return(

<html lang="pt-BR">

<body>

<CalendarioProvider>
<InventarioProvider>

<div className="container">

<Topo/>


<div className="conteudo">

<Sidebar/>

<main
className="principal"
>

{children}

</main>

</div>

</div>

</InventarioProvider>

</CalendarioProvider>

</body>

</html>

);

}