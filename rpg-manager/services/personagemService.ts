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
} from "firebase/firestore";
import { db } from "../firebase/config";
import personagensData from "../data/campanha/personagens.json";
import classes from "../data/sistema/classes.json";
import racas from "../data/sistema/racas.json";
import niveis from "../data/sistema/niveis.json";
import { calcularVida, calcularAtributosFinais } from "./calculoService";
import { buscarItem } from "./itemService";
import { listarHabilidades } from "./habilidadeService";
import type {
  Personagem,
  PersonagemCompleto,
  Equipados,
  Atributos,
  Classe,
  Raca,
  Nivel,
  Habilidade,
} from "../types/domain";

export const ATRIBUTOS_PADRAO: Atributos = {
  forca: 10,
  destreza: 10,
  constituicao: 10,
  inteligencia: 10,
  sabedoria: 10,
  carisma: 10,
};

export const EQUIPADOS_PADRAO: Equipados = {
  arma: null,
  armaSecundaria: null,
  escudo: null,
  armadura: null,
  capacete: null,
  luvas: null,
  botas: null,
  anel1: null,
  anel2: null,
  colar: null,
  acessorio: null,
  bolsa: null,
};

const COLECAO = "personagens";
const CACHE_KEY = "personagens_cache";
const colecaoRef = collection(db, COLECAO);

export function criarModeloPersonagem(): Personagem {
  return {
    id: String(Date.now()),
    nome: "",
    imagem: "/imagens/racas/padrao.png",
    racaId: (racas[0] as any)?.id || 1,
    classeId: (classes[0] as any)?.id || 1,
    nivel: 1,
    xpAtual: 0,
    xpNecessario: 100,
    vidaAtual: 10,
    manaAtual: 10,
    ouro: 0,
    inventario: [],
    equipados: { ...EQUIPADOS_PADRAO },
    atributosBase: { ...ATRIBUTOS_PADRAO },
  };
}

export function normalizarPersonagem(personagem: any): Personagem {
  const p = {
    ...criarModeloPersonagem(),
    ...personagem,
    id: String(personagem?.id || Date.now()),
    inventario: Array.isArray(personagem?.inventario) ? personagem.inventario : [],
    equipados: {
      ...EQUIPADOS_PADRAO,
      ...(personagem?.equipados || {}),
    },
    atributosBase: {
      ...ATRIBUTOS_PADRAO,
      ...(personagem?.atributosBase || {}),
    },
  };

  p.inventario = p.inventario.map((item: any) => {
    if (typeof item === "string" || typeof item === "number") {
      return { itemId: String(item), quantidade: 1, equipado: false };
    }
    return {
      itemId: String(item.itemId),
      quantidade: Number(item.quantidade || 1),
      equipado: Boolean(item.equipado),
    };
  });

  return p;
}

export async function listarPersonagens(): Promise<Personagem[]> {
  try {
    const q = query(colecaoRef, limit(50));
    const snapshot = await getDocs(q);
    let personagens = snapshot.docs.map((d) => ({
      ...d.data(),
      id: d.id,
    })) as Personagem[];

    // Seed se estiver vazio
    if (personagens.length === 0 && personagensData.length > 0) {
      console.log("Semeando personagens no Firebase...");
      for (const p of personagensData) {
        const { id, ...dados } = normalizarPersonagem(p);
        await setDoc(doc(db, COLECAO, String(id)), dados);
      }
      const newSnapshot = await getDocs(colecaoRef);
      personagens = newSnapshot.docs.map((d) => ({ ...d.data(), id: d.id })) as Personagem[];
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(CACHE_KEY, JSON.stringify(personagens));
    }

    return personagens.map(normalizarPersonagem);
  } catch (error) {
    console.error("Erro ao listar personagens, tentando cache:", error);
    if (typeof window !== "undefined") {
      const cache = localStorage.getItem(CACHE_KEY);
      return cache ? JSON.parse(cache).map(normalizarPersonagem) : [];
    }
    return [];
  }
}

