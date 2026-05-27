"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { EstadoCombate } from "../../services/combateService";
import { buscarPersonagem, salvarPersonagem } from "../../services/personagemService";
import { salvarHistoricoCombate, HistoricoCombate } from "../../services/historicoService";
import type { Personagem } from "../../types/domain";
import "../../styles/combate.css";

type OpcoesCampos = {
  vida: boolean;
  mana: boolean;
  xp: boolean;
  ouro: boolean;
  efeitos: boolean;
  inventario: boolean;
  mortes: boolean;
};

type Props = {
  estado: EstadoCombate;
  onClose: () => void;
};

export default function ModalResultadoCombate({ estado, onClose }: Props) {
  const [salvando, setSalvando] = useState(false);
  const [modoParc, setModoParc] = useState(false);
  const [opcoes, setOpcoes] = useState<Record<string, OpcoesCampos>>({});
  const [recompensas, setRecompensas] = useState({ xp: 0, ouro: 0 });
  const [personagensOriginais, setPersonagensOriginais] = useState<Record<string, Personagem>>({});
  const [carregando, setCarregando] = useState(true);

  const aliados = estado.combatentes.filter((c) => c.lado === "aliado");
  const inimigosDerrotados = estado.combatentes.filter((c) => c.lado === "inimigo" && !c.vivo);

  // ─── Carregar estado original de cada aliado no Firebase ───────────────────
  useEffect(() => {
    async function carregarOriginais() {
      const originais: Record<string, Personagem> = {};
      const opts: Record<string, OpcoesCampos> = {};

      for (const c of aliados) {
        const p = await buscarPersonagem(c.origemId);
        if (p) originais[c.id] = p;

        opts[c.id] = {
          vida: true,
          mana: true,
          xp: true,
          ouro: true,
          efeitos: true,
          inventario: true,
          mortes: true,
        };
      }

      setPersonagensOriginais(originais);
      setOpcoes(opts);

      // Calcular recompensas totais
      let totalXP = 0;
      let totalOuro = 0;
      inimigosDerrotados.forEach((i) => {
        totalXP += (i as any).experiencia || 0;
        totalOuro += (i as any).drop?.ouro || 0;
      });
      setRecompensas({ xp: totalXP, ouro: totalOuro });
      setCarregando(false);
    }

    carregarOriginais();
  }, []);                                  // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Toggle de checkbox ────────────────────────────────────────────────────
  function toggleOpcao(combatenteId: string, campo: keyof OpcoesCampos) {
    setOpcoes((prev) => ({
      ...prev,
      [combatenteId]: {
        ...prev[combatenteId],
        [campo]: !prev[combatenteId][campo],
      },
    }));
  }

  // ─── Aplicar alterações ────────────────────────────────────────────────────
  async function aplicarAlteracoes(apenasSelecionados: boolean) {
    setSalvando(true);
    try {
      const xpDistribuido:   { personagemId: string; valor: number }[] = [];
      const ouroDistribuido: { personagemId: string; valor: number }[] = [];

      for (const combatente of aliados) {
        const pOriginal = personagensOriginais[combatente.id];
        if (!pOriginal) continue;

        const opt: OpcoesCampos = apenasSelecionados
          ? opcoes[combatente.id]
          : { vida: true, mana: true, xp: true, ouro: true, efeitos: true, inventario: true, mortes: true };

        const pAtualizado = { ...pOriginal };

        if (opt.vida)  pAtualizado.vidaAtual  = combatente.vidaAtual;
        if (opt.mana)  pAtualizado.manaAtual  = combatente.manaAtual;

        if (opt.xp && estado.status === "vitoria") {
          pAtualizado.xpAtual += recompensas.xp;
          xpDistribuido.push({ personagemId: String(pOriginal.id), valor: recompensas.xp });
        }

        if (opt.ouro && estado.status === "vitoria") {
          pAtualizado.ouro = (pAtualizado.ouro ?? 0) + recompensas.ouro;
          ouroDistribuido.push({ personagemId: String(pOriginal.id), valor: recompensas.ouro });
        }

        if (opt.efeitos) {
          pAtualizado.efeitosAtivos = combatente.efeitos;
        }

        if (opt.mortes && !combatente.vivo) {
          // Marca personagem como morto — deixa vida em 0 mesmo que opt.vida=false
          pAtualizado.vidaAtual = 0;
        }

        // TODO: opt.inventario — rastrear itens consumidos durante combate
        // pAtualizado.inventario = combatente.inventarioPos ?? pOriginal.inventario;

        await salvarPersonagem(pAtualizado);
      }

      // Salvar histórico
      const historico: Omit<HistoricoCombate, "id"> = {
        data: new Date().toISOString(),
        participantes: estado.combatentes.map((c) => c.nome),
        vencedor: estado.status === "vitoria" ? "Aliados" : "Inimigos",
        derrotados: estado.combatentes.filter((c) => !c.vivo).map((c) => c.nome),
        xpDistribuido,
        ouroDistribuido,
        itensConsumidos: [],
      };

      await salvarHistoricoCombate(historico);
      onClose();
    } catch (error) {
      console.error("Erro ao aplicar alterações:", error);
      alert("Erro ao salvar alterações.");
    } finally {
      setSalvando(false);
    }
  }

  // ─── Diff de um atributo numérico ──────────────────────────────────────────
  function Diff({ antes, depois, label }: { antes: number; depois: number; label: string }) {
    const delta = depois - antes;
    const cor = delta >= 0 ? "var(--verde, #4caf50)" : "var(--vermelho, #f44336)";
    return (
      <span className="diffItem">
        {label}: {antes} → {depois}{" "}
        {delta !== 0 && (
          <span style={{ color: cor, fontWeight: "bold" }}>
            ({delta > 0 ? "+" : ""}{delta})
          </span>
        )}
      </span>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  if (carregando) {
    return (
      <div className="modalSobreposicao" style={{ zIndex: 1000 }}>
        <div className="modalConteudo resultadoCombate">
          <p style={{ textAlign: "center", padding: "2rem" }}>Carregando resultados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modalSobreposicao" style={{ zIndex: 1000 }}>
      <div className="modalConteudo resultadoCombate">
        {/* Título */}
        <h2 className={estado.status === "vitoria" ? "tituloVitoria" : "tituloDerrota"}>
          {estado.status === "vitoria" ? "✦ Vitória Gloriosa ✦" : "✦ Derrota Amarga ✦"}
        </h2>

        {/* Recompensas gerais */}
        {estado.status === "vitoria" && (
          <div className="recompensasGerais">
            <span className="xp" style={{ color: "var(--ouro)", marginRight: "15px" }}>
              ⭐ XP: +{recompensas.xp}
            </span>
            <span className="ouro" style={{ color: "#ffd700" }}>
              💰 Ouro: +{recompensas.ouro}
            </span>
          </div>
        )}

        {/* Toggle modo parcial */}
        <div style={{ textAlign: "center", marginBottom: "12px" }}>
          <button
            className={`btnToggleParcial ${modoParc ? "ativo" : ""}`}
            onClick={() => setModoParc(!modoParc)}
          >
            {modoParc ? "🔧 Aplicar parcialmente (ativado)" : "🔧 Aplicar parcialmente"}
          </button>
        </div>

        {/* Lista de aliados */}
        <div className="listaDifs">
          {aliados.map((c) => {
            const original = personagensOriginais[c.id];
            return (
              <div key={c.id} className="itemDif">
                {/* Cabeçalho do personagem */}
                <div className="infoCombatente">
                  <Image
                    src={c.imagem}
                    alt={c.nome}
                    width={50}
                    height={50}
                    className="avatarMini"
                  />
                  <div className="nomeCombatente">
                    <strong>{c.nome}</strong>
                    <span>Nível {c.nivel}</span>
                    {!c.vivo && <span style={{ color: "#f44336" }}> ☠ Morto</span>}
                  </div>
                </div>

                {/* Diffs */}
                {original && (
                  <div className="diffsContainer">
                    <Diff label="HP"   antes={original.vidaAtual} depois={c.vidaAtual} />
                    <Diff label="MP"   antes={original.manaAtual} depois={c.manaAtual} />
                    {estado.status === "vitoria" && (
                      <>
                        <Diff label="XP"   antes={original.xpAtual}  depois={original.xpAtual + recompensas.xp} />
                        <Diff label="Ouro" antes={original.ouro ?? 0} depois={(original.ouro ?? 0) + recompensas.ouro} />
                      </>
                    )}
                  </div>
                )}

                {/* Checkboxes do modo parcial */}
                {modoParc && opcoes[c.id] && (
                  <div className="gridChecks">
                    {(Object.keys(opcoes[c.id]) as (keyof OpcoesCampos)[]).map((campo) => (
                      <div key={campo} className="checkGroup">
                        <input
                          type="checkbox"
                          id={`${campo}-${c.id}`}
                          checked={opcoes[c.id][campo]}
                          onChange={() => toggleOpcao(c.id, campo)}
                        />
                        <label htmlFor={`${campo}-${c.id}`}>{campo}</label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Botões */}
        <div className="modalAcoes">
          <button className="botaoVoltar" onClick={onClose} disabled={salvando}>
            Cancelar
          </button>
          <div style={{ display: "flex", gap: "10px" }}>
            {modoParc && (
              <button
                className="botaoAcao"
                onClick={() => aplicarAlteracoes(true)}
                disabled={salvando}
                style={{ background: "var(--pedra-media)", color: "var(--ouro)" }}
              >
                Aplicar Selecionados
              </button>
            )}
            <button
              className="botaoAcao"
              onClick={() => aplicarAlteracoes(false)}
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Aplicar Tudo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
