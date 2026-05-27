import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  orderBy,
  limit,
  startAfter,
  QueryConstraint,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./config";

/**
 * Cria um novo documento em uma coleção.
 */
export const createDocument = async (collectionName: string, data: any) => {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Lista documentos de uma coleção com filtros opcionais.
 */
export const listDocuments = async (
  collectionName: string,
  constraints: QueryConstraint[] = []
) => {
  const q = query(collection(db, collectionName), ...constraints);
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/**
 * Utilitário para consultas paginadas conforme solicitado.
 */
export async function queryPaginada<T>(
  colecao: string,
  filtros: QueryConstraint[],
  limite: number,
  cursor?: QueryDocumentSnapshot
): Promise<{ dados: T[]; proximoCursor: QueryDocumentSnapshot | null }> {
  const constraints: QueryConstraint[] = [...filtros, limit(limite)];

  if (cursor) {
    constraints.push(startAfter(cursor));
  }

  const q = query(collection(db, colecao), ...constraints);
  const snapshot = await getDocs(q);

  const dados = snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as T[];

  const proximoCursor = snapshot.docs.length > limite - 1 ? snapshot.docs[snapshot.docs.length - 1] : null;

  return {
    dados,
    proximoCursor,
  };
}

/**
 * Atualiza um documento existente.
 */
export const updateDocument = async (
  collectionName: string,
  id: string,
  data: any
) => {
  await updateDoc(doc(db, collectionName, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Exclui um documento.
 */
export const deleteDocument = async (collectionName: string, id: string) => {
  await deleteDoc(doc(db, collectionName, id));
};
