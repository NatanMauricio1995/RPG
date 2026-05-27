import {
  collection, doc,
  addDoc, getDocs, getDoc, updateDoc, deleteDoc,
  query, where, serverTimestamp, orderBy, limit,
} from "firebase/firestore";
import { db } from "./config";

export const createDocument = async (collectionName: string, data: any) => {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const listDocuments = async (collectionName: string, queries: any[] = []) => {
  const q = query(collection(db, collectionName), ...queries);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getDocument = async (collectionName: string, id: string) => {
  const docRef = doc(db, collectionName, id);
  const snap   = await getDoc(docRef);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateDocument = async (collectionName: string, id: string, data: any) => {
  await updateDoc(doc(db, collectionName, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteDocument = async (collectionName: string, id: string) => {
  await deleteDoc(doc(db, collectionName, id));
};
