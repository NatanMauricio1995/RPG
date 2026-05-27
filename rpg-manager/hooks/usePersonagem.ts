"use client";
import { useEffect, useState } from "react";
import {
  ouvirPersonagem,
  completarPersonagem
} from "../services/personagemService";

export default function usePersonagem(id: number | string) {
  const [personagemAtual, setPersonagemAtual] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErro(null);

    const unsubscribe = ouvirPersonagem(id, async (base) => {
      try {
        if (base) {
          const completo = await completarPersonagem(base);
          setPersonagemAtual(completo);
        } else {
          setPersonagemAtual(null);
        }
      } catch (e) {
        setErro("Erro ao carregar dados do personagem.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [id]);

  return {
    personagemAtual,
    setPersonagemAtual,
    loading,
    erro
  };
}