export async function buscarPersonagem(id: string | number): Promise<Personagem | null> {
  const idStr = String(id);

  // Cache local primeiro
  if (typeof window !== "undefined") {
    const cache = localStorage.getItem(CACHE_KEY);
    if (cache) {
      const personagens = JSON.parse(cache);
      const encontrado = personagens.find((p: any) => String(p.id) === idStr);
      if (encontrado) return normalizarPersonagem(encontrado);
    }
  }

  try {
    const docSnap = await getDoc(doc(db, COLECAO, idStr));
    if (docSnap.exists()) {
      return normalizarPersonagem({ ...docSnap.data(), id: docSnap.id });
    }
  } catch (error) {
    console.error("Erro ao buscar personagem no Firebase:", error);
  }

  return null;
}

export async function salvarPersonagem(personagem: any) {
  const p = normalizarPersonagem(personagem);
  const idStr = String(p.id);

  try {
    // Se for um ID numérico (de timestamp ou seed), tentamos ver se existe ou criamos com esse ID
    // Mas a instrução diz: "Se personagem.id for number, converter para string ao salvar no Firebase"
    const { id, ...dados } = p;
    await setDoc(doc(db, COLECAO, idStr), dados);
    
    // Atualizar cache
    const atuais = await listarPersonagens();
    return normalizarPersonagem({ ...dados, id: idStr });
  } catch (error) {
    console.error("Erro ao salvar personagem:", error);
    throw error;
  }
}

export async function atualizarPersonagem(id: string | number, dados: Partial<Personagem>) {
  const idStr = String(id);
  try {
    await updateDoc(doc(db, COLECAO, idStr), dados);
    await listarPersonagens(); // Atualiza cache
  } catch (error) {
    console.error("Erro ao atualizar personagem:", error);
    throw error;
  }
}

export async function excluirPersonagem(id: string | number) {
  const idStr = String(id);
  try {
    await deleteDoc(doc(db, COLECAO, idStr));
    await listarPersonagens(); // Atualiza cache
  } catch (error) {
    console.error("Erro ao excluir personagem:", error);
    throw error;
  }
}

export async function completarPersonagem(personagem: Personagem): Promise<PersonagemCompleto> {
  const p = normalizarPersonagem(personagem);

  const classe = (classes as any[]).find((c) => String(c.id) === String(p.classeId)) as Classe;
  const raca = (racas as any[]).find((r) => String(r.id) === String(p.racaId)) as Raca;
  const dadosNivel = (niveis as any[]).find((n) => n.nivel === p.nivel) as Nivel;

  // Usa buscarItem que agora é async, mas aqui precisamos de algo sincrono ou await
  // Como completarPersonagem é async, podemos dar await
  const itensEquipados: any[] = [];
  for (const inv of p.inventario) {
    if (inv.equipado) {
      const item = await buscarItem(inv.itemId);
      if (item) itensEquipados.push(item);
    }
  }

  const { atributos, vidaMaxima, manaMaxima, armadura, velocidade, critico, ataque, bonus } = calcularAtributosFinais(
    p,
    raca,
    classe,
    niveis as any[],
    itensEquipados
  );

  const todasHabilidades = await listarHabilidades();
  const habsClasseIds = classe?.habilidades || [];
  const habsClasse = todasHabilidades.filter(h => h.id && habsClasseIds.includes(h.id));
  const habsPersonagemIds = p.habilidadesIds || [];
  const habsPersonagem = todasHabilidades.filter(h => h.id && habsPersonagemIds.includes(h.id));

  const habilidadesUnicas = new Map<string, any>();
  [...habsClasse, ...habsPersonagem].forEach(h => {
    if (h.id) habilidadesUnicas.set(h.id, h);
  });

  return {
    ...p,
    classe: classe?.nome || "Sem Classe",
    raca: raca?.nome || "Sem Raça",
    classeDados: classe,
    racaDados: raca,
    dadosNivel,
    atributos,
    vidaMaxima,
    manaMaxima,
    armadura,
    velocidade,
    critico,
    ataque,
    bonus,
    habilidades: Array.from(habilidadesUnicas.values()) as any[],
  };
}
