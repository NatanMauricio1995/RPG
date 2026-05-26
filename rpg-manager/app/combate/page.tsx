"use client";

import { useEffect, useState } from "react";
import { listarPersonagens } from "../../services/personagemService";
import Image from "next/image";

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
  const [personagens, setPersonagens] = useState<any[]>([]);
  const [monstros, setMonstros] = useState<any[]>([]);

  const [personagensSelecionados, setPersonagensSelecionados] = useState<number[]>([]);
  const [monstrosSelecionados, setMonstrosSelecionados] = useState<number[]>([]);
  const [quantidadesMonstros, setQuantidadesMonstros] = useState<Record<number, number>>({});

  const [estado, setEstado] = useState<EstadoCombate | null>(null);
  const [atacanteSelecionado, setAtacanteSelecionado] = useState("");
  const [alvoSelecionado, setAlvoSelecionado] = useState("");
  const [mostrarModalResultado, setMostrarModalResultado] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const p = await listarPersonagens();
      const m = await listarMonstrosCombate();
      setPersonagens(p);
      setMonstros(m);
      setCarregando(false);
    }
    carregar();
  }, []);

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
    if (personagensSelecionados.length === 0 || monstrosSelecionados.length === 0) return;

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
  }

  function atualizarEstado(novoEstado: EstadoCombate) {
    setEstado(novoEstado);
    if (novoEstado.status !== "em_andamento") {
      setMostrarModalResultado(true);
    }
  }

  const handleFecharModal = () => {
    setMostrarModalResultado(false);
    setEstado(null);
  };

  function acaoAtaque() {
    if (!estado || !combatenteAtual || !alvoSelecionado) return;
    atualizarEstado(executarAtaqueBasico(estado, combatenteAtual.id, alvoSelecionado));
  }

  function acaoHabilidade(habilidadeId: string) {
    if (!estado || !combatenteAtual || !alvoSelecionado) return;
    atualizarEstado(executarHabilidade(estado, combatenteAtual.id, alvoSelecionado, habilidadeId));
  }

  function acaoFugir(combatenteId: string) {
    if (!estado) return;
    atualizarEstado(removerCombatente(estado, combatenteId));
  }

  if (carregando) return <div className="carregando">Preparando campo de batalha...</div>;

  return (
    <div className="paginaCombate container">
      <div className="topoCombate">
        <div>
          <h1 className="paginaTitulo">Sistema de Combate</h1>
          <p className="paginaSubtitulo">Batalhas controladas manualmente pelo mestre (Modo Mestre)</p>
        </div>
        <button className="botaoAcao" onClick={comecarCombate}>
          Iniciar Combate
        </button>
      </div>

      {!estado && (
        <section className="preparacaoCombate">
          <PainelSelecaoCombate
            titulo="Aliados"
            itens={personagens}
            selecionados={personagensSelecionados}
            onAlternar={(id) => alternarSelecao(Number(id), personagensSelecionados, setPersonagensSelecionados)}
          />

          <PainelSelecaoCombate
            titulo="Inimigos"
            itens={monstros}
            selecionados={monstrosSelecionados}
            quantidades={quantidadesMonstros}
            onAlternar={(id) => alternarSelecao(Number(id), monstrosSelecionados, setMonstrosSelecionados)}
            onAlterarQuantidade={(id, delta) => alterarQuantidadePreparacao(Number(id), delta)}
          />
        </section>
      )}

      {estado && (
        <section className="mesaCombate">
          <div className="listaParticipantesCombate">
            {estado.combatentes.map((combatente) => (
              <button
                key={combatente.id}
                className={`participanteBotao ${combatente.id === atacanteSelecionado ? "turnoAtual" : ""} ${!combatente.vivo ? "abatido" : ""}`}
                onClick={() => setAtacanteSelecionado(combatente.id)}
                disabled={!combatente.vivo}
              >
                <Image
                  src={combatente.imagem || "/imagens/personagens/padrao.png"}
                  alt={combatente.nome}
                  width={60}
                  height={60}
                  className="imagemParticipante"
                />
                <div className="dadosParticipante">
                  <strong>{combatente.nome}</strong>
                  <div className="barraContainer">
                    <div className="barraVida" style={{ width: `${(combatente.vidaAtual / combatente.vidaMaxima) * 100}%` }} />
                    <span>❤️ {combatente.vidaAtual}/{combatente.vidaMaxima}</span>
                  </div>
                  <div className="barraContainer">
                    <div className="barraMana" style={{ width: `${(combatente.manaAtual / Math.max(1, combatente.manaMaxima)) * 100}%` }} />
                    <span>🔷 {combatente.manaAtual}/{combatente.manaMaxima}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="controleCombate">
            <div className="campoHabilidade">
              <label>Alvo Atual:</label>
              <select value={alvoSelecionado} onChange={(e) => setAlvoSelecionado(e.target.value)}>
                {alvosDisponiveis.map((alvo) => (
                  <option key={alvo.id} value={alvo.id}>{alvo.nome} (HP: {alvo.vidaAtual})</option>
                ))}
              </select>
            </div>

            <div className="acoesDisponiveis">
              <button className="botaoAcao" onClick={acaoAtaque}>⚔ Ataque</button>
              {combatenteAtual?.habilidades.map((habilidade) => (
                <button key={habilidade.id} className="botaoAcao" style={{ background: 'var(--pedra-media)', color: 'var(--ouro)' }} onClick={() => acaoHabilidade(habilidade.id)}>
                  {habilidade.nome}
                </button>
              ))}
              <button className="botaoVoltar" onClick={() => combatenteAtual && acaoFugir(combatenteAtual.id)}>🏃 Fugir</button>
            </div>
          </div>

          <LogCombate estado={estado} />
          {mostrarModalResultado && (
            <ModalResultadoCombate estado={estado} onClose={handleFecharModal} />
          )}
        </section>
      )}
    </div>
  );
}
