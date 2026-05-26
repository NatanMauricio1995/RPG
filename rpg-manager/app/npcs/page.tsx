"use client";

import ListaNPCs from "../../components/NPCs/ListaNPCs";
import "../../styles/npcs.css";
import Link from "next/link";

export default function PaginaNPCs() {
  return (
    <main className="container">
      <header className="paginaCabecalho">
        <h1 className="paginaTitulo">✦ Habitantes do Mundo ✦</h1>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
             <Link href="/npcs/inserir" className="botaoAcao">+ Novo NPC</Link>
        </div>
      </header>
      <ListaNPCs />
    </main>
  );
}
