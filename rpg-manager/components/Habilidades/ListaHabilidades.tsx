"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { listarHabilidades, excluirHabilidade, type Habilidade } from "../../services/habilidadeService";
import CardHabilidade from "./CardHabilidade";
import Loading from "../UI/Loading";
import Error from "../UI/Error";
import Button from "../UI/Button";
import type { QueryDocumentSnapshot } from "firebase/firestore";

export default function ListaHabilidades() {
  const [habilidades, setHabilidades] = useState<Habilidade[]>([]);
  const [busca, setBusca] = useState("");
  const [cursor, setCursor] = useState<QueryDocumentSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMais, setLoadingMais] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar(proxima = false) {
    try {
      if (proxima) setLoadingMais(true);
      else setLoading(true);
      setErro(null);

      const res = await listarHabilidades(proxima ? (cursor || undefined) : undefined);
      
      if (proxima) {
        setHabilidades(prev => [...prev, ...res.habilidades]);
      } else {
        setHabilidades(res.habilidades);
      }
      setCursor(res.cursor || null);
    } catch (error) {
      setErro("Falha ao carregar o grimório de habilidades.");
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingMais(false);
    }
  }

  async function handleExcluir(id: string) {
    if (confirm("Tem certeza que deseja apagar esta habilidade do grimório?")) {
      try {
        await excluirHabilidade(id);
        setHabilidades((anterior) => anterior.filter((h) => h.id !== id));
      } catch (error) {
        console.error("Erro ao excluir habilidade:", error);
      }
    }
  }

  const filtradas = habilidades.filter((h) =>
    h.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (h.tipo || "").toLowerCase().includes(busca.toLowerCase()) ||
    (h.descricao || "").toLowerCase().includes(busca.toLowerCase())
  );

  if (loading) return <Loading mensagem="Consultando grimórios ancestrais..." />;
  if (erro) return <Error mensagem={erro} onRetry={() => carregar()} />;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <h1 className="text-3xl font-black text-slate-800 dark:text-white">✨ Grimório de Habilidades</h1>
        
        <div className="flex gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Buscar por nome ou tipo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="flex-1 md:w-64 p-2.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-sm focus:border-indigo-500 outline-none transition-colors shadow-sm"
          />
          <Link href="/habilidades/inserir" className="flex-shrink-0">
            <Button variant="primary" className="h-full">+ Nova Habilidade</Button>
          </Link>
        </div>
      </div>

      {filtradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-3xl border-2 border-dashed border-indigo-200 dark:border-indigo-800 text-center">
          <p className="text-xl text-slate-400 mb-6">Nenhuma habilidade encontrada no grimório.</p>
          <Link href="/habilidades/inserir">
            <Button variant="primary">Escrever Primeira Habilidade</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filtradas.map((h) => (
              <CardHabilidade key={h.id} habilidade={h} onExcluir={handleExcluir} />
            ))}
          </div>

          {cursor && (
            <div className="mt-16 text-center">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => carregar(true)} 
                disabled={loadingMais}
                className="px-12"
              >
                {loadingMais ? "Consultando..." : "Descobrir Mais Habilidades"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
