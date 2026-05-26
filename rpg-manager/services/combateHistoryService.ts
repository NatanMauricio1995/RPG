import { collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase/config";
import type { HistoricoCombate } from "../types/domain";

const COLECAO = "historicoCombate";
const colecaoRef = collection(db, COLECAO);

export async function salvarHistoricoCombate(historico: Partial<HistoricoCombate>) {
  try {
    const docRef = await addDoc(colecaoRef, {
      ...historico,
      data: new Date().toISOString(),
    });
    return docRef.id;
  } catch (erro) {
    console.error("Erro ao salvar histórico de combate:", erro);
    return null;
  }
}

export async function listarHistoricoCombate(maxResults: number = 20) {
  try {
    const q = query(colecaoRef, orderBy("data", "desc"), limit(maxResults));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as HistoricoCombate[];
  } catch (erro) {
    console.error("Erro ao listar histórico de combate:", erro);
    return [];
  }
}
