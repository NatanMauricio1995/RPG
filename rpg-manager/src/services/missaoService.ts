import { 
  createDocument, 
  listDocuments, 
  getDocument, 
  updateDocument, 
  deleteDocument 
} from "../firebase/firestore";
import { Missao } from "../types";

export async function criarMissao(missao: Partial<Missao>) {
  return await createDocument("missoes", missao);
}

export async function listarMissoes() {
  return await listDocuments("missoes") as Missao[];
}

export async function buscarMissao(id: string) {
  return await getDocument("missoes", id) as Missao;
}

export async function atualizarMissao(id: string, data: Partial<Missao>) {
  await updateDocument("missoes", id, data);
}

export async function excluirMissao(id: string) {
  await deleteDocument("missoes", id);
}
