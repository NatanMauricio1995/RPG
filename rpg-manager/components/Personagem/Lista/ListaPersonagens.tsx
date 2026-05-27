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

export default function ListaPersonagens() {
  const [pesquisa, setPesquisa] = useState("");
  const [classe, setClasse] = useState("");
  const [raca, setRaca] = useState("");
  const [personagens, setPersonagens] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  
  const { adicionarToast } = useToast();

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);
      const base = await listarPersonagens();
      const completos = await Promise.all(base.map(p => completarPersonagem(p)));
      setPersonagens(completos);
    } catch (e) {
      console.error(e);
      setErro("Não foi possível carregar a lista de personagens. Verifique sua conexão.");
      adicionarToast("erro", "Falha ao carregar personagens.");
    } finally {
      setCarregando(false);
    }
  }, [adicionarToast]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const filtrados = personagens.filter((personagem) => {
    const nomeOk = (personagem.nome || "").toLowerCase().includes(pesquisa.toLowerCase());
    const classeOk = (personagem.classe || "").toLowerCase().includes(classe.toLowerCase());
    const racaOk = (personagem.raca || "").toLowerCase().includes(raca.toLowerCase());
    return nomeOk && classeOk && racaOk;
  });

  const classesUnicas = Array.from(new Set(personagens.map((p) => p.classe).filter(Boolean)));
  const racasUnicas = Array.from(new Set(personagens.map((p) => p.raca).filter(Boolean)));

  if (carregando) return <Loading mensagem="Convocando aventureiros..." />;
  
  if (erro) return <Error mensagem={erro} onRetry={carregar} />;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>👥</span> Personagens
        </h1>
        <Link href="/personagens/inserir">
          <Button variant="primary" className="w-full sm:w-auto">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtrados.map((personagem) => (
            <CardPersonagem key={personagem.id} personagem={personagem} />
          ))}
        </div>
      )}
    </div>
  );
}
