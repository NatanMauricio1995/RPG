import { collection, addDoc, getDocs, getDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase/config";
import type { NPC } from "../types/domain";

const COLECAO = "npcs";
const colecaoRef = collection(db, COLECAO);

export async function listarNPCs(): Promise<NPC[]> {
  const snapshot = await getDocs(colecaoRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as NPC[];
}

export async function buscarNPC(id: string): Promise<NPC | null> {
  const docSnap = await getDoc(doc(db, COLECAO, id));
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as NPC : null;
}

export async function salvarNPC(dados: Partial<NPC>, arquivoImagem?: File) {
  let urlImagem = dados.imagem;
  if (arquivoImagem) {
    const storageRef = ref(storage, `npcs/${Date.now()}_${arquivoImagem.name}`);
    const snapshot = await uploadBytes(storageRef, arquivoImagem);
    urlImagem = await getDownloadURL(snapshot.ref);
  }
  const payload = { ...dados, imagem: urlImagem };
  if (dados.id) {
    await updateDoc(doc(db, COLECAO, dados.id), payload);
    return dados.id;
  }
  const docRef = await addDoc(colecaoRef, payload);
  return docRef.id;
}
