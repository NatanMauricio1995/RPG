import { collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";
import type { Missao } from "../types/domain";

const COLECAO = "missoes";
const colecaoRef = collection(db, COLECAO);

export async function listarMissoes(): Promise<Missao[]> {
  const snapshot = await getDocs(colecaoRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Missao[];
}

export async function salvarMissao(dados: Partial<Missao>) {
  if (dados.id) {
    await updateDoc(doc(db, COLECAO, dados.id), dados);
    return dados.id;
  }
  const docRef = await addDoc(colecaoRef, dados);
  return docRef.id;
}
