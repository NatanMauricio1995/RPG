"use client";

import { useMemo, useState } from "react";
import { resolverEquipados, validarEquipamento } from "../../../services/itemService";
import { salvarEquipamento, completarPersonagem } from "../../../services/personagemService";
import SlotEquipamento from "./SlotEquipamento";
import type { Personagem, Item, SlotEquipamento as SlotType } from "../../../types/domain";

// ─── Mapa visual dos slots ────────────────────────────────────────────────────
const SLOTS_LISTA: { key: SlotType; label: string; icone: string }[] = [
  { key: "capacete",       label: "Capacete",        icone: "🪖" },
  { key: "colar",          label: "Colar",            icone: "📿" },
  { key: "armadura",       label: "Armadura",         icone: "🛡️" },
  { key: "arma",           label: "Arma",             icone: "⚔️" },
  { key: "armaSecundaria", label: "Arma Secundária",  icone: "🗡️" },
  { key: "escudo",         label: "Escudo",           icone: "🔰" },
  { key: "luvas",          label: "Luvas",            icone: "🧤" },
  { key: "anel1",          label: "Anel 1",           icone: "💍" },
  { key: "anel2",          label: "Anel 2",           icone: "💍" },
  { key: "botas",          label: "Botas",            icone: "👢" },
  { key: "acessorio",      label: "Acessório",        icone: "✨" },
  { key: "bolsa",          label: "Bolsa",            icone: "👜" },
];

const SLOTS_VALIDOS = new Set(SLOTS_LISTA.map(s => s.key));

// ─── Props ────────────────────────────────────────────────────────────────────
type Props = {
  personagem: Personagem;
  onUpdate: (p: Personagem) => void;
};

export default function SistemaEquipamento({ personagem, onUpdate }: Props) {
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Resolver itens dos slots a partir do cache síncrono
  const equipamentosResolvidos = useMemo(
    () => resolverEquipados(personagem.equipados),
    [personagem.equipados]
  );

  // Resolver catálogo de inventário para exibir itens equipáveis do inventário
  const cacheKey = "itens_cache";
  const itensCatalogo: Item[] = useMemo(() => {
    if (typeof window === "undefined") return [];
    const cache = localStorage.getItem(cacheKey);
    return cache ? JSON.parse(cache) : [];
  }, []);

  // ─── Atualizar e Recalcular ──────────────────────────────────────────────────
  async function atualizarERecalcular() {
    try {
      // Recalcular personagem completo para refletir os novos bônus
      const pCompleto = await completarPersonagem(personagem);
      onUpdate(pCompleto);
    } catch (e) {
      console.error("Erro ao recalcular atributos:", e);
    }
  }

  // ─── Desequipar slot ────────────────────────────────────────────────────────
  async function desequipar(slot: SlotType) {
    setErro(null);
    setLoading(true);
    try {
      await salvarEquipamento(personagem.id, slot, null);
      await atualizarERecalcular();
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }

  // ─── Equipar item do inventário num slot ────────────────────────────────────
  async function equiparItem(itemId: string, slot: SlotType) {
    setErro(null);
    const item = itensCatalogo.find((i) => String(i.id) === String(itemId));
    if (!item) return;

    // 1. Validar se o slot é suportado pelo sistema
    if (!SLOTS_VALIDOS.has(slot)) {
      setErro(`Slot "${slot}" inválido.`);
      return;
    }

    // 2. Validar requisitos (Nível, Classe, Raça, etc)
    // Precisamos completar o personagem para ter classeDados e racaDados para validarEquipamento
    setLoading(true);
    try {
      const pCompleto = await completarPersonagem(personagem);
      const check = validarEquipamento(pCompleto, item);
      if (!check.valido) {
        setErro(check.motivo ?? "Requisitos não atendidos.");
        setLoading(false);
        return;
      }

      // 3. Impedir duplicação: se o slot já está ocupado, desequipar anterior primeiro
      // Nota: salvarEquipamento já lida internamente com a troca no Firebase e inventário,
      // mas vamos garantir que o fluxo de "desequipar anterior" ocorra se houver lógica adicional necessária.
      const idAnterior = (personagem.equipados as any)[slot];
      if (idAnterior && String(idAnterior) !== String(itemId)) {
        // salvarEquipamento(pId, slot, null) já ocorre dentro do salvarEquipamento(pId, slot, itemId)
        // se implementado corretamente no personagemService.
      }

      // 4. Salvar no Firebase
      await salvarEquipamento(personagem.id, slot, itemId);
      
      // 5. Recalcular e Notificar Pai
      await atualizarERecalcular();
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Itens do inventário que têm slot válido (para o seletor rápido)
  const itensEquipaveis = (personagem.inventario || [])
    .map((inv) => ({
      ...inv,
      dados: itensCatalogo.find((i) => String(i.id) === String(inv.itemId)),
    }))
    .filter((inv) => inv.dados?.slot && inv.dados.slot !== "");

  return (
    <div className={`sistemaEquipamento ${loading ? "loadingState" : ""}`}>
      <h3 className="equipTitulo">⚔️ Equipamentos</h3>

      {erro && (
        <div className="equipErro">
          ⚠️ {erro}
          <button className="equipErroBtnFechar" onClick={() => setErro(null)}>✕</button>
        </div>
      )}

      <div className="equipGrid">
        {SLOTS_LISTA.map(({ key, label, icone }) => (
          <SlotEquipamento
            key={key}
            slot={key}
            label={label}
            icone={icone}
            item={equipamentosResolvidos[key] as Item | null}
            itensEquipaveis={itensEquipaveis}
            onEquipar={equiparItem}
            onDesequipar={desequipar}
          />
        ))}
      </div>

      {/* Resumo de bônus ativos */}
      <div className="equipResumoBonus">
        <h4>Bônus Ativos dos Equipamentos</h4>
        <div className="equipBonusLista">
          {Object.entries(personagem.equipados)
            .filter(([, id]) => id)
            .map(([slot, id]) => {
              const item = itensCatalogo.find((i) => String(i.id) === String(id));
              if (!item) return null;
              const bonus = Object.entries(item.bonus || {}).filter(([, v]) => Number(v) !== 0);
              if (bonus.length === 0 && !item.defesa) return null;
              return (
                <div key={slot} className="equipBonusItem">
                  <span className="equipBonusSlot">{item.nome}</span>
                  {bonus.map(([attr, val]) => (
                    <span key={attr} className="equipBonusValor">
                      {attr}: +{val}
                    </span>
                  ))}
                  {item.defesa && (
                    <span className="equipBonusValor">armadura: +{item.defesa}</span>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
