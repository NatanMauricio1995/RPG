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
  limit,
  QueryDocumentSnapshot,
  setDoc
} from "firebase/firestore";
import { db } from "../firebase/config";
import habilidadesData from "../data/sistema/habilidades.json";
import { uploadImage } from "../firebase/storage";

export interface Habilidade {
  id?: string;
  nome: string;
  descricao: string;
  imagem: string;
  tipo: 'ativa' | 'passiva' | 'reacao';
  dano: number;
  cura: number;
  custoMana: number;
  cooldown: number;
  alcance: number;
  area: number;
  nivelMinimo: number;
}

const COLECAO = "habilidades";
const CACHE_KEY = "habilidades_cache";
const colecaoRef = collection(db, COLECAO);

export async function listarHabilidades(ultimoDoc?: QueryDocumentSnapshot): Promise<{ habilidades: Habilidade[], cursor?: QueryDocumentSnapshot }> {
  try {
    const { queryPaginada } = await import("../firebase/firestore");
    const { orderBy } = await import("firebase/firestore");

    const { dados, proximoCursor } = await queryPaginada<Habilidade>(COLECAO, [orderBy("nome")], 20, ultimoDoc);
    let habilidades = dados;

    // Seed if empty and no pagination
    if (habilidades.length === 0 && habilidadesData.length > 0 && !ultimoDoc) {
      console.log("Semeando habilidades no Firebase...");
      for (const h of habilidadesData) {
        const idStr = String((h as any).id || Date.now() + Math.random());
        const novaHabilidade: Habilidade = {
          nome: h.nome,
          descricao: h.descricao || "Habilidade básica",
          imagem: h.imagem || "/imagens/habilidades/padrao.png",
          tipo: (h.tipo as any) || 'ativa',
          dano: Number(h.dano || 0),
          cura: Number(h.cura || 0),
          custoMana: Number(h.custoMana || 0),
          cooldown: Number(h.cooldown || 0),
          alcance: Number(h.alcance || 1),
          area: Number(h.area || 1),
          nivelMinimo: Number(h.nivelMinimo || 1)
        };
        await setDoc(doc(db, COLECAO, idStr), novaHabilidade);
      }
      const res = await queryPaginada<Habilidade>(COLECAO, [orderBy("nome")], 20);
      habilidades = res.dados;
      if (typeof window !== "undefined") {
        localStorage.setItem(CACHE_KEY, JSON.stringify(habilidades));
      }
      return { habilidades, cursor: res.proximoCursor || undefined };
    }

    if (typeof window !== "undefined" && !ultimoDoc) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(habilidades));
    }

    return { habilidades, cursor: proximoCursor || undefined };
  } catch (error) {
    console.error("Erro ao listar habilidades, tentando cache:", error);
    if (typeof window !== "undefined" && !ultimoDoc) {
      const cache = localStorage.getItem(CACHE_KEY);
      return { habilidades: cache ? JSON.parse(cache) : [], cursor: undefined };
    }
    return { habilidades: [], cursor: undefined };
  }
}

export async function buscarHabilidade(id: string): Promise<Habilidade | null> {
  try {
    const docRef = doc(db, COLECAO, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Habilidade;
    }
    
    // Fallback cache
    if (typeof window !== "undefined") {
      const cache = localStorage.getItem(CACHE_KEY);
      if (cache) {
        const habilidades = JSON.parse(cache) as Habilidade[];
        return habilidades.find(h => h.id === id) || null;
      }
    }
  } catch (error) {
    console.error("Erro ao buscar habilidade:", error);
  }
  return null;
}

export async function criarHabilidade(dados: Omit<Habilidade, 'id'>, arquivoImagem?: File): Promise<Habilidade> {
  try {
    let urlImagem = dados.imagem;
    if (arquivoImagem) {
      urlImagem = await uploadImage(`habilidades/${Date.now()}_${arquivoImagem.name}`, arquivoImagem);
    }
    const payload = { ...dados, imagem: urlImagem };
    const docRef = await addDoc(colecaoRef, payload);
    return { id: docRef.id, ...payload };
  } catch (error) {
    console.error("Erro ao criar habilidade:", error);
    throw error;
  }
}

export async function editarHabilidade(id: string, dados: Partial<Habilidade>, arquivoImagem?: File): Promise<void> {
  try {
    let urlImagem = dados.imagem;
    if (arquivoImagem) {
      urlImagem = await uploadImage(`habilidades/${Date.now()}_${arquivoImagem.name}`, arquivoImagem);
    }
    const payload = { ...dados };
    if (urlImagem) payload.imagem = urlImagem;
    
    const docRef = doc(db, COLECAO, id);
    await updateDoc(docRef, payload);
  } catch (error) {
    console.error("Erro ao editar habilidade:", error);
    throw error;
  }
}

export async function excluirHabilidade(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLECAO, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Erro ao excluir habilidade:", error);
    throw error;
  }
}
