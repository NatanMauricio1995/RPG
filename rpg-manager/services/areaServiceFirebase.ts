import { collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";
import type { Area } from "../types/domain";

const COLECAO = "areas";
const colecaoRef = collection(db, COLECAO);

export async function listarAreas(): Promise<Area[]> {
  const snapshot = await getDocs(colecaoRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Area[];
}

export async function salvarArea(dados: Partial<Area>) {
  if (dados.id) {
    await updateDoc(doc(db, COLECAO, dados.id), dados);
    return dados.id;
  }
  const docRef = await addDoc(colecaoRef, dados);
  return docRef.id;
}
