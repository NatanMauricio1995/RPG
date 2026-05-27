"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { listarPersonagens } from "../../services/personagemService";
import Loading from "../../components/UI/Loading";
import Error from "../../components/UI/Error";
import Button from "../../components/UI/Button";
import { useToast } from "../../components/UI/Toast";

import {
  EstadoCombate,
  executarAtaqueBasico,
  executarHabilidade,
  iniciarCombate,
  listarMonstrosCombate,
  removerCombatente,
} from "../../services/combateService";

import PainelSelecaoCombate from "../../components/Combate/PainelSelecaoCombate";
import LogCombate from "../../components/Combate/LogCombate";
import ModalResultadoCombate from "../../components/Combate/ModalResultadoCombate";

export default function CombatePage() {
  const { adicionarToast } = useToast();
  const [personagens, setPersonagens] = useState<any[]>([]);
  const [monstros, setMonstros] = useState<any[]>([]);

  const [personagensSelecionados, setPersonagensSelecionados] = useState<number[]>([]);
  const [monstrosSelecionados, setMonstrosSelecionados] = useState<number[]>([]);
  const [quantidadesMonstros, setQuantidadesMonstros] = useState<Record<number, number>>({});

  const [estado, setEstado] = useState<EstadoCombate | null>(null);
  const [personagensSnapshot, setPersonagensSnapshot] = useState<Record<string, any>>({});
  const [atacanteSelecionado, setAtacanteSelecionado] = useState("");
  const [alvoSelecionado, setAlvoSelecionado] = useState("");
  const [mostrarModalResultado, setMostrarModalResultado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);
      const [p, m] = await Promise.all([listarPersonagens(), listarMonstrosCombate()]);
      setPersonagens(p);
      setMonstros(m);
    } catch (e) {
      setErro("Não foi possível carregar os dados de combate.");
      adicionarToast("erro", "Erro ao carregar dados.");
    } finally {
      setCarregando(false);
    }
  }, [adicionarToast]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const combatenteAtual = estado?.combatentes.find((c) => c.id === atacanteSelecionado) || null;

  const alvosDisponiveis = estado && combatenteAtual
    ? estado.combatentes.filter((c) => c.lado !== combatenteAtual.lado && c.vivo)
    : [];

  function alternarSelecao(id: number, lista: number[], setLista: (valor: number[]) => void) {
    setLista(lista.includes(id) ? lista.filter((item) => item !== id) : [...lista, id]);
  }

  function alterarQuantidadePreparacao(id: number, delta: number) {
    setQuantidadesMonstros((anteriores) => ({
      ...anteriores,
      [id]: Math.max(1, (anteriores[id] || 1) + delta),
    }));
  }

  async function comecarCombate() {
    if (personagensSelecionados.length === 0 || monstrosSelecionados.length === 0) {
      adicionarToast("info", "Selecione pelo menos um aliado e um inimigo.");
      return;
    }

    try {
      // Criar snapshot dos personagens selecionados
      const snapshot: Record<string, any> = {};
      personagens
        .filter(p => personagensSelecionados.includes(Number(p.id)))
        .forEach(p => {
          snapshot[String(p.id)] = { ...p };
        });
      setPersonagensSnapshot(snapshot);

      const inimigos = monstros
        .filter((monstro: any) => monstrosSelecionados.includes(Number(monstro.id)))
        .map((monstro: any) => ({
          ...monstro,
          quantidade: quantidadesMonstros[Number(monstro.id)] || 1,
        }));

      const novoEstado = await iniciarCombate(personagensSelecionados, inimigos);
      setEstado(novoEstado);

      const primeiro = novoEstado.combatentes.find((c) => c.vivo);
      setAtacanteSelecionado(primeiro?.id || "");

      const alvo = novoEstado.combatentes.find((c) => c.lado !== primeiro?.lado && c.vivo);
      setAlvoSelecionado(alvo?.id || "");
      
      adicionarToast("sucesso", "O combate começou!");
    } catch (e) {
      adicionarToast("erro", "Erro ao iniciar combate.");
    }
  }

  function atualizarEstado(novoEstado: EstadoCombate) {
    setEstado(novoEstado);
    if (novoEstado.status !== "em_andamento") {
      setMostrarModalResultado(true);
      if (novoEstado.status === "vitoria") {
        adicionarToast("sucesso", "Vitória dos heróis!");
      } else {
        adicionarToast("erro", "Os heróis foram derrotados...");
      }
    }
  }

  const handleFecharModal = () => {
    setMostrarModalResultado(false);
    setEstado(null);
  };

  async function handleAplicarResultados(idsParaAplicar: string[]) {
    if (!estado) return;

    try {
      const { atualizarPersonagem } = await import("../../services/personagemService");
      const { alterarQuantidade } = await import("../../services/itemService");
      const { xp, ouro } = (await import("../../services/combateService")).calcularResultadoCombate(estado);
      
      const promises = idsParaAplicar.map(async (id) => {
        const combatente = estado.combatentes.find(c => String(c.origemId) === id);
        const pOriginal = personagensSnapshot[id];
        if (!combatente || !pOriginal) return;

        const xpGanhado = Math.floor(xp / idsParaAplicar.length);
        const ouroGanhado = Math.floor(ouro / idsParaAplicar.length);

        const novosDados = {
          vidaAtual: combatente.vidaAtual,
          manaAtual: combatente.manaAtual,
          xpAtual: (pOriginal.xpAtual || 0) + xpGanhado,
          ouro: (pOriginal.ouro || 0) + ouroGanhado,
          efeitosAtivos: combatente.efeitos, // Salvar efeitos ativos
        };

        // Consumir itens do inventário real
        if (combatente.itensConsumidos && combatente.itensConsumidos.length > 0) {
          for (const item of combatente.itensConsumidos) {
            await alterarQuantidade(id, item.itemId, -item.quantidade);
          }
        }

        await atualizarPersonagem(id, novosDados);
      });

      await Promise.all(promises);
      adicionarToast("sucesso", "Resultados aplicados com sucesso!");
      handleFecharModal();
      carregar(); 
    } catch (e) {
      console.error(e);
      adicionarToast("erro", "Erro ao aplicar resultados.");
    }
  }

  function acaoAtaque() {
    if (!estado || !combatenteAtual || !alvoSelecionado) return;
    atualizarEstado(executarAtaqueBasico(estado, combatenteAtual.id, alvoSelecionado));
    adicionarToast("info", `${combatenteAtual.nome} atacou!`);
  }

  function acaoHabilidade(habilidadeId: string, nomeHabilidade: string) {
    if (!estado || !combatenteAtual || !alvoSelecionado) return;
    atualizarEstado(executarHabilidade(estado, combatenteAtual.id, alvoSelecionado, habilidadeId));
    adicionarToast("sucesso", `${combatenteAtual.nome} usou ${nomeHabilidade}!`);
  }

  function acaoFugir(combatenteId: string) {
    if (!estado) return;
    atualizarEstado(removerCombatente(estado, combatenteId));
    adicionarToast("info", "Alguém fugiu da batalha!");
  }

  if (carregando) return <Loading mensagem="Preparando campo de batalha..." />;
  
  if (erro) return <Error mensagem={erro} onRetry={carregar} />;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">⚔️ Sistema de Combate</h1>
          <p className="text-slate-500 dark:text-slate-400">Gerencie batalhas épicas entre heróis e monstros.</p>
        </div>
        {!estado && (
          <Button 
            size="lg" 
            variant="success" 
            onClick={comecarCombate}
            disabled={personagensSelecionados.length === 0 || monstrosSelecionados.length === 0}
            className="w-full sm:w-auto shadow-lg"
          >
            🔥 Iniciar Combate
          </Button>
        )}
      </div>

      {!estado && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800">
            <PainelSelecaoCombate
              titulo="👥 Heróis Aliados"
              itens={personagens}
              selecionados={personagensSelecionados}
              onAlternar={(id) => alternarSelecao(Number(id), personagensSelecionados, setPersonagensSelecionados)}
            />
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800">
            <PainelSelecaoCombate
              titulo="👾 Hordas de Inimigos"
              itens={monstros}
              selecionados={monstrosSelecionados}
              quantidades={quantidadesMonstros}
              onAlternar={(id) => alternarSelecao(Number(id), monstrosSelecionados, setMonstrosSelecionados)}
              onAlterarQuantidade={(id, delta) => alterarQuantidadePreparacao(Number(id), delta)}
            />
          </div>
        </section>
      )}

      {estado && (
        <section className="space-y-8 animate-in zoom-in-95 duration-300">
          {/* Fila de Iniciativa / Combatentes */}
          <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-2xl overflow-x-auto">
            <div className="flex gap-4 min-w-max">
              {estado.combatentes.map((combatente) => (
                <button
                  key={combatente.id}
                  className={`relative group flex flex-col items-center p-3 rounded-xl transition-all duration-300 border-2 ${
                    combatente.id === atacanteSelecionado 
                      ? "bg-amber-500/20 border-amber-500 scale-110 z-10" 
                      : "bg-white dark:bg-slate-900 border-transparent hover:border-slate-300"
                  } ${!combatente.vivo ? "opacity-50 grayscale" : ""}`}
                  onClick={() => setAtacanteSelecionado(combatente.id)}
                  disabled={!combatente.vivo}
                >
                  <div className="relative h-16 w-16 rounded-full overflow-hidden mb-2 border-2 border-slate-200">
                    <Image
                      src={combatente.imagem || "/imagens/personagens/padrao.png"}
                      alt={combatente.nome}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-xs font-bold truncate max-w-[80px]">{combatente.nome}</span>
                  
                  {/* Barras de Status Compactas */}
                  <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-red-500 transition-all" 
                      style={{ width: `${(combatente.vidaAtual / combatente.vidaMaxima) * 100}%` }} 
                    />
                  </div>
                  {!combatente.vivo && <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">💀</div>}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Painel de Controle */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                  <div className="text-center sm:text-left">
                    <p className="text-sm font-bold uppercase tracking-wider text-amber-600 mb-1">Turno de:</p>
                    <h2 className="text-2xl font-black">{combatenteAtual?.nome}</h2>
                  </div>
                  
                  <div className="flex-1 w-full sm:w-auto">
                    <label className="block text-sm font-bold text-slate-500 mb-2">Selecionar Alvo:</label>
                    <select 
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-amber-500 outline-none transition-colors"
                      value={alvoSelecionado} 
                      onChange={(e) => setAlvoSelecionado(e.target.value)}
                    >
                      {alvosDisponiveis.map((alvo) => (
                        <option key={alvo.id} value={alvo.id}>{alvo.nome} (❤️ {alvo.vidaAtual}/{alvo.vidaMaxima})</option>
                      ))}
                      {alvosDisponiveis.length === 0 && <option value="">Nenhum alvo disponível</option>}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button 
                    variant="danger" 
                    size="lg" 
                    className="h-16 text-lg font-bold shadow-md"
                    onClick={acaoAtaque}
                    disabled={!alvoSelecionado}
                  >
                    ⚔️ Ataque Básico
                  </Button>
                  
                  {combatenteAtual?.habilidades.map((habilidade) => (
                    <Button 
                      key={habilidade.id} 
                      variant="primary"
                      size="lg"
                      className="h-16 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-md"
                      onClick={() => acaoHabilidade(habilidade.id, habilidade.nome)}
                      disabled={!alvoSelecionado || (combatenteAtual.manaAtual < (habilidade.custoMana || 0))}
                    >
                      ✨ {habilidade.nome}
                      <span className="ml-2 text-xs opacity-80">({habilidade.custoMana || 0} MP)</span>
                    </Button>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="h-16 text-lg font-bold sm:col-span-2"
                    onClick={() => combatenteAtual && acaoFugir(combatenteAtual.id)}
                  >
                    🏃 Fugir da Batalha
                  </Button>
                </div>
              </div>
            </div>

            {/* Log de Combate */}
            <div className="h-full">
              <LogCombate estado={estado} />
            </div>
          </div>

          {mostrarModalResultado && (
            <ModalResultadoCombate 
              estado={estado} 
              personagensSnapshot={personagensSnapshot}
              onAplicar={handleAplicarResultados}
              onCancelar={handleFecharModal} 
            />
          )}
        </section>
      )}
    </div>
  );
}
