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
import { resolverInventario } from "./itemService";

export const NPCS_STORAGE_KEY = "npcs_cache";
const COLECAO = "npcs";
const colecaoRef = collection(db, COLECAO);

export type NPC = {
  id: string;
  nome: string;
  imagem: string;
  idade: number;
  profissao: string;
  alinhamento: string;
  personalidade: string;
  dialogos: string[];
  inventario: any[];
  relacionamento: number;
  padrao?: boolean;
};

export function criarModeloNPC(): NPC {
  return {
    id: "",
    nome: "",
    imagem: "/imagens/npcs/ChatGPT Image 18 de mai. de 2026, 18_23_40.png",
    idade: 30,
    profissao: "",
    alinhamento: "Neutro",
    personalidade: "",
    dialogos: [""],
    inventario: [],
    relacionamento: 0
  };
}

export function normalizarNPC(npc: any): NPC {
  const modelo = criarModeloNPC();
  return {
    ...modelo,
    ...npc,
    id: String(npc?.id || ""),
    idade: Number(npc?.idade || 0),
    dialogos: Array.isArray(npc?.dialogos) ? npc.dialogos : [],
    inventario: resolverInventario(npc?.inventario || []),
    relacionamento: Number(npc?.relacionamento || 0)
  };
}

export async function listarNPCs(): Promise<NPC[]> {
  try {
    const q = query(colecaoRef, limit(50));
    const snapshot = await getDocs(q);
    let npcs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as NPC[];

    // Se estiver vazio, popula com o seed inicial (npcs.json)
    if (npcs.length === 0 && npcsData.length > 0) {
      console.log("Semeando NPCs iniciais no Firebase...");
      for (const seed of npcsData) {
        const { id, ...dados } = seed;
        // Usa o ID numérico como string no Firebase para o seed
        await setDoc(doc(db, COLECAO, String(id)), dados);
      }
      // Recarrega após o seed
      const newSnapshot = await getDocs(colecaoRef);
      npcs = newSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as NPC[];
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(NPCS_STORAGE_KEY, JSON.stringify(npcs));
    }

    return npcs;
  } catch (error) {
    console.error("Erro ao listar NPCs do Firebase, tentando cache:", error);
    if (typeof window !== "undefined") {
      const cache = localStorage.getItem(NPCS_STORAGE_KEY);
      return cache ? JSON.parse(cache) : [];
    }
    return [];
  }
}

export async function buscarNPC(id: string): Promise<NPC | null> {
  try {
    const docSnap = await getDoc(doc(db, COLECAO, id));
    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id } as NPC;
    }
    
    // Fallback para o cache
    const cache = typeof window !== "undefined" ? localStorage.getItem(NPCS_STORAGE_KEY) : null;
    const npcs = cache ? JSON.parse(cache) : [];
    return npcs.find((n: NPC) => String(n.id) === id) || null;
  } catch (error) {
    console.error("Erro ao buscar NPC:", error);
    return null;
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
