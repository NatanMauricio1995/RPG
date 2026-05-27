"use client";

import { useEffect, useState } from "react";
import {useParams}
from "next/navigation";

import Link
from "next/link";

import { buscarItem } from "../../../services/itemService";

import FichaItem
from "../../../components/Itens/FichaItem";

export default function Item(){

const params=
useParams();

const id=
params?.id ? String(params.id) : null;

const [item, setItem] = useState<any>(null);
const [carregando, setCarregando] = useState(true);

useEffect(() => {
  async function carregar() {
    if (id) {
      const encontrado = await buscarItem(id);
      setItem(encontrado);
    }
    setCarregando(false);
  }
  carregar();
}, [id]);

if (carregando) return <div className="carregando">Identificando item...</div>;

if(!item){
  return(
    <div>
      <h1>❌ Item não encontrado</h1>
      <Link href="/itens"><button className="botaoVoltar">⬅️ Voltar</button></Link>
    </div>
  );
}


return(

<div>

<Link
href="/itens"
>

<button
className="botaoVoltar"
>

⬅️ Voltar

</button>

</Link>


<FichaItem

item={item}

/>

</div>

);

}