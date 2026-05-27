"use client";

import { createDocument } from "../firebase/firestore";

export interface RegistroHistorico {
  data: string; // ISO
  participantes: string[];
  vencedor: 'aliados' | 'inimigos' | 'empate';
  danos: { atacanteId: string; alvoId: string; valor: number }[];
}

/**
 * Salva o histórico de combate no Firestore.
 */
export async function salvarHistorico(dados: RegistroHistorico) {
  try {
    const id = await createDocument("historico", {
      ...dados,
      data: dados.data || new Date().toISOString(),
    });
    return id;
  } catch (error) {
    console.error("Erro ao salvar histórico:", error);
    throw error;
  }
}
