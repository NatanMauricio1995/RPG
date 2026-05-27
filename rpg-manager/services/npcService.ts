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
  limit
} from "firebase/firestore";
import { db } from "../firebase/config";
import npcsData from "../data/campanha/npcs.json";

import type { NPC, Dialogo, Faccao } from "../types/domain";

export const NPCS_STORAGE_KEY = "npcs_cache";
const COLECAO = "npcs";
const colecaoRef = collection(db, COLECAO);

export function criarModeloNPC(): NPC {
  return {
    id: "",
    nome: "",
    imagem: "/imagens/npcs/padrao.png",
    descricao: "",
    faccao: "Neutro",
    funcao: "",
    localizacao: "",
    relacionamento: 50,
    loja: [],
    dialogos: [],
    missoes: []
  };
}

export function normalizarNPC(npc: any): NPC {
  const modelo = criarModeloNPC();
  return {
    ...modelo,
    ...npc,
    id: String(npc?.id || ""),
    relacionamento: Number(npc?.relacionamento ?? 50),
    loja: Array.isArray(npc?.loja) ? npc.loja : [],
    dialogos: Array.isArray(npc?.dialogos) ? npc.dialogos : [],
    missoes: Array.isArray(npc?.missoes) ? npc.missoes : []
  };
}

export async function listarNPCs(): Promise<NPC[]> {
  try {
    const q = query(colecaoRef, limit(50));
    const snapshot = await getDocs(q);
    let npcs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as NPC[];

    if (npcs.length === 0 && npcsData.length > 0) {
      for (const seed of npcsData) {
        const { id, ...dados } = seed;
        await setDoc(doc(db, COLECAO, String(id)), dados);
      }
      const newSnapshot = await getDocs(colecaoRef);
      npcs = newSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as NPC[];
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(NPCS_STORAGE_KEY, JSON.stringify(npcs));
    }

    return npcs.map(normalizarNPC);
  } catch (error) {
    console.error("Erro ao listar NPCs:", error);
    if (typeof window !== "undefined") {
      const cache = localStorage.getItem(NPCS_STORAGE_KEY);
      return cache ? JSON.parse(cache).map(normalizarNPC) : [];
    }
    return [];
  }
}

export async function buscarNPC(id: string): Promise<NPC | null> {
  try {
    const docSnap = await getDoc(doc(db, COLECAO, id));
    if (docSnap.exists()) {
      return normalizarNPC({ ...docSnap.data(), id: docSnap.id });
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar NPC:", error);
    return null;
  }
}

export async function alterarRelacionamento(npcId: string, delta: number) {
  try {
    const npc = await buscarNPC(npcId);
    if (!npc) return;
    const novo = Math.max(0, Math.min(100, (npc.relacionamento || 50) + delta));
    
    let novaFaccao = npc.faccao;
    if (novo >= 80) novaFaccao = "Aliado";
    else if (novo <= 20) novaFaccao = "Inimigo";
    else if (npc.faccao !== "Mercador") novaFaccao = "Neutro";

    await updateDoc(doc(db, COLECAO, npcId), { 
      relacionamento: novo,
      faccao: novaFaccao
    });
  } catch (error) {
    console.error("Erro ao alterar relacionamento:", error);
  }
}

export async function salvarNPC(npc: Partial<NPC>) {
  try {
    if (npc.id) {
      const { id, ...dados } = npc;
      await updateDoc(doc(db, COLECAO, id), dados);
      return id;
    } else {
      const docRef = await addDoc(colecaoRef, npc);
      return docRef.id;
    }
  } catch (error) {
    console.error("Erro ao salvar NPC:", error);
    throw error;
  }
}

export async function excluirNPC(id: string) {
  try {
    await deleteDoc(doc(db, COLECAO, id));
  } catch (error) {
    console.error("Erro ao excluir NPC:", error);
    throw error;
  }
}
