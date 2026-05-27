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

import type { Area } from "../types/domain";

export type TipoArea = "Cidade" | "Vila" | "Floresta" | "Caverna" | "Ruína" | "Templo" | "Reino" | "Outro";

const COLECAO = "areas";
const AREAS_CACHE_KEY = "areas_cache";
const colecaoRef = collection(db, COLECAO);

export function criarModeloArea(): Area {
  return {
    id: "",
    nome: "",
    descricao: "",
    npcs: [],
    monstros: [],
    missoes: [],
    eventos: [],
    mapa: ""
  };
}

export function normalizarArea(area: any): Area {
  const modelo = criarModeloArea();
  return {
    ...modelo,
    ...area,
    id: String(area?.id || ""),
    npcs: Array.isArray(area?.npcs) ? area.npcs : [],
    monstros: Array.isArray(area?.monstros) ? area.monstros : [],
    missoes: Array.isArray(area?.missoes) ? area.missoes : [],
    eventos: Array.isArray(area?.eventos) ? area.eventos : []
  };
}

export async function listarAreas(): Promise<Area[]> {
  try {
    const q = query(colecaoRef, limit(50));
    const snapshot = await getDocs(q);
    const areas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Area[];
    
    if (typeof window !== "undefined") {
      localStorage.setItem(AREAS_CACHE_KEY, JSON.stringify(areas));
    }
    
    return areas.map(normalizarArea);
  } catch (error) {
    console.error("Erro ao listar áreas:", error);
    if (typeof window !== "undefined") {
      const cache = localStorage.getItem(AREAS_CACHE_KEY);
      return cache ? JSON.parse(cache).map(normalizarArea) : [];
    }
    return [];
  }
}

export async function sortearInimigosArea(areaId: string): Promise<string[]> {
  const area = await buscarArea(areaId);
  if (!area || !area.monstros || area.monstros.length === 0) return [];

  // Sorteia de 1 a 3 tipos de monstros da lista da área
  const numTipos = Math.floor(Math.random() * 3) + 1;
  const sorteados: string[] = [];
  
  for (let i = 0; i < numTipos; i++) {
    const randomIdx = Math.floor(Math.random() * area.monstros.length);
    sorteados.push(area.monstros[randomIdx]);
  }

  return sorteados;
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
