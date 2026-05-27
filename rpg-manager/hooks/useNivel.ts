"use client";

import { useState } from "react";

export default function useNivel(
  personagemAtual: any,
  setPersonagemAtual: any
) {
  const [subindoNivel, setSubindoNivel] = useState(false);
  const [pontosRestantes, setPontosRestantes] = useState(4);
  const [atributosTemp, setAtributosTemp] = useState({
    forca: 0,
    destreza: 0,
    constituicao: 0,
    inteligencia: 0,
    sabedoria: 0,
    carisma: 0,
  });

  function adicionarPonto(atributo: string) {
    if (pontosRestantes <= 0) return;

    setAtributosTemp((anterior: any) => ({
      ...anterior,
      [atributo]: anterior[atributo] + 1,
    }));

    setPontosRestantes((anterior) => anterior - 1);
  }

  function removerPonto(atributo: string) {
    if (atributosTemp[atributo as keyof typeof atributosTemp] <= 0) return;

    setAtributosTemp((anterior: any) => ({
      ...anterior,
      [atributo]: anterior[atributo] - 1,
    }));

    setPontosRestantes((anterior) => anterior + 1);
  }

  function confirmarNivel() {
    const novosAtributosBase = {
      forca: (personagemAtual.atributosBase?.forca || 10) + atributosTemp.forca,
      destreza: (personagemAtual.atributosBase?.destreza || 10) + atributosTemp.destreza,
      constituicao: (personagemAtual.atributosBase?.constituicao || 10) + atributosTemp.constituicao,
      inteligencia: (personagemAtual.atributosBase?.inteligencia || 10) + atributosTemp.inteligencia,
      sabedoria: (personagemAtual.atributosBase?.sabedoria || 10) + atributosTemp.sabedoria,
      carisma: (personagemAtual.atributosBase?.carisma || 10) + atributosTemp.carisma,
    };

    setPersonagemAtual({
      ...personagemAtual,
      nivel: (personagemAtual.nivel || 1) + 1,
      atributosBase: novosAtributosBase,
      // Deixamos o completarPersonagem no setPersonagemAtual (ou no hook usePersonagem) 
      // lidar com o cálculo da nova vida máxima e mana.
      vidaAtual: (personagemAtual.vidaMaxima || 10) + 10 // Cura ao subir de nível
    });

    setSubindoNivel(false);
    setPontosRestantes(4);
    setAtributosTemp({
      forca: 0,
      destreza: 0,
      constituicao: 0,
      inteligencia: 0,
      sabedoria: 0,
      carisma: 0,
    });
  }

  return {
    subindoNivel,
    setSubindoNivel,
    pontosRestantes,
    atributosTemp,
    adicionarPonto,
    removerPonto,
    confirmarNivel,
  };
}
