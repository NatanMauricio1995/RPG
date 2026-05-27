"use client";

import ListaMissoes from "../../components/Missoes/ListaMissoes";
import Link from "next/link";
import Button from "../../components/UI/Button";

export default function PaginaMissoes() {
  return (
    <main className="w-full">
      <header className="px-4 sm:px-6 lg:px-8 py-6 border-b border-slate-200 dark:border-slate-800 mb-6 bg-white dark:bg-slate-900 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">✦ MURAL DE MISSÕES ✦</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Contratos e aventuras disponíveis para seu grupo.</p>
          </div>
          <Link href="/missoes/inserir" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full">+ Nova Missão</Button>
          </Link>
        </div>
      </header>
      <div className="max-w-7xl mx-auto">
        <ListaMissoes />
      </div>
    </main>
  );
}
