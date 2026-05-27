"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import usePersonagem from "../../../hooks/usePersonagem";
import useNivel from "../../../hooks/useNivel";
import { useInventarioContext } from "../../../contexts/InventarioContext";

import InformacoesBasicas from "../../../components/Personagem/Ficha/InformacoesBasicas";
import Atributos from "../../../components/Personagem/Ficha/Atributos";
import ModalNivel from "../../../components/Personagem/Nivel/ModalNivel";
import SistemaEquipamento from "../../../components/Personagem/Equipamentos/SistemaEquipamento";
import Inventario from "../../../components/Personagem/Inventario/Inventario";
import Loading from "../../../components/UI/Loading";
import Error from "../../../components/UI/Error";
import Button from "../../../components/UI/Button";
import { useToast } from "../../../components/UI/Toast";

export default function Ficha() {
  const params = useParams();
  const router = useRouter();
  const { adicionarToast } = useToast();
  const { personagemAtual, setPersonagemAtual, carregando: loadingPersonagem } = usePersonagem(Number(params.id));
  const { carregarInventario } = useInventarioContext();
  const [abaAtiva, setAbaAtiva] = useState<"geral" | "equipamentos" | "inventario">("geral");

  const {
    subindoNivel,
    setSubindoNivel,
    pontosRestantes,
    atributosTemp,
    adicionarPonto,
    removerPonto,
    confirmarNivel,
  } = useNivel(personagemAtual, setPersonagemAtual);

  useEffect(() => {
    if (!personagemAtual) return;
    carregarInventario(personagemAtual.inventario || [], personagemAtual.equipados);
  }, [personagemAtual, carregarInventario]);

  const handleConfirmarNivel = useCallback(async () => {
    try {
      await confirmarNivel();
      adicionarToast("sucesso", "Nível aumentado com sucesso!");
    } catch (e) {
      adicionarToast("erro", "Erro ao aumentar nível.");
    }
  }, [confirmarNivel, adicionarToast]);

  if (loadingPersonagem) {
    return <Loading mensagem="Lendo pergaminhos do herói..." />;
  }

  if (!personagemAtual) {
    return (
      <Error 
        mensagem="Personagem não encontrado em nossos registros." 
        onRetry={() => router.push("/personagens")}
      />
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Header Responsivo */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-xl overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg">
                <Image
                  src={personagemAtual.imagem || "/imagens/racas/padrao.png"}
                  alt={personagemAtual.nome}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                  {personagemAtual.nome}
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
                  Nível {personagemAtual.nivel} • {personagemAtual.raca} {personagemAtual.classe}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <Link href="/personagens" className="flex-1 md:flex-initial">
                <Button variant="outline" className="w-full">⬅️ Voltar</Button>
              </Link>
              <Link href={`/personagens/${personagemAtual.id}/editar`} className="flex-1 md:flex-initial">
                <Button variant="primary" className="w-full">✏️ Editar</Button>
              </Link>
            </div>
          </div>

          {/* Abas Responsivas */}
          <nav className="flex mt-8 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
            <button
              onClick={() => setAbaAtiva("geral")}
              className={`px-6 py-3 font-bold text-sm uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                abaAtiva === "geral"
                  ? "border-amber-500 text-amber-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              📜 Geral
            </button>
            <button
              onClick={() => setAbaAtiva("equipamentos")}
              className={`px-6 py-3 font-bold text-sm uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                abaAtiva === "equipamentos"
                  ? "border-amber-500 text-amber-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              ⚔️ Equipamentos
            </button>
            <button
              onClick={() => setAbaAtiva("inventario")}
              className={`px-6 py-3 font-bold text-sm uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                abaAtiva === "inventario"
                  ? "border-amber-500 text-amber-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              🎒 Inventário
            </button>
          </nav>
        </div>

        {/* Conteúdo das Abas */}
        <div className="p-6 min-h-[400px]">
          {abaAtiva === "geral" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <InformacoesBasicas 
                personagemAtual={personagemAtual} 
                setSubindoNivel={setSubindoNivel} 
              />
              <Atributos personagemAtual={personagemAtual} />
            </div>
          )}

          {abaAtiva === "equipamentos" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SistemaEquipamento />
            </div>
          )}

          {abaAtiva === "inventario" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Inventario personagemId={personagemAtual.id} />
            </div>
          )}
        </div>
      </div>

      <ModalNivel
        subindoNivel={subindoNivel}
        setSubindoNivel={setSubindoNivel}
        personagemAtual={personagemAtual}
        atributosTemp={atributosTemp}
        pontosRestantes={pontosRestantes}
        adicionarPonto={adicionarPonto}
        removerPonto={removerPonto}
        confirmarNivel={handleConfirmarNivel}
      />
    </div>
  );
}

