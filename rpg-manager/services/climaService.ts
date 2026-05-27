"use client";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const COLECAO = "sistema";
const DOC_ID = "clima";

export async function buscarDadosClima() {
  try {
    const docSnap = await getDoc(doc(db, COLECAO, DOC_ID));
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (error) {
    console.error("Erro ao buscar dados de clima:", error);
  }
  return null;
}
