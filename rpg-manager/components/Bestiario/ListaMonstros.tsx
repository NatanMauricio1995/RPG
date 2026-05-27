"use client";

import {useEffect,useState} from "react";
import Link from "next/link";

import { listarMonstrosCombate } from "../../services/combateService";

import CardMonstro from "./CardMonstro";
import FiltrosMonstros from "./FiltrosMonstros";

export default function ListaMonstros(){

const [pesquisa,setPesquisa]=useState("");
const [tipo,setTipo]=useState("");
const [monstros, setMonstros] = useState<any[]>([]);
const [carregando, setCarregando] = useState(true);

useEffect(() => {
  async function carregar() {
    const resultado = await listarMonstrosCombate();
    setMonstros(resultado || []);
    setCarregando(false);
  }
  carregar();
}, []);

const monstrosFiltrados = monstros.filter((monstro: any) => {
  const nomeOk = monstro.nome.toLowerCase().includes(pesquisa.toLowerCase());
  const tipoOk = monstro.tipo.toLowerCase().includes(tipo.toLowerCase());
  return nomeOk && tipoOk;
});

const tiposUnicos = [...new Set(monstros.map((m: any) => m.tipo))];


if (carregando) return <div className="carregando">Consultando grimório...</div>;

return (
  <div>
    <div className="topoBestiario">
      <h1>👹 Bestiário</h1>
      <Link href="/bestiario/inserir">
        <button className="botaoNovo">➕ Nova Besta</button>
      </Link>
    </div>

    <FiltrosMonstros
      pesquisa={pesquisa}
      setPesquisa={setPesquisa}
      tipo={tipo}
      setTipo={setTipo}
      tipos={tiposUnicos}
    />

    <div className="listaMonstrosGrid">
      {monstrosFiltrados.map((monstro: any, index: number) => (
        <CardMonstro key={`${monstro.id}-${index}`} monstro={monstro} />
      ))}
    </div>
  </div>
);
}