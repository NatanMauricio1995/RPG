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

export async function listarHabilidades(): Promise<Habilidade[]> {
  try {
    const q = query(colecaoRef, limit(50));
    const snapshot = await getDocs(q);
    let habilidades = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Habilidade[];

    // Seed if empty
    if (habilidades.length === 0 && habilidadesData.length > 0) {
      console.log("Semeando habilidades no Firebase...");
      for (const h of habilidadesData) {
        const novaHabilidade: Habilidade = {
          nome: h.nome,
          descricao: "Habilidade básica",
          imagem: "/imagens/habilidades/padrao.png",
          tipo: 'ativa',
          dano: 0,
          cura: 0,
          custoMana: 0,
          cooldown: 0,
          alcance: 1,
          area: 1,
          nivelMinimo: 1
        };
        await addDoc(colecaoRef, novaHabilidade);
      }
      const newSnapshot = await getDocs(colecaoRef);
      habilidades = newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Habilidade[];
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(CACHE_KEY, JSON.stringify(habilidades));
    }

    return habilidades;
  } catch (error) {
    console.error("Erro ao listar habilidades, tentando cache:", error);
    if (typeof window !== "undefined") {
      const cache = localStorage.getItem(CACHE_KEY);
      return cache ? JSON.parse(cache) : [];
    }
    return [];
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
