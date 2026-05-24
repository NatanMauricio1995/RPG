import { 
  createDocument, 
  listDocuments, 
  getDocument, 
  updateDocument, 
  deleteDocument 
} from "../firebase/firestore";
import { NPC } from "../types";

export async function criarNPC(npc: Partial<NPC>) {
  return await createDocument("npcs", npc);
}

export async function listarNPCs() {
  return await listDocuments("npcs") as NPC[];
}

export async function buscarNPC(id: string) {
  return await getDocument("npcs", id) as NPC;
}

export async function atualizarNPC(id: string, data: Partial<NPC>) {
  await updateDocument("npcs", id, data);
}

export async function excluirNPC(id: string) {
  await deleteDocument("npcs", id);
}
