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

import type { NPC, DialogoNPC, Faccao, Personagem, Missao } from "../types/domain";
import { listarMissoes } from "./missaoService";

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
    reputacao: {},
    missoes: [],
  };
}

export function normalizarNPC(npc: any): NPC {
  const modelo = criarModeloNPC();
  return {
    ...modelo,
    ...npc,
    id: String(npc?.id || ""),
    reputacao: npc?.reputacao || {},
    missoes: Array.isArray(npc?.missoes) ? npc.missoes : [],
    loja: npc?.loja || undefined,
    dialogo: npc?.dialogo || undefined
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

/**
 * Atualiza a reputação de um personagem específico com este NPC.
 */
export async function atualizarReputacao(npcId: string, personagemId: string | number, delta: number) {
  try {
    const npc = await buscarNPC(npcId);
    if (!npc) return;

    const pId = String(personagemId);
    const atual = npc.reputacao[pId] || 0;
    const nova = Math.max(-100, Math.min(100, atual + delta));

    const novaReputacao = { ...npc.reputacao, [pId]: nova };
    await updateDoc(doc(db, COLECAO, npcId), { reputacao: novaReputacao });

    return nova;
  } catch (error) {
    console.error("Erro ao atualizar reputação:", error);
    throw error;
  }
}

/**
 * Retorna uma saudação diferente baseada na reputação do personagem.
 */
export function obterDialogo(npc: NPC, personagem: Personagem): string {
  const pId = String(personagem.id);
  const reputacao = npc.reputacao[pId] || 0;

  if (!npc.dialogo) return `Olá, sou ${npc.nome}.`;

  if (reputacao <= -50) return `O que você quer aqui? Saia da minha frente.`;
  if (reputacao < 0) return `Seja breve, não tenho tempo para você.`;
  if (reputacao >= 50) return `É uma honra revê-lo, grande ${personagem.nome}!`;

  return npc.dialogo.saudacao;
}

/**
 * Lista as missões que o NPC oferece e que o personagem pode aceitar.
 */
export async function listarMissoesDisponiveis(npcId: string, personagem: Personagem): Promise<Missao[]> {
  try {
    const npc = await buscarNPC(npcId);
    if (!npc || !npc.missoes || npc.missoes.length === 0) return [];

    const todasMissoes = await listarMissoes();

    return todasMissoes.filter(m => 
      npc.missoes.includes(m.id) && 
      m.nivelRecomendado <= personagem.nivel &&
      m.status === "disponível"
    );
  } catch (error) {
    console.error("Erro ao listar missões disponíveis:", error);
    return [];
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
