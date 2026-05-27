"use client";
import { useEffect, useState } from "react";
import {
  buscarPersonagem,
  completarPersonagem
} from "../services/personagemService";

export default function usePersonagem(id: number | string) {
  const [personagemAtual, setPersonagemAtual] = useState<any>(null);

  useEffect(() => {
    async function carregar() {
      const base = await buscarPersonagem(id);
      if (base) {
        const completo = await completarPersonagem(base);
        setPersonagemAtual(completo);
      } else {
        setPersonagemAtual(null);
      }
    }
    carregar();
  }, [id]);

  return {
    personagemAtual,
    setPersonagemAtual
  };
}
