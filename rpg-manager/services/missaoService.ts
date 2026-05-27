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

import type { Missao, ObjetivoMissao } from "../types/domain";

const COLECAO = "missoes";
const MISSOES_CACHE_KEY = "missoes_cache";
const colecaoRef = collection(db, COLECAO);

export function criarModeloMissao(): Missao {
  return {
    id: "",
    nome: "",
    descricao: "",
    objetivos: [],
    recompensas: {
      ouro: 0,
      xp: 0,
      itens: []
    },
    npcId: "",
    status: "disponível",
    nivelRecomendado: 1
  };
}

export function normalizarMissao(missao: any): Missao {
  const modelo = criarModeloMissao();
  return {
    ...modelo,
    ...missao,
    id: String(missao?.id || ""),
    objetivos: Array.isArray(missao?.objetivos) ? missao.objetivos : [],
    recompensas: missao?.recompensas || modelo.recompensas
  };
}

export async function listarMissoes(): Promise<Missao[]> {
  try {
    const q = query(colecaoRef, limit(50));
    const snapshot = await getDocs(q);
    const missoes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Missao[];
    
    if (typeof window !== "undefined") {
      localStorage.setItem(MISSOES_CACHE_KEY, JSON.stringify(missoes));
    }
    
    return missoes.map(normalizarMissao);
  } catch (error) {
    console.error("Erro ao listar missões do Firebase, tentando cache:", error);
    if (typeof window !== "undefined") {
      const cache = localStorage.getItem(MISSOES_CACHE_KEY);
      return cache ? JSON.parse(cache).map(normalizarMissao) : [];
    }
    return [];
  }
}

export async function salvarMissao(missao: Partial<Missao>) {
  try {
    if (missao.id) {
      const { id, ...dados } = missao;
      await updateDoc(doc(db, COLECAO, id), dados);
      return id;
    } else {
      const docRef = await addDoc(colecaoRef, missao);
      return docRef.id;
    }
  } catch (error) {
    console.error("Erro ao salvar missão:", error);
    throw error;
  }
}

export async function excluirMissao(id: string) {
  try {
    await deleteDoc(doc(db, COLECAO, id));
  } catch (error) {
    console.error("Erro ao excluir missão:", error);
    throw error;
  }
}

export async function buscarMissao(id: string): Promise<Missao | undefined> {
  try {
    const docSnap = await getDoc(doc(db, COLECAO, id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Missao;
    }
    
    // Tenta no cache se não achar no Firebase (ou se falhar)
    const missoes = await listarMissoes();
    return missoes.find(m => m.id === id);
  } catch (error) {
    console.error("Erro ao buscar missão:", error);
    const missoes = await listarMissoes();
    return missoes.find(m => m.id === id);
  }
}
