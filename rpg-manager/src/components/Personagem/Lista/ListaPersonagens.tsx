"use client";

import {useEffect,useState} from "react";
import { useAuth } from "../../../contexts/AuthContext";

import {
completarPersonagem,
listarPersonagens
} from "../../../services/personagemService";

import CardPersonagem
from "./CardPersonagem";

import FiltrosPersonagem
from "./FiltrosPersonagem";

export default function ListaPersonagens(){
const { user } = useAuth();

const [pesquisa,setPesquisa]=
useState("");

const [classe,setClasse]=
useState("");

const [raca,setRaca]=
useState("");


const [
personagens,
setPersonagens
]=useState<any[]>([]);

const [loading, setLoading] = useState(true);


useEffect(()=>{
  if (user) {
    const carregar = async () => {
      setLoading(true);
      const base = await listarPersonagens(user.uid);
      const completos = await Promise.all(base.map(p => completarPersonagem(p)));
      setPersonagens(completos);
      setLoading(false);
    };
    carregar();
  }
},[user]);

const filtrados = personagens.filter(
(personagem)=>{

const nomeOk=

(personagem.nome || "")

.toLowerCase()

.includes(

pesquisa
.toLowerCase()

);


const classeOk=

(personagem.classe || "")

.toLowerCase()

.includes(

classe
.toLowerCase()

);


const racaOk=

(personagem.raca || "")

.toLowerCase()

.includes(

raca
.toLowerCase()

);


return(

nomeOk &&
classeOk &&
racaOk

);

}

);


const classesUnicas=

[

...new Set(

personagens.map(
p=>p.classe
)

)

];


const racasUnicas=

[

...new Set(

personagens.map(
p=>p.raca
)

)

];

if (loading) return <p>Carregando personagens...</p>;

return(

<div>

<h1>

👥 Personagens

</h1>


<FiltrosPersonagem

pesquisa={pesquisa}
setPesquisa={setPesquisa}

classe={classe}
setClasse={setClasse}

raca={raca}
setRaca={setRaca}

classes={classesUnicas}

racas={racasUnicas}

/>


<div className="listaPersonagensGrid">

{

filtrados.map(
(personagem)=>(

<CardPersonagem

key={
personagem.id
}

personagem={
personagem
}

/>

)

)

}

</div>

</div>

);

}
