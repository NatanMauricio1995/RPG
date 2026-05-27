"use client";

import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc,
  getDoc,
  query,
  limit
} from "firebase/firestore";
import { db } from "../firebase/config";

import type { Area, NPC, Monstro, Missao, Personagem, EventoArea } from "../types/domain";
import { buscarNPC } from "./npcService";
import { listarMonstros } from "./combateService";
import { listarMissoes } from "./missaoService";

const COLECAO = "areas";
const AREAS_CACHE_KEY = "areas_cache";
const colecaoRef = collection(db, COLECAO);

export function criarModeloArea(): Area {
  return {
    id: "",
    nome: "",
    descricao: "",
    npcsIds: [],
    monstrosIds: [],
    missoesIds: [],
    eventos: [],
    clima: "ensolarado",
    mapa: ""
  };
}

export function normalizarArea(area: any): Area {
  const modelo = criarModeloArea();
  return {
    ...modelo,
    ...area,
    id: String(area?.id || ""),
    npcsIds: Array.isArray(area?.npcsIds) ? area.npcsIds : (Array.isArray(area?.npcs) ? area.npcs : []),
    monstrosIds: Array.isArray(area?.monstrosIds) ? area.monstrosIds : (Array.isArray(area?.monstros) ? area.monstros : []),
    missoesIds: Array.isArray(area?.missoesIds) ? area.missoesIds : (Array.isArray(area?.missoes) ? area.missoes : []),
    eventos: Array.isArray(area?.eventos) ? area.eventos : [],
    clima: area?.clima || "ensolarado"
  };
}

export async function listarAreas(ultimoDoc?: QueryDocumentSnapshot): Promise<{ areas: Area[], cursor?: QueryDocumentSnapshot }> {
  try {
    const { queryPaginada } = await import("../firebase/firestore");
    const { orderBy } = await import("firebase/firestore");

    const { dados, proximoCursor } = await queryPaginada<Area>(COLECAO, [orderBy("nome")], 20, ultimoDoc);
    const areas = dados;
    
    const normalized = areas.map(normalizarArea);

    if (typeof window !== "undefined" && !ultimoDoc) {
      localStorage.setItem(AREAS_CACHE_KEY, JSON.stringify(normalized));
    }
    
    return { areas: normalized, cursor: proximoCursor || undefined };
  } catch (error) {
    console.error("Erro ao listar áreas:", error);
    if (typeof window !== "undefined" && !ultimoDoc) {
      const cache = localStorage.getItem(AREAS_CACHE_KEY);
      return { areas: cache ? JSON.parse(cache).map(normalizarArea) : [], cursor: undefined };
    }
    return { areas: [], cursor: undefined };
  }
}

/**
 * Retorna a lista de NPCs presentes na área.
 */
export async function listarNpcsDaArea(areaId: string): Promise<NPC[]> {
  const area = await buscarArea(areaId);
  if (!area || !area.npcsIds.length) return [];

  const npcs: NPC[] = [];
  for (const id of area.npcsIds) {
    const npc = await buscarNPC(id);
    if (npc) npcs.push(npc);
  }
  return npcs;
}

/**
 * Retorna a lista de monstros que podem aparecer na área.
 */
export async function listarMonstrosDaArea(areaId: string): Promise<Monstro[]> {
  const area = await buscarArea(areaId);
  if (!area || !area.monstrosIds.length) return [];

  const todosMonstros = await listarMonstros();
  return todosMonstros.filter((m: any) => area.monstrosIds.includes(String(m.id)));
}

/**
 * Sorteia um evento da área baseado em sua probabilidade (0-100).
 */
export function sortearEvento(area: Area): EventoArea | null {
  if (!area.eventos || area.eventos.length === 0) return null;

  const sorteio = Math.random() * 100;
  let acumulado = 0;

  for (const evento of area.eventos) {
    acumulado += evento.probabilidade;
    if (sorteio <= acumulado) {
      return evento;
    }
  }

  return null;
}

/**
 * Obtém as missões disponíveis na área que o personagem pode aceitar.
 */
export async function obterMissoesDisponiveis(areaId: string, personagem: Personagem): Promise<Missao[]> {
  const area = await buscarArea(areaId);
  if (!area || !area.missoesIds.length) return [];

  const { missoes } = await listarMissoes();
  return missoes.filter(m => 
    area.missoesIds.includes(m.id) && 
    (m.status === "disponivel" || m.status === "disponível") &&
    (!m.nivelRecomendado || m.nivelRecomendado <= personagem.nivel)
  );
}

export async function salvarArea(area: Partial<Area>) {
  try {
    if (area.id) {
      const { id, ...dados } = area;
      await updateDoc(doc(db, COLECAO, id), dados);
      return id;
    } else {
      const docRef = await addDoc(colecaoRef, area);
      return docRef.id;
    }
  } catch (error) {
    console.error("Erro ao salvar área:", error);
    throw error;
  }
}

export async function excluirArea(id: string) {
  try {
    await deleteDoc(doc(db, COLECAO, id));
  } catch (error) {
    console.error("Erro ao excluir área:", error);
    throw error;
  }
}

export async function buscarArea(id: string): Promise<Area | undefined> {
  try {
    const docSnap = await getDoc(doc(db, COLECAO, id));
    if (docSnap.exists()) {
      return normalizarArea({ id: docSnap.id, ...docSnap.data() });
    }
    return undefined;
  } catch (error) {
    console.error("Erro ao buscar área:", error);
    return undefined;
  }
}
