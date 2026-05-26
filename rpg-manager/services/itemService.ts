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

  const todos: Item[] = [
    ...(itensData as Item[]),
    ...(armasData as Item[]),
    ...(armadurasData as Item[]),
    ...(acessoriosData as Item[]),
    ...(consumiveisData as Item[]),
    ...personalizados,
  ];

  const porId = new Map<number, Item>();

  todos.forEach((item) => {
    porId.set(Number(item.id), normalizarItem(item));
  });

  return Array.from(porId.values());
}

export function buscarItem(referencia: number | Partial<Item> | null): Item | null {
  if (!referencia) return null;

  if (typeof referencia === "object") return normalizarItem(referencia);

  const id = Number(referencia);
  return listarItens().find((item) => Number(item.id) === id) ?? null;
}

export function resolverInventario(inventario: { itemId: number }[]): Item[] {
  return (inventario ?? [])
    .map((invItem) => buscarItem(invItem.itemId))
    .filter((item): item is Item => item !== null);
}

export function resolverEquipados(equipados: Partial<Record<SlotEquipamento, number | null>>): Record<SlotEquipamento, Item | null> {
  const slots: SlotEquipamento[] = ["cabeca", "arma", "escudo", "armadura", "cintura", "acessorio", "bolsa", "municao"];
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
    id: Number(item.id),
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
    case "Arma":
    case "Arma Mágica":
      return "arma";
    case "Armadura":
      return "armadura";
    case "Acessório":
      return "acessorio";
    case "Munição":
      return "municao";
    default:
      return "";
  }
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
