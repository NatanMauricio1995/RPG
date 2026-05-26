"use client";

import ListaMissoes from "../../components/Missoes/ListaMissoes";
import Link from "next/link";

export default function PaginaMissoes() {
  return (
    <main className="container">
      <header className="paginaCabecalho">
        <h1 className="paginaTitulo">✦ Mural de Missões ✦</h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
             <Link href="/missoes/inserir" className="botaoAcao">+ Nova Missão</Link>
        </div>
      </header>
      <ListaMissoes />
    </main>
  );
}
