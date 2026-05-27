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

let _cacheItens: Item[] | null = null;

export async function listarItens(tipo?: string, ultimoDoc?: QueryDocumentSnapshot): Promise<{ itens: Item[], cursor?: QueryDocumentSnapshot }> {
  if (_cacheItens && !tipo && !ultimoDoc) return { itens: _cacheItens };

  try {
    const { queryPaginada } = await import("../firebase/firestore");
    const { where, orderBy } = await import("firebase/firestore");
    
    const filtros: any[] = [];
    if (tipo) filtros.push(where("tipo", "==", tipo));
    filtros.push(orderBy("nome"));

    const { dados, proximoCursor } = await queryPaginada<Item>(COLECAO, filtros, 20, ultimoDoc);
    let itens = dados;

    // Seed se estiver vazio e não for paginação nem filtro
    if (itens.length === 0 && !ultimoDoc && !tipo) {
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
      
      const res = await queryPaginada<Item>(COLECAO, [orderBy("nome")], 20);
      itens = res.dados;
      _cacheItens = itens.map(normalizarItem);
      return { itens: _cacheItens, cursor: res.proximoCursor || undefined };
    }

    const itensNormalizados = itens.map(normalizarItem);

    if (!tipo && !ultimoDoc) {
      _cacheItens = itensNormalizados;
      if (typeof window !== "undefined") {
        localStorage.setItem(ITENS_CACHE_KEY, JSON.stringify(itensNormalizados));
      }
    }

    return { itens: itensNormalizados, cursor: proximoCursor || undefined };
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

// ─── Gerenciamento de Inventário (Persistência) ──────────────────────────────

/**
 * Função utilitária para buscar e atualizar personagem sem dependência circular
 */
async function atualizarInventarioBase(
  personagemId: string | number, 
  callback: (inventario: any[]) => any[]
) {
  const idStr = String(personagemId);
  const docRef = doc(db, "personagens", idStr);
  const snap = await getDoc(docRef);
  
  if (!snap.exists()) throw new Error("Personagem não encontrado");
  
  const personagem = snap.data();
  const novoInventario = callback(personagem.inventario || []);
  
  await updateDoc(docRef, { inventario: novoInventario });
  return { ...personagem, id: idStr, inventario: novoInventario };
}

export async function adicionarItem(personagemId: string | number, itemId: string, quantidade: number = 1) {
  return await atualizarInventarioBase(personagemId, (inv) => {
    const novo = [...inv];
    const index = novo.findIndex((i) => String(i.itemId) === String(itemId));
    
    if (index >= 0) {
      novo[index].quantidade += quantidade;
    } else {
      novo.push({ itemId: String(itemId), quantidade, equipado: false });
    }
    return novo;
  });
}

export async function removerItem(personagemId: string | number, itemId: string) {
  return await atualizarInventarioBase(personagemId, (inv) => {
    return inv.filter((i) => String(i.itemId) !== String(itemId));
  });
}

export async function alterarQuantidade(personagemId: string | number, itemId: string, delta: number) {
  return await atualizarInventarioBase(personagemId, (inv) => {
    const novo = [...inv];
    const index = novo.findIndex((i) => String(i.itemId) === String(itemId));
    
    if (index >= 0) {
      novo[index].quantidade += delta;
      if (novo[index].quantidade <= 0) {
        return novo.filter((i) => String(i.itemId) !== String(itemId));
      }
    }
    return novo;
  });
}

export async function consumirItem(personagemId: string | number, itemId: string) {
  return await alterarQuantidade(personagemId, itemId, -1);
}

export async function equiparItem(personagemId: string | number, itemId: string) {
  return await atualizarInventarioBase(personagemId, (inv) => {
    return inv.map((i) => 
      String(i.itemId) === String(itemId) ? { ...i, equipado: true } : i
    );
  });
}

export async function desequiparItem(personagemId: string | number, itemId: string) {
  return await atualizarInventarioBase(personagemId, (inv) => {
    return inv.map((i) => 
      String(i.itemId) === String(itemId) ? { ...i, equipado: false } : i
    );
  });
}

/**
 * Valida se um personagem pode equipar um item específico
 */
export function validarEquipamento(
  personagem: PersonagemCompleto, 
  item: Item
): { valido: boolean; motivo?: string } {
  // 1. Nível Mínimo
  const nivelMin = item.nivelMinimo || 1;
  if (nivelMin > personagem.nivel) {
    return { valido: false, motivo: `Nível insuficiente (Requer: ${nivelMin})` };
  }

  // 2. Raças Permitidas (se vazio, todos podem)
  const racas = (item as any).racasPermitidas || [];
  if (racas.length > 0 && !racas.includes(personagem.racaId)) {
    return { valido: false, motivo: "Sua raça não possui treinamento com este item." };
  }

  // 3. Classes Permitidas (se vazio, todos podem)
  const classes = (item as any).classesPermitidas || [];
  if (classes.length > 0 && !classes.includes(personagem.classeId)) {
    return { valido: false, motivo: "Sua classe não pode equipar este item." };
  }

  // 4. Regra Especial: Magos não podem usar armaduras pesadas
  const classeNome = (personagem.classeDados?.nome || "").toLowerCase();
  const subtipoItem = (item.subtipo || "").toLowerCase();
  if (classeNome === "mago" && subtipoItem === "pesada") {
    return { valido: false, motivo: "Magos não podem equipar armaduras do tipo 'pesada'." };
  }

  // 5. Slot válido
  if (!item.slot) {
    return { valido: false, motivo: "Este item não é um equipamento válido para slots." };
  }

  return { valido: true };
}
