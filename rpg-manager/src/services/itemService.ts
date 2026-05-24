import { listDocuments, getDocument, createDocument, updateDocument, deleteDocument } from "../firebase/firestore";
import { Item, ItemSlot } from "../types";

export async function listarItens() {
  return await listDocuments("itens") as Item[];
}

export async function buscarItem(id: string | number) {
  if (!id) return null;
  return await getDocument("itens", String(id)) as Item;
}

export async function criarItem(item: Partial<Item>) {
  return await createDocument("itens", item);
}

export async function atualizarItem(id: string, data: Partial<Item>) {
  await updateDocument("itens", id, data);
}

export async function excluirItem(id: string) {
  await deleteDocument("itens", id);
}

export async function resolverInventario(inventarioIds: (string | number)[]) {
  const itens = await Promise.all((inventarioIds || []).map(id => buscarItem(id)));
  return itens.filter(Boolean) as Item[];
}

export async function resolverEquipados(equipados: Record<ItemSlot, string | null>) {
  const resultado: any = {};
  await Promise.all(
    Object.entries(equipados || {}).map(async ([slot, id]) => {
      if (id) {
        resultado[slot] = await buscarItem(id);
      } else {
        resultado[slot] = null;
      }
    })
  );
  return resultado;
}

export function normalizarItem(item: any): Item {
  return {
    ...item,
    id: item.id,
    tipo: item.tipo || "Diversos",
    raridade: item.raridade || "Comum",
    bonus: item.bonus || {},
    efeitos: item.efeitos || []
  };
}

export function verificarCompatibilidade(item: Item, slot: ItemSlot): boolean {
  if (!item.slotCompativel) return false;
  return item.slotCompativel.includes(slot);
}
