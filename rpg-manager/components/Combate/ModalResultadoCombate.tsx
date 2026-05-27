"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import type { EstadoCombat as EstadoCombateType } from "../../services/combateService";
import { buscarPersonagem, salvarPersonagem } from "../../services/personagemService";
import { salvarHistoricoCombate, HistoricoCombate } from "../../services/historicoService";
import { listarItens } from "../../services/itemService";
import type { Personagem, Item } from "../../types/domain";
import "../../styles/combate.css";

// Para evitar erro de tipagem se EstadoCombate não for exportado corretamente
type EstadoCombate = any;

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
  const [itensCatalogo, setItensCatalogo] = useState<Item[]>([]);
  const [carregando, setCarregando] = useState(true);

  const aliados = (estado.combatentes || []).filter((c: any) => c.lado === "aliado");
  const inimigosDerrotados = (estado.combatentes || []).filter((c: any) => c.lado === "inimigo" && !c.vivo);

  // ─── Carregar dados ────────────────────────────────────────────────────────
  useEffect(() => {
    async function carregarDados() {
      const [itens] = await Promise.all([
        listarItens(),
      ]);
      setItensCatalogo(itens);

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
      const xpDistribuido:   { personagemId: string; valor: number }[] = [];
      const ouroDistribuido: { personagemId: string; valor: number }[] = [];
      const itensConsumidosGlobal: { personagemId: string; itemId: string; quantidade: number }[] = [];

      for (const combatente of aliados) {
        const pOriginal = personagensOriginais[combatente.id];
        if (!pOriginal) continue;

        const opt: OpcoesCampos = apenasSelecionados
          ? opcoes[combatente.id]
          : { vida: true, mana: true, xp: true, ouro: true, efeitos: true, inventario: true, mortes: true };

        const pAtualizado = { ...pOriginal };

        // Aplicar Vida
        if (opt.vida) {
          pAtualizado.vidaAtual = combatente.vidaAtual;
        }

        // Aplicar Mana
        if (opt.mana) {
          pAtualizado.manaAtual = combatente.manaAtual;
        }

        // Aplicar Morte ou Ignorar
        if (opt.mortes && !combatente.vivo) {
          pAtualizado.vidaAtual = 0;
        } else if (!opt.mortes && !combatente.vivo) {
          // Ignorar morte: se vida ia ser 0 ou menos, garantir pelo menos 1
          if (pAtualizado.vidaAtual <= 0) {
            pAtualizado.vidaAtual = 1;
          }
        }

        // XP e Ouro
        if (opt.xp && estado.status === "vitoria") {
          pAtualizado.xpAtual += recompensas.xp;
          xpDistribuido.push({ personagemId: String(pOriginal.id), valor: recompensas.xp });
        }

        if (opt.ouro && estado.status === "vitoria") {
          pAtualizado.ouro = (pAtualizado.ouro ?? 0) + recompensas.ouro;
          ouroDistribuido.push({ personagemId: String(pOriginal.id), valor: recompensas.ouro });
        }

        // Efeitos
        if (opt.efeitos) {
          pAtualizado.efeitosAtivos = combatente.efeitos;
        }

        // Inventário
        if (opt.inventario && combatente.itensConsumidos && combatente.itensConsumidos.length > 0) {
          pAtualizado.inventario = (pOriginal.inventario || []).map(inv => {
            const consumido = combatente.itensConsumidos?.find((c: any) => c.itemId === inv.itemId);
            if (consumido) {
              itensConsumidosGlobal.push({ 
                personagemId: String(pOriginal.id), 
                itemId: inv.itemId, 
                quantidade: consumido.quantidade 
              });
              return { ...inv, quantidade: Math.max(0, inv.quantidade - consumido.quantidade) };
            }
            return inv;
          }).filter(inv => inv.quantidade > 0);
        }

        await salvarPersonagem(pAtualizado);
      }

      // Salvar histórico
      const historico: Omit<HistoricoCombate, "id"> = {
        data: new Date().toISOString(),
        participantes: estado.combatentes.map((c: any) => c.nome),
        vencedor: estado.status === "vitoria" ? "Aliados" : "Inimigos",
        derrotados: estado.combatentes.filter((c: any) => !c.vivo).map((c: any) => c.nome),
        xpDistribuido,
        ouroDistribuido,
        itensConsumidos: itensConsumidosGlobal,
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
    const cor = delta >= 0 ? "#4caf50" : "#f44336";
    if (delta === 0) return <span className="diffItem">{label}: {antes}</span>;
    return (
      <span className="diffItem">
        {label}: {antes} → {depois}{" "}
        <span style={{ color: cor, fontWeight: "bold" }}>
          ({delta > 0 ? "+" : ""}{delta})
        </span>
      </span>
    );
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

        {estado.status === "vitoria" && (
          <div className="recompensasGerais">
            <span className="recompensaXP">⭐ XP: +{recompensas.xp}</span>
            <span className="recompensaOuro">💰 Ouro: +{recompensas.ouro}</span>
          </div>
        )}

        <div className="modoParcialContainer">
          <button
            className={`btnToggleParcial ${modoParc ? "ativo" : ""}`}
            onClick={() => setModoParc(!modoParc)}
          >
            {modoParc ? "⚙️ Customizar Persistência (Ativado)" : "⚙️ Customizar Persistência"}
          </button>
          <p className="legendaParcial">
            {modoParc 
              ? "Escolha exatamente quais alterações salvar no Firebase." 
              : "Todas as alterações de vida, mana, XP e itens serão salvas."}
          </p>
        </div>

        <div className="listaDifs">
          {aliados.map((c: any) => {
            const original = personagensOriginais[c.id];
            return (
              <div key={c.id} className="itemDif">
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
                    {!c.vivo && <span className="tagMorte"> ☠ MORTO</span>}
                  </div>
                </div>

                {original && (
                  <div className="diffsContainer">
                    <div className="gridDiffs">
                      <Diff label="Vida" antes={original.vidaAtual} depois={c.vidaAtual} />
                      <Diff label="Mana" antes={original.manaAtual} depois={c.manaAtual} />
                      {estado.status === "vitoria" && (
                        <>
                          <Diff label="XP" antes={original.xpAtual} depois={original.xpAtual + recompensas.xp} />
                          <Diff label="Ouro" antes={original.ouro ?? 0} depois={(original.ouro ?? 0) + recompensas.ouro} />
                        </>
                      )}
                    </div>

                    {c.itensConsumidos && c.itensConsumidos.length > 0 && (
                      <div className="consumidosBox">
                        <span className="tituloConsumidos">🧪 Itens usados:</span>
                        <div className="tagsConsumidos">
                          {c.itensConsumidos.map((item: any) => (
                            <span key={item.itemId} className="tagConsumo">
                              {getNomeItem(item.itemId)} x{item.quantidade}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {modoParc && opcoes[c.id] && (
                  <div className="gridChecks">
                    {Object.keys(opcoes[c.id]).map((campo) => (
                      <label key={campo} className="checkLabel">
                        <input
                          type="checkbox"
                          checked={(opcoes[c.id] as any)[campo]}
                          onChange={() => toggleOpcao(c.id, campo as keyof OpcoesCampos)}
                        />
                        <span>{campo.charAt(0).toUpperCase() + campo.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="modalAcoes">
          <button className="btnVoltar" onClick={onClose} disabled={salvando}>
            Descartar Tudo
          </button>
          <div className="botoesDireita">
            {modoParc && (
              <button
                className="btnSalvarParcial"
                onClick={() => aplicarAlteracoes(true)}
                disabled={salvando}
              >
                Aplicar Selecionados
              </button>
            )}
            <button
              className="btnSalvarTudo"
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
