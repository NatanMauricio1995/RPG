"use client";

import itensData from "../data/sistema/itens.json";
import armasData from "../data/sistema/armas.json";
import armadurasData from "../data/sistema/armaduras.json";
import acessoriosData from "../data/sistema/acessorios.json";
import consumiveisData from "../data/sistema/consumiveis.json";
import { getStorageItem, STORAGE_KEYS } from "../utils/storage";
import type { Item, SlotEquipamento, EfeitoItem } from "../types/domain";

const ITENS_STORAGE_KEY = STORAGE_KEYS.ITENS;

export function listarItens(): Item[] {
  const personalizados = getStorageItem<Item[]>(ITENS_STORAGE_KEY, []);

  const todos: any[] = [
    ...(itensData as any[]),
    ...(armasData as any[]),
    ...(armadurasData as any[]),
    ...(acessoriosData as any[]),
    ...(consumiveisData as any[]),
    ...personalizados,
  ];

  const porId = new Map<string, Item>();

  todos.forEach((item) => {
    const itemNormalizado = normalizarItem(item);
    porId.set(itemNormalizado.id, itemNormalizado);
  });

  return Array.from(porId.values());
}

export function buscarItem(referencia: string | number | Partial<Item> | null): Item | null {
  if (!referencia) return null;

  if (typeof referencia === "object") return normalizarItem(referencia);

  const id = String(referencia);
  return listarItens().find((item) => String(item.id) === id) ?? null;
}

export function resolverInventario(inventario: { itemId: string }[]): Item[] {
  return (inventario ?? [])
    .map((invItem) => buscarItem(invItem.itemId))
    .filter((item): item is Item => item !== null);
}

export function resolverEquipados(equipados: Partial<Record<SlotEquipamento, string | number | null>>): Record<SlotEquipamento, Item | null> {
  const slots: SlotEquipamento[] = [
    "arma",
    "armaSecundaria",
    "escudo",
    "armadura",
    "capacete",
    "luvas",
    "botas",
    "anel1",
    "anel2",
    "colar",
    "acessorio",
    "bolsa",
  ];
  const resultado: Record<SlotEquipamento, Item | null> = {} as Record<SlotEquipamento, Item | null>;

  slots.forEach((slot) => {
    resultado[slot] = buscarItem(equipados?.[slot] ?? null);
  });

  return resultado;
}

export function normalizarItem(item: Partial<Item>): Item {
  const slot = (item.slot ?? slotPorSubtipo(item.subtipo ?? "")) as SlotEquipamento;

  return {
    ...item,
    id: String(item.id),
    slot,
    tipo: item.tipo ?? (slot ? "Equipamento" : "Diversos"),
    subtipo: item.subtipo ?? subtipoPorSlot(slot),
    raridade: item.raridade ?? "Comum",
    peso: item.peso ?? 0,
    bonus: { ...(item.bonus ?? {}) },
    efeitos: normalizarEfeitos(item),
  } as Item;
}

function slotPorSubtipo(subtipo: string): SlotEquipamento {
  switch (subtipo) {
    case "Espada":
    case "Machado":
    case "Adaga":
    case "Cajado":
    case "Arco":
    case "Arma":
      return "arma";
    case "Escudo":
      return "escudo";
    case "Armadura":
    case "Peitoral":
      return "armadura";
    case "Capacete":
    case "Elmo":
      return "capacete";
    case "Luvas":
    case "Manoplas":
      return "luvas";
    case "Botas":
    case "Sapato":
      return "botas";
    case "Anel":
      return "anel1";
    case "Colar":
    case "Amuleto":
      return "colar";
    case "Acessório":
      return "acessorio";
    case "Bolsa":
    case "Mochila":
      return "bolsa";
    default:
      return "";
  }
}

export function equiparItem(personagem: any, itemId: string): any {
  const item = buscarItem(itemId);
  if (!item || item.tipo !== "Equipamento") return personagem;

  const novoInventario = [...(personagem.inventario || [])];
  const itemNoInv = novoInventario.find((i) => i.itemId === itemId);

  if (!itemNoInv) return personagem;

  const slot = item.slot || slotPorSubtipo(item.subtipo);
  if (!slot) return personagem;

  // Desequipar o que estiver no slot (e slots conflitantes como anéis)
  let slotReal: string = slot;
  if (slot === "anel1") {
    // Tenta o anel 1, se ocupado, tenta o 2
    if (personagem.equipados.anel1 && !personagem.equipados.anel2) {
      slotReal = "anel2";
    }
  }

  const itemAnteriorId = (personagem.equipados as any)[slotReal];

  const novoEquipados = {
    ...personagem.equipados,
    [slotReal]: itemId,
  };

  // Atualizar flags no inventário
  const inventarioFinal = novoInventario.map((i) => {
    if (i.itemId === itemId) return { ...i, equipado: true };
    if (i.itemId === itemAnteriorId) return { ...i, equipado: false };
    return i;
  });

  return {
    ...personagem,
    inventario: inventarioFinal,
    equipados: novoEquipados,
  };
}

export function desequiparItem(personagem: any, itemId: string): any {
  const novoEquipados = { ...personagem.equipados };
  let encontrou = false;

  Object.keys(novoEquipados).forEach((slot) => {
    if ((novoEquipados as any)[slot] === itemId) {
      (novoEquipados as any)[slot] = null;
      encontrou = true;
    }
  });

  if (!encontrou) return personagem;

  const novoInventario = (personagem.inventario || []).map((i: any) => {
    if (i.itemId === itemId) return { ...i, equipado: false };
    return i;
  });

  return {
    ...personagem,
    inventario: novoInventario,
    equipados: novoEquipados,
  };
}


function subtipoPorSlot(slot: SlotEquipamento): string {
  switch (slot) {
    case "arma":
      return "Arma";
    case "armadura":
      return "Armadura";
    case "acessorio":
      return "Acessório";
    case "municao":
      return "Munição";
    default:
      return "Diversos";
  }
}

function normalizarEfeitos(item: Partial<Item>): EfeitoItem[] {
  if (Array.isArray(item.efeitos)) {
    return item.efeitos.map((efeito) => ({
      tipo: String(efeito.tipo ?? "").toLowerCase(),
      valor: Number(efeito.valor ?? 0),
      duracao: Number(efeito.duracao ?? 3),
    }));
  }

  if (typeof item.efeito === "string") {
    const cura = item.efeito.match(/(\d+)/);

    if (item.efeito.toLowerCase().includes("vida") && cura) {
      return [
        {
          tipo: "cura",
          valor: Number(cura[1]),
          duracao: 1,
        },
      ];
    }
  }

  return [];
}
