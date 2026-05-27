"use client";
import { useEffect, useState } from "react";
import {
  ouvirPersonagem,
  completarPersonagem
} from "../services/personagemService";

export default function usePersonagem(id: number | string) {
  const [personagemAtual, setPersonagemAtual] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    const unsubscribe = ouvirPersonagem(id, async (base) => {
      if (base) {
        const completo = await completarPersonagem(base);
        setPersonagemAtual(completo);
      } else {
        setPersonagemAtual(null);
      }
    });

    return () => unsubscribe();
  }, [id]);

  return {
    personagemAtual,
    setPersonagemAtual
  };
}
