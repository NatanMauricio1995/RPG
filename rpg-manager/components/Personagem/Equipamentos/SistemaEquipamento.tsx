"use client";

import { useMemo, useState } from "react";
import { resolverEquipados } from "../../../services/itemService";
import { salvarEquipamento } from "../../../services/personagemService";
import SlotEquipamento from "./SlotEquipamento";
import type { Personagem, Item, SlotEquipamento as SlotType } from "../../../types/domain";

// ─── Mapa visual dos slots ────────────────────────────────────────────────────
const SLOTS: { key: SlotType; label: string; icone: string }[] = [
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

// ─── Verificação de requisitos ────────────────────────────────────────────────
function verificarRequisitos(
  item: Item,
  personagem: Personagem
): { pode: boolean; motivo?: string } {
  const req = item.requisitos;
  if (!req) return { pode: true };

  if (req.nivel && personagem.nivel < req.nivel) {
    return { pode: false, motivo: `Nível mínimo: ${req.nivel} (você tem ${personagem.nivel})` };
  }
  if (req.classeId && String(personagem.classeId) !== String(req.classeId)) {
    return { pode: false, motivo: "Sua classe não pode usar este item." };
  }
  if (req.racaId && String(personagem.racaId) !== String(req.racaId)) {
    return { pode: false, motivo: "Sua raça não pode usar este item." };
  }

  const atributos = (personagem as any).atributos ?? personagem.atributosBase;
  const atrs = ["forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma"] as const;
  for (const attr of atrs) {
    const minimo = (req as any)[attr];
    if (minimo && atributos[attr] < minimo) {
      return {
        pode: false,
        motivo: `${attr} mínimo: ${minimo} (você tem ${atributos[attr]})`,
      };
    }
  }

  return { pode: true };
}

// ─── Props ────────────────────────────────────────────────────────────────────
type Props = {
  personagem: Personagem;
  onUpdate: (p: Personagem) => void;
};

export default function SistemaEquipamento({ personagem, onUpdate }: Props) {
  const [erro, setErro] = useState<string | null>(null);

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

  // ─── Desequipar slot ────────────────────────────────────────────────────────
  async function desequipar(slot: SlotType) {
    setErro(null);
    try {
      await salvarEquipamento(personagem.id, slot, null);
      // O onUpdate será chamado pelo hook usePersonagem no componente pai
      // mas se quisermos feedback imediato poderíamos atualizar o estado local se necessário.
    } catch (e: any) {
      setErro(e.message);
    }
  }

  // ─── Equipar item do inventário num slot ────────────────────────────────────
  async function equiparItem(itemId: string, slot: SlotType) {
    setErro(null);
    const item = itensCatalogo.find((i) => String(i.id) === String(itemId));
    if (!item) return;

    const check = verificarRequisitos(item, personagem);
    if (!check.pode) {
      setErro(check.motivo ?? "Requisitos não atendidos.");
      return;
    }

    try {
      await salvarEquipamento(personagem.id, slot, itemId);
    } catch (e: any) {
      setErro(e.message);
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
    <div className="sistemaEquipamento">
      <h3 className="equipTitulo">⚔️ Equipamentos</h3>

      {erro && (
        <div className="equipErro">
          ⚠️ {erro}
          <button className="equipErroBtnFechar" onClick={() => setErro(null)}>✕</button>
        </div>
      )}

      <div className="equipGrid">
        {SLOTS.map(({ key, label, icone }) => (
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
