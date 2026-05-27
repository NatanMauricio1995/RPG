"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { resolverEquipados } from "../../../services/itemService";
import { salvarPersonagem } from "../../../services/personagemService";
import type { Personagem, Item, Equipados, SlotEquipamento } from "../../../types/domain";

// ─── Mapa visual dos slots ────────────────────────────────────────────────────
const SLOTS: { key: SlotEquipamento; label: string; icone: string }[] = [
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
  async function desequipar(slot: SlotEquipamento) {
    setErro(null);
    const itemId = personagem.equipados[slot];
    if (!itemId) return;

    // Atualiza inventário: marca equipado=false
    const novoInventario = (personagem.inventario || []).map((inv) =>
      String(inv.itemId) === String(itemId) ? { ...inv, equipado: false } : inv
    );

    const novosEquipados: Equipados = { ...personagem.equipados, [slot]: null };
    const pAtualizado = { ...personagem, inventario: novoInventario, equipados: novosEquipados };
    await salvarPersonagem(pAtualizado);
    onUpdate(pAtualizado);
  }

  // ─── Equipar item do inventário num slot ────────────────────────────────────
  async function equiparItem(itemId: string, slot: SlotEquipamento) {
    setErro(null);
    const item = itensCatalogo.find((i) => String(i.id) === String(itemId));
    if (!item) return;

    const check = verificarRequisitos(item, personagem);
    if (!check.pode) {
      setErro(check.motivo ?? "Requisitos não atendidos.");
      return;
    }

    // Desequipar item que estava no slot antes
    const idAnterior = personagem.equipados[slot];
    const novoInventario = (personagem.inventario || []).map((inv) => {
      if (String(inv.itemId) === String(itemId)) return { ...inv, equipado: true };
      if (idAnterior && String(inv.itemId) === String(idAnterior)) return { ...inv, equipado: false };
      return inv;
    });

    const novosEquipados: Equipados = { ...personagem.equipados, [slot]: itemId };
    const pAtualizado = { ...personagem, inventario: novoInventario, equipados: novosEquipados };
    await salvarPersonagem(pAtualizado);
    onUpdate(pAtualizado);
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
        {SLOTS.map(({ key, label, icone }) => {
          const item = equipamentosResolvidos[key] as Item | null;

          return (
            <div key={key} className={`equipSlot ${item ? "equipSlotOcupado" : "equipSlotVazio"}`}>
              <span className="equipSlotLabel">{icone} {label}</span>

              {item ? (
                <div className="equipItemOcupado">
                  <Image
                    src={item.imagem || "/imagens/itens/padrao.png"}
                    alt={item.nome}
                    width={40}
                    height={40}
                    className="equipItemImagem"
                  />
                  <span className="equipItemNome">{item.nome}</span>
                  <button
                    className="btnRetirar"
                    onClick={() => desequipar(key)}
                    title="Retirar"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="equipSlotSelectWrapper">
                  <select
                    className="equipSlotSelect"
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) equiparItem(e.target.value, key);
                      e.target.value = "";
                    }}
                  >
                    <option value="">— slot vazio —</option>
                    {itensEquipaveis
                      .filter(
                        (inv) =>
                          inv.dados?.slot === key ||
                          (key === "anel2" && inv.dados?.slot === "anel1")
                      )
                      .map((inv) => (
                        <option key={inv.itemId} value={inv.itemId}>
                          {inv.dados?.nome ?? inv.itemId}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          );
        })}
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
