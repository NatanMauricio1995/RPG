import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase/config";
import type { Habilidade } from "../types/domain";

const COLECAO = "habilidades";
const colecaoRef = collection(db, COLECAO);

export async function listarHabilidades(): Promise<Habilidade[]> {
  try {
    const snapshot = await getDocs(colecaoRef);
    return snapshot.docs.map((item) => ({
      id: item.id,
      ...(item.data() as any),
    })) as Habilidade[];
  } catch (erro) {
    console.error("Erro ao listar habilidades:", erro);
    return [];
  }
}

export async function buscarHabilidade(id: string): Promise<Habilidade | null> {
  try {
    const docRef = doc(db, COLECAO, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...(docSnap.data() as any) } as Habilidade;
    }
    return null;
  } catch (erro) {
    console.error("Erro ao buscar habilidade:", erro);
    return null;
  }
}

export async function salvarHabilidade(dados: Partial<Habilidade>, arquivoImagem?: File) {
  try {
    let urlImagem = dados.imagem;

    if (arquivoImagem) {
      const storageRef = ref(storage, `habilidades/${Date.now()}_${arquivoImagem.name}`);
      const snapshot = await uploadBytes(storageRef, arquivoImagem);
      urlImagem = await getDownloadURL(snapshot.ref);
    }

    const payload = { ...dados, imagem: urlImagem };

    if (dados.id) {
      const docRef = doc(db, COLECAO, dados.id);
      await updateDoc(docRef, payload);
      return dados.id;
    } else {
      const docRef = await addDoc(colecaoRef, payload);
      return docRef.id;
    }
  } catch (erro) {
    console.error("Erro ao salvar habilidade:", erro);
    return null;
  }
}

export async function excluirHabilidade(id: string) {
  try {
    await deleteDoc(doc(db, COLECAO, id));
    return true;
  } catch (erro) {
    console.error("Erro ao excluir habilidade:", erro);
    return false;
  }
}
