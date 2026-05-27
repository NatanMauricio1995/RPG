"use client";

import { useEffect, useState } from "react";
import {useParams}
from "next/navigation";

import Link
from "next/link";

import { buscarMonstro } from "../../../services/combateService";

import FichaMonstro
from "../../../components/Bestiario/FichaMonstro";

export default function Monstro(){

const params=
useParams();

const id=
params?.id ? String(params.id) : null;

const [monstro, setMonstro] = useState<any>(null);
const [carregando, setCarregando] = useState(true);

useEffect(() => {
  async function carregar() {
    if (id) {
      const encontrado = await buscarMonstro(id);
      if (encontrado) {
        // Popula habilidades se forem IDs
        if (Array.isArray(encontrado.habilidades) && encontrado.habilidades.length > 0 && typeof encontrado.habilidades[0] === 'string') {
          const { getDocs, collection, query, where, documentId } = await import("firebase/firestore");
          const { db } = await import("../../../firebase/config");
          const habsSnap = await getDocs(query(collection(db, "habilidadesMonstros")));
          const todasHabs = habsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
          encontrado.habilidadesDetalhes = todasHabs.filter(h => encontrado.habilidades.includes(h.id));
        }
      }
      setMonstro(encontrado);
    }
    setCarregando(false);
  }
  carregar();
}, [id]);

if (carregando) return <div className="carregando">Consultando grimório...</div>;

if(!monstro){
  return(
    <div>
      <h1>❌ Monstro não encontrado</h1>
      <Link href="/bestiario"><button className="botaoVoltar">⬅️ Voltar</button></Link>
    </div>
  );
}


return(

<div>

<Link
href="/bestiario"
>

<button
className="botaoVoltar"
>

⬅️ Voltar

</button>

</Link>


<FichaMonstro

monstro={monstro}

/>

</div>

);

}