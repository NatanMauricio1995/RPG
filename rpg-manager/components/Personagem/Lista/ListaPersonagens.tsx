"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { completarPersonagem, listarPersonagens } from "../../../services/personagemService";
import CardPersonagem from "./CardPersonagem";
import FiltrosPersonagem from "./FiltrosPersonagem";
import Loading from "../../UI/Loading";
import Error from "../../UI/Error";
import Button from "../../UI/Button";
import { useToast } from "../../UI/Toast";
import type { QueryDocumentSnapshot } from "firebase/firestore";

export default function ListaPersonagens() {
  const [pesquisa, setPesquisa] = useState("");
  const [classe, setClasse] = useState("");
  const [raca, setRaca] = useState("");
  const [personagens, setPersonagens] = useState<any[]>([]);
  const [cursor, setCursor] = useState<QueryDocumentSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMais, setLoadingMais] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  
  const { adicionarToast } = useToast();

  const carregar = useCallback(async (proxima = false) => {
    try {
      if (proxima) setLoadingMais(true);
      else setLoading(true);
      
      setErro(null);
      const res = await listarPersonagens(undefined, proxima ? (cursor || undefined) : undefined);
      const completos = await Promise.all(res.personagens.map(p => completarPersonagem(p)));
      
      if (proxima) {
        setPersonagens(prev => [...prev, ...completos]);
      } else {
        setPersonagens(completos);
      }
      setCursor(res.cursor || null);
    } catch (e) {
      console.error(e);
      setErro("Não foi possível carregar a lista de personagens. Verifique sua conexão.");
      adicionarToast("erro", "Falha ao carregar personagens.");
    } finally {
      setLoading(false);
      setLoadingMais(false);
    }
  }, [adicionarToast, cursor]);

  useEffect(() => {
    carregar();
  }, []);

  const filtrados = personagens.filter((personagem) => {
    const nomeOk = (personagem.nome || "").toLowerCase().includes(pesquisa.toLowerCase());
    const classeOk = (personagem.classe || "").toLowerCase().includes(classe.toLowerCase());
    const racaOk = (personagem.raca || "").toLowerCase().includes(raca.toLowerCase());
    return nomeOk && classeOk && racaOk;
  });

  const classesUnicas = Array.from(new Set(personagens.map((p) => p.classe).filter(Boolean)));
  const racasUnicas = Array.from(new Set(personagens.map((p) => p.raca).filter(Boolean)));

  if (loading) return <Loading mensagem="Convocando aventureiros..." />;
  
  if (erro) return <Error mensagem={erro} onRetry={() => carregar()} />;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>👥</span> Personagens
        </h1>
        <Link href="/personagens/inserir" className="w-full sm:w-auto">
          <Button variant="primary" className="w-full">
            + Novo Personagem
          </Button>
        </Link>
      </div>

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

      {filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-xl text-slate-500 mb-6">
            {personagens.length === 0 
              ? "Nenhum personagem criado ainda." 
              : "Nenhum personagem corresponde aos filtros."}
          </p>
          {personagens.length === 0 && (
            <Link href="/personagens/inserir">
              <Button variant="primary">Criar Primeiro Personagem</Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtrados.map((personagem) => (
              <CardPersonagem key={personagem.id} personagem={personagem} />
            ))}
          </div>
          
          {cursor && (
            <div className="mt-12 text-center">
              <Button 
                variant="outline" 
                onClick={() => carregar(true)} 
                disabled={loadingMais}
                className="px-10"
              >
                {loadingMais ? "Carregando..." : "Convocando mais heróis"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
