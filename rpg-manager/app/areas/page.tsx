"use client";

import ListaAreas from "../../components/Areas/ListaAreas";
import Link from "next/link";

export default function PaginaAreas() {
  return (
    <main className="container">
      <header className="paginaCabecalho">
        <h1 className="paginaTitulo">✦ Atlas das Terras ✦</h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
             <Link href="/areas/inserir" className="botaoAcao">+ Nova Área</Link>
        </div>
      </header>
      <ListaAreas />
    </main>
  );
}
