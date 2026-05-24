import { 
  createDocument, 
  listDocuments, 
  getDocument, 
  updateDocument, 
  deleteDocument 
} from "../firebase/firestore";
import { Area } from "../types";

export async function criarArea(area: Partial<Area>) {
  return await createDocument("areas", area);
}

export async function listarAreas() {
  return await listDocuments("areas") as Area[];
}

export async function buscarArea(id: string) {
  return await getDocument("areas", id) as Area;
}

export async function atualizarArea(id: string, data: Partial<Area>) {
  await updateDocument("areas", id, data);
}

export async function excluirArea(id: string) {
  await deleteDocument("areas", id);
}
