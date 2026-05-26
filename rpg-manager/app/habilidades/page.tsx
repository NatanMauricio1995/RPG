"use client";

import ListaHabilidades from "../../components/Habilidades/ListaHabilidades";
import "../../styles/habilidades.css";

export default function PaginaHabilidades() {
  return (
    <main className="container">
      <header className="paginaCabecalho">
        <h1 className="paginaTitulo">✦ Grimório de Habilidades ✦</h1>
        <p className="paginaSubtitulo">Gerencie as magias e técnicas disponíveis para os heróis e monstros.</p>
      </header>

      <ListaHabilidades />
    </main>
  );
}
