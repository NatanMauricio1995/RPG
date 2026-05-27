"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { EstadoCombate, RegistroDano } from "../../services/combateService";
import { buscarPersonagem, salvarPersonagem } from "../../services/personagemService";
import { salvarHistorico, RegistroHistorico } from "../../services/historicoService";
import { listarItens } from "../../services/itemService";
import type { Personagem, Item } from "../../types/domain";
import "../../styles/combate.css";

type OpcoesCampos = {
  vida: boolean;
  mana: boolean;
  xp: boolean;
  ouro: boolean;
  inventario: boolean;
  efeitos: boolean;
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
  const [itensCatalogo, setItensCatalogo] = useState<Item[]>([]);
  const [carregando, setCarregando] = useState(true);

  const aliados = (estado.combatentes || []).filter((c) => c.lado === "aliado");
  const inimigosDerrotados = (estado.combatentes || []).filter((c) => c.lado === "inimigo" && !c.vivo);

  // ─── Carregar dados ────────────────────────────────────────────────────────
  useEffect(() => {
    async function carregarDados() {
      const resItens = await listarItens();
      setItensCatalogo(Array.isArray(resItens) ? resItens : resItens.itens || []);

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
          inventario: true,
          efeitos: true,
          mortes: true,
        };
      }

      setPersonagensOriginais(originais);
      setOpcoes(opts);

      // Calcular recompensas totais
      let totalXP = 0;
      let totalOuro = 0;
      inimigosDerrotados.forEach((i: any) => {
        totalXP += i.experiencia || 0;
        totalOuro += i.drop?.ouro || 0;
      });
      setRecompensas({ xp: totalXP, ouro: totalOuro });
      setCarregando(false);
    }

    carregarDados();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      for (const combatente of aliados) {
        const pOriginal = personagensOriginais[combatente.id];
        if (!pOriginal) continue;

        const opt: OpcoesCampos = apenasSelecionados
          ? opcoes[combatente.id]
          : { vida: true, mana: true, xp: true, ouro: true, inventario: true, efeitos: true, mortes: true };

        const pAtualizado = { ...pOriginal };

        if (opt.vida) pAtualizado.vidaAtual = combatente.vidaAtual;
        if (opt.mana) pAtualizado.manaAtual = combatente.manaAtual;
        
        if (opt.mortes && !combatente.vivo) {
          pAtualizado.vidaAtual = 0;
        } else if (!opt.mortes && !combatente.vivo) {
          if (pAtualizado.vidaAtual <= 0) pAtualizado.vidaAtual = 1;
        }

        if (opt.xp && estado.status === "vitoria") {
          pAtualizado.xpAtual += recompensas.xp;
        }

        if (opt.ouro && estado.status === "vitoria") {
          pAtualizado.ouro = (pAtualizado.ouro ?? 0) + recompensas.ouro;
        }

        if (opt.efeitos) {
          pAtualizado.efeitosAtivos = combatente.efeitos;
        }

        if (opt.inventario && combatente.itensConsumidos && combatente.itensConsumidos.length > 0) {
          pAtualizado.inventario = (pOriginal.inventario || []).map(inv => {
            const consumido = combatente.itensConsumidos?.find((c: any) => c.itemId === inv.itemId);
            if (consumido) {
              return { ...inv, quantidade: Math.max(0, inv.quantidade - consumido.quantidade) };
            }
            return inv;
          }).filter(inv => inv.quantidade > 0);
        }

        await salvarPersonagem(pAtualizado);
      }

      // Salvar histórico
      const historico: RegistroHistorico = {
        data: new Date().toISOString(),
        participantes: estado.combatentes.map((c) => c.nome),
        vencedor: estado.status === "vitoria" ? "aliados" : (estado.status === "derrota" ? "inimigos" : "empate"),
        danos: (estado.danos || []).map(d => ({
          atacanteId: d.atacanteId,
          alvoId: d.alvoId,
          valor: d.valor
        })),
      };

      await salvarHistorico(historico);
      onClose();
    } catch (error) {
      console.error("Erro ao aplicar alterações:", error);
      alert("Erro ao salvar alterações.");
    } finally {
      setSalvando(false);
    }
  }

  function getNomeItem(itemId: string) {
    const item = itensCatalogo.find(i => String(i.id) === String(itemId));
    return item?.nome || `Item ${itemId}`;
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  if (carregando) {
    return (
      <div className="modalSobreposicao" style={{ zIndex: 1000 }}>
        <div className="modalConteudo resultadoCombate">
          <p style={{ textAlign: "center", padding: "2rem" }}>📊 Carregando resultados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modalSobreposicao" style={{ zIndex: 1000 }}>
      <div className="modalConteudo resultadoCombate">
        <h2 className={estado.status === "vitoria" ? "tituloVitoria" : "tituloDerrota"}>
          {estado.status === "vitoria" ? "✦ VITÓRIA ✦" : "✦ DERROTA ✦"}
        </h2>

        <div className="listaDifs">
          {aliados.map((c) => {
            const original = personagensOriginais[c.id];
            return (
              <div key={c.id} className="itemDif">
                <div className="infoCombatente">
                  <Image src={c.imagem} alt={c.nome} width={50} height={50} className="avatarMini" />
                  <div className="nomeCombatente">
                    <strong>{c.nome}</strong>
                    {!c.vivo && <span className="tagMorte"> ☠ MORTO</span>}
                  </div>
                </div>

                {original && (
                  <div className="diffsContainer">
                    <span>Vida: {original.vidaAtual} → {c.vidaAtual}</span>
                    <span>Mana: {original.manaAtual} → {c.manaAtual}</span>
                    {estado.status === "vitoria" && (
                      <>
                        <span>XP: +{recompensas.xp}</span>
                        <span>Ouro: +{recompensas.ouro}</span>
                      </>
                    )}
                    {c.itensConsumidos && c.itensConsumidos.length > 0 && (
                      <div className="consumidosBox">
                        <strong>Itens:</strong>
                        {c.itensConsumidos.map(item => (
                          <span key={item.itemId} className="tagConsumo">{getNomeItem(item.itemId)} x{item.quantidade}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {modoParc && (
                  <div className="gridChecks">
                    {Object.keys(opcoes[c.id]).map((campo) => (
                      <label key={campo} className="checkLabel">
                        <input
                          type="checkbox"
                          checked={(opcoes[c.id] as any)[campo]}
                          onChange={() => toggleOpcao(c.id, campo as keyof OpcoesCampos)}
                        />
                        {campo}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="modalAcoes">
          <button className="btnVoltar" onClick={onClose} disabled={salvando}>Cancelar</button>
          
          <div className="botoesDireita">
            <button 
              className={`btnSecundario ${modoParc ? "ativo" : ""}`}
              onClick={() => setModoParc(!modoParc)}
            >
              Aplicar parcialmente
            </button>

            {modoParc ? (
              <button className="btnPrimario" onClick={() => aplicarAlteracoes(true)} disabled={salvando}>
                Aplicar selecionados
              </button>
            ) : (
              <button className="btnPrimario" onClick={() => aplicarAlteracoes(false)} disabled={salvando}>
                Aplicar tudo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
