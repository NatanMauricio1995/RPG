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
  QueryDocumentSnapshot
} from "firebase/firestore";
import { db } from "../firebase/config";
import npcsData from "../data/campanha/npcs.json";

import type { NPC, DialogoNPC, Faccao, Personagem, Missao, Item } from "../types/domain";
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

export async function listarNPCs(ultimoDoc?: QueryDocumentSnapshot): Promise<{ npcs: NPC[], cursor?: QueryDocumentSnapshot }> {
  try {
    const { queryPaginada } = await import("../firebase/firestore");
    const { orderBy } = await import("firebase/firestore");

    const { dados, proximoCursor } = await queryPaginada<NPC>(COLECAO, [orderBy("nome")], 20, ultimoDoc);
    let npcs = dados;

    if (npcs.length === 0 && npcsData.length > 0 && !ultimoDoc) {
      for (const seed of npcsData) {
        const { id, ...dados } = seed;
        await setDoc(doc(db, COLECAO, String(id)), dados);
      }
      const res = await queryPaginada<NPC>(COLECAO, [orderBy("nome")], 20);
      npcs = res.dados;
      const normalized = npcs.map(normalizarNPC);
      if (typeof window !== "undefined") {
        localStorage.setItem(NPCS_STORAGE_KEY, JSON.stringify(normalized));
      }
      return { npcs: normalized, cursor: res.proximoCursor || undefined };
    }

    const normalized = npcs.map(normalizarNPC);

    if (typeof window !== "undefined" && !ultimoDoc) {
      localStorage.setItem(NPCS_STORAGE_KEY, JSON.stringify(normalized));
    }

    return { npcs: normalized, cursor: proximoCursor || undefined };
  } catch (error) {
    console.error("Erro ao listar NPCs:", error);
    if (typeof window !== "undefined" && !ultimoDoc) {
      const cache = localStorage.getItem(NPCS_STORAGE_KEY);
      return { npcs: cache ? JSON.parse(cache).map(normalizarNPC) : [], cursor: undefined };
    }
    return { npcs: [], cursor: undefined };
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
 * Abre a loja do NPC, aplicando descontos baseados na reputação.
 */
export async function abrirLoja(npcId: string, personagemId?: string): Promise<Item[]> {
  try {
    const npc = await buscarNPC(npcId);
    if (!npc || !npc.loja) return [];

    const { listarItens } = await import("./itemService");
    const { itens } = await listarItens();
    
    // Usando itensIds conforme definido em domain.ts
    const itensLoja = itens.filter(i => npc.loja?.itensIds.includes(i.id));

    // Cálculo de desconto: 1% de desconto para cada 10 pontos de reputação positiva
    // Além do desconto base da loja
    let descontoReputacao = 0;
    if (personagemId) {
      const reputacao = npc.reputacao[personagemId] || 0;
      if (reputacao > 0) {
        descontoReputacao = Math.floor(reputacao / 10) / 100; // Máximo 10% se reputação for 100
      }
    }

    const descontoBase = npc.loja.desconto || 0;

    return itensLoja.map(item => ({
      ...item,
      preco: Math.floor((item.preco || 0) * (1 - descontoBase) * (1 - descontoReputacao))
    }));
  } catch (error) {
    console.error("Erro ao abrir loja:", error);
    return [];
  }
}

/**
 * Busca missões oferecidas pelo NPC que o personagem pode aceitar.
 */
export async function buscarMissoesNPC(npcId: string, personagemNivel: number): Promise<Missao[]> {
  try {
    const npc = await buscarNPC(npcId);
    if (!npc || !npc.missoes) return [];

    const { missoes } = await listarMissoes();
    return missoes.filter(m => 
      npc.missoes.includes(m.id) && 
      (m.status === "disponivel" || m.status === "disponível") &&
      (m.nivelRecomendado || 1) <= personagemNivel
    );
  } catch (error) {
    console.error("Erro ao buscar missões do NPC:", error);
    return [];
  }
}

/**
 * Atualiza a reputação de um personagem específico com este NPC.
 */
export async function atualizarReputacao(npcId: string, personagemId: string | number, delta: number): Promise<void> {
  try {
    const npc = await buscarNPC(npcId);
    if (!npc) return;

    const pId = String(personagemId);
    const atual = npc.reputacao[pId] || 0;
    const nova = Math.max(-100, Math.min(100, atual + delta));

    const novaReputacao = { ...npc.reputacao, [pId]: nova };
    await updateDoc(doc(db, COLECAO, npcId), { reputacao: novaReputacao });
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

    const { missoes } = await listarMissoes();

    return missoes.filter(m => 
      npc.missoes.includes(m.id) && 
      (m.nivelRecomendado || 1) <= personagem.nivel &&
      (m.status === "disponível" || m.status === "disponivel")
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
