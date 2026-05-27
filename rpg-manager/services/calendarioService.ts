"use client";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const COLECAO = "campanha";
const DOC_ID = "calendario";

export async function buscarCalendario() {
  try {
    const docSnap = await getDoc(doc(db, COLECAO, DOC_ID));
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (error) {
    console.error("Erro ao buscar calendário:", error);
  }
  return null;
}

export async function salvarCalendario(dados: any) {
  try {
    await setDoc(doc(db, COLECAO, DOC_ID), dados);
  } catch (error) {
    console.error("Erro ao salvar calendário:", error);
    throw error;
  }
}
