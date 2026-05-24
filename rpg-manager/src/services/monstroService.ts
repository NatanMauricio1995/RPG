import { listDocuments, getDocument, createDocument, updateDocument, deleteDocument } from "../firebase/firestore";

export async function listarMonstros() {
  const monstros = await listDocuments("monstros");
  const tipos = await listDocuments("tiposMonstros");
  
  return monstros.map((monstro: any) => {
    const tipo = tipos.find((t: any) => t.id === monstro.tipoId);
    return {
      ...monstro,
      tipo: tipo?.nome || "Criatura"
    };
  });
}

export async function buscarMonstro(id: string) {
  return await getDocument("monstros", id);
}

export async function criarMonstro(data: any) {
  return await createDocument("monstros", data);
}

export async function atualizarMonstro(id: string, data: any) {
  await updateDocument("monstros", id, data);
}

export async function excluirMonstro(id: string) {
  await deleteDocument("monstros", id);
}
