"use client";

import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  setDoc,
  query,
  limit,
  startAfter,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/config";

import itensData from "../data/sistema/itens.json";
import armasData from "../data/sistema/armas.json";
import armadurasData from "../data/sistema/armaduras.json";
import acessoriosData from "../data/sistema/acessorios.json";
import consumiveisData from "../data/sistema/consumiveis.json";
import type { Item, SlotEquipamento, EfeitoItem } from "../types/domain";

const COLECAO = "itens";
const ITENS_CACHE_KEY = "itens_cache";
const colecaoRef = collection(db, COLECAO);

export async function listarItens(ultimoDoc?: QueryDocumentSnapshot): Promise<{ itens: Item[], cursor?: QueryDocumentSnapshot }> {
  try {
    let q = query(colecaoRef, limit(50));
    if (ultimoDoc) {
      q = query(colecaoRef, startAfter(ultimoDoc), limit(50));
    }
    const snapshot = await getDocs(q);
    let itens = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Item[];
    const novoCursor = snapshot.docs[snapshot.docs.length - 1];

    // Seed se estiver vazio e não for paginação
    if (itens.length === 0 && !ultimoDoc) {
      console.log("Semeando itens no Firebase...");
      const todosPadrao = [
        ...itensData,
        ...armasData,
        ...armadurasData,
        ...acessoriosData,
        ...consumiveisData
      ];

      for (const item of todosPadrao) {
        const { id, ...dados } = item as any;
        await setDoc(doc(db, COLECAO, String(id)), dados);
      }
      
      const newSnapshot = await getDocs(colecaoRef);
      itens = newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Item[];
      return { itens: itens.map(normalizarItem), cursor: newSnapshot.docs[newSnapshot.docs.length - 1] };
    }

    if (typeof window !== "undefined" && !ultimoDoc) {
      localStorage.setItem(ITENS_CACHE_KEY, JSON.stringify(itens));
    }

    return { itens: itens.map(normalizarItem), cursor: novoCursor };
  } catch (error) {
    console.error("Erro ao listar itens:", error);
    if (typeof window !== "undefined" && !ultimoDoc) {
      const cache = localStorage.getItem(ITENS_CACHE_KEY);
      return { itens: cache ? JSON.parse(cache).map(normalizarItem) : [] };
    }
    return { itens: [] };
  }
}

export async function buscarItem(referencia: string | number | Partial<Item> | null): Promise<Item | null> {
  if (!referencia) return null;
  if (typeof referencia === "object") return normalizarItem(referencia);

  const id = String(referencia);

  // Tentar cache local primeiro para performance
  if (typeof window !== "undefined") {
    const cache = localStorage.getItem(ITENS_CACHE_KEY);
    if (cache) {
      const itens = JSON.parse(cache);
      const encontrado = itens.find((i: any) => String(i.id) === id);
      if (encontrado) return normalizarItem(encontrado);
    }
  }

  try {
    const docSnap = await getDoc(doc(db, COLECAO, id));
    if (docSnap.exists()) {
      return normalizarItem({ id: docSnap.id, ...docSnap.data() });
    }
  } catch (error) {
    console.error("Erro ao buscar item no Firebase:", error);
  }

  return null;
}

export function resolverInventario(inventario: { itemId: string }[]): Item[] {
  // Síncrono usando cache
  const cache = typeof window !== "undefined" ? localStorage.getItem(ITENS_CACHE_KEY) : null;
  const itens = cache ? JSON.parse(cache).map(normalizarItem) : [];
  
  return (inventario ?? [])
    .map((invItem) => itens.find((i: Item) => String(i.id) === String(invItem.itemId)))
    .filter((item): item is Item => !!item);
}

export function resolverEquipados(equipados: Partial<Record<SlotEquipamento, string | number | null>>): Record<SlotEquipamento, Item | null> {
  const slots: SlotEquipamento[] = [
    "arma", "armaSecundaria", "escudo", "armadura", "capacete", "luvas", 
    "botas", "anel1", "anel2", "colar", "acessorio", "bolsa"
  ];
  
  const cache = typeof window !== "undefined" ? localStorage.getItem(ITENS_CACHE_KEY) : null;
  const itens = cache ? JSON.parse(cache).map(normalizarItem) : [];
  
  const resultado: Record<SlotEquipamento, Item | null> = {} as any;

  slots.forEach((slot) => {
    const id = equipados?.[slot];
    resultado[slot] = id ? (itens.find((i: Item) => String(i.id) === String(id)) || null) : null;
  });

  return resultado;
}

export async function salvarItem(dados: Partial<Item>) {
  try {
    const docRef = await addDoc(colecaoRef, dados);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao salvar item:", error);
    throw error;
  }
}

export async function editarItem(id: string, dados: Partial<Item>) {
  try {
    await updateDoc(doc(db, COLECAO, id), dados);
  } catch (error) {
    console.error("Erro ao editar item:", error);
    throw error;
  }
}

export async function excluirItem(id: string) {
  try {
    await deleteDoc(doc(db, COLECAO, id));
  } catch (error) {
    console.error("Erro ao excluir item:", error);
    throw error;
  }
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
    case "Espada": case "Machado": case "Adaga": case "Cajado": case "Arco": case "Arma": return "arma";
    case "Escudo": return "escudo";
    case "Armadura": case "Peitoral": return "armadura";
    case "Capacete": case "Elmo": return "capacete";
    case "Luvas": case "Manoplas": return "luvas";
    case "Botas": case "Sapato": return "botas";
    case "Anel": return "anel1";
    case "Colar": case "Amuleto": return "colar";
    case "Acessório": return "acessorio";
    case "Bolsa": case "Mochila": return "bolsa";
    default: return "";
  }
}

function subtipoPorSlot(slot: SlotEquipamento): string {
  switch (slot) {
    case "arma": return "Arma";
    case "armadura": return "Armadura";
    case "acessorio": return "Acessório";
    default: return "Diversos";
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
  return [];
}
