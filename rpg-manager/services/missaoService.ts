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
import { buscarPersonagem, atualizarPersonagem } from "./personagemService";
import { adicionarItem } from "./itemService";

import type { Missao, ObjetivoMissao, StatusMissao } from "../types/domain";

const COLECAO = "missoes";
const colecaoRef = collection(db, COLECAO);

export async function listarMissoes(): Promise<Missao[]> {
  try {
    const q = query(colecaoRef, limit(50));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Missao[];
  } catch (error) {
    console.error("Erro ao listar missões:", error);
    return [];
  }
}

export async function buscarMissao(id: string): Promise<Missao | null> {
  try {
    const docSnap = await getDoc(doc(db, COLECAO, id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Missao;
    }
    return null;
  } catch (error) {
    console.error("Erro ao buscar missão:", error);
    return null;
  }
}

/**
 * Inicia uma missão para o grupo/campanha (status global da missão).
 */
export async function aceitarMissao(personagemId: string | number, missaoId: string) {
  try {
    const missao = await buscarMissao(missaoId);
    if (!missao) throw new Error("Missão não encontrada");
    if (missao.status !== "disponivel") throw new Error("Missão já está em andamento ou concluída");

    await updateDoc(doc(db, COLECAO, missaoId), { status: "em_andamento" });
  } catch (error) {
    console.error("Erro ao aceitar missão:", error);
    throw error;
  }
}

/**
 * Avança o progresso de um objetivo específico da missão.
 */
export async function avancarObjetivo(missaoId: string, objetivoIndex: number, delta: number): Promise<void> {
  try {
    const missao = await buscarMissao(missaoId);
    if (!missao || !missao.objetivos[objetivoIndex]) return;

    const objetivos = [...missao.objetivos];
    const obj = objetivos[objetivoIndex];
    
    obj.progresso = Math.min(obj.total, obj.progresso + delta);
    obj.concluido = obj.progresso >= obj.total;

    await updateDoc(doc(db, COLECAO, missaoId), { objetivos });
  } catch (error) {
    console.error("Erro ao avançar objetivo da missão:", error);
    throw error;
  }
}

/**
 * Finaliza a missão e aplica as recompensas ao personagem.
 * Retorna o resumo das recompensas aplicadas.
 */
export async function concluirMissao(missaoId: string, personagemId: string | number): Promise<{xp: number; ouro: number; itens: string[]}> {
  try {
    const missao = await buscarMissao(missaoId);
    if (!missao) throw new Error("Missão não encontrada");
    if (missao.status !== "em_andamento") throw new Error("Missão não está ativa");

    const personagem = await buscarPersonagem(personagemId);
    if (!personagem) throw new Error("Personagem não encontrado");

    // 1. Aplicar Recompensas
    const xp = (missao.recompensas.xp || 0);
    const ouro = (missao.recompensas.ouro || 0);
    const itens = (missao.recompensas.itens || []);

    // 2. Salvar Personagem (XP e Ouro)
    await atualizarPersonagem(personagemId, {
      xpAtual: (personagem.xpAtual || 0) + xp,
      ouro: (personagem.ouro || 0) + ouro
    });

    // 3. Adicionar Itens Recompensa
    if (itens.length > 0) {
      for (const itemId of itens) {
        await adicionarItem(personagemId, itemId, 1);
      }
    }

    // 4. Atualizar Status da Missão
    await updateDoc(doc(db, COLECAO, missaoId), { status: "concluida" });

    return { xp, ouro, itens };
  } catch (error) {
    console.error("Erro ao concluir missão:", error);
    throw error;
  }
}

/**
 * Marca a missão como falha.
 */
export async function falharMissao(personagemId: string | number, missaoId: string) {
  try {
    await updateDoc(doc(db, COLECAO, missaoId), { status: "falhou" });
  } catch (error) {
    console.error("Erro ao falhar missão:", error);
    throw error;
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
