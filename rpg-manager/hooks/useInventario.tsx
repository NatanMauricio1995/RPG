"use client";

import { useState, useEffect } from "react";
import { buscarItem, equiparItem, desequiparItem } from "../services/itemService";
import { salvarPersonagem } from "../services/personagemService";
import type { Personagem, InventarioItem, Equipados } from "../types/domain";

export function useInventario(personagemInicial: Personagem | null) {
  const [personagem, setPersonagem] = useState<Personagem | null>(personagemInicial);

  useEffect(() => {
    setPersonagem(personagemInicial);
  }, [personagemInicial]);

  async function handleEquipar(itemId: string) {
    if (!personagem) return;
    const novoPersonagem = equiparItem(personagem, itemId);
    setPersonagem(novoPersonagem);
    await salvarPersonagem(novoPersonagem);
  }

  async function handleDesequipar(itemId: string) {
    if (!personagem) return;
    const novoPersonagem = desequiparItem(personagem, itemId);
    setPersonagem(novoPersonagem);
    await salvarPersonagem(novoPersonagem);
  }

  async function handleAdicionarItem(itemId: string, quantidade: number = 1) {
    if (!personagem) return;
    
    const novoInventario = [...personagem.inventario];
    const index = novoInventario.findIndex(i => i.itemId === itemId);
    
    if (index >= 0) {
      novoInventario[index].quantidade += quantidade;
    } else {
      novoInventario.push({ itemId, quantidade, equipado: false });
    }

    const novoPersonagem = { ...personagem, inventario: novoInventario };
    setPersonagem(novoPersonagem);
    await salvarPersonagem(novoPersonagem);
  }

  async function handleRemoverItem(itemId: string, quantidade: number = 1) {
    if (!personagem) return;
    
    let novoInventario = [...personagem.inventario];
    const index = novoInventario.findIndex(i => i.itemId === itemId);
    
    if (index >= 0) {
      novoInventario[index].quantidade -= quantidade;
      if (novoInventario[index].quantidade <= 0) {
        // Se estava equipado, desequipar primeiro
        let p = personagem;
        if (novoInventario[index].equipado) {
          p = desequiparItem(p, itemId);
        }
        novoInventario = p.inventario.filter(i => i.itemId !== itemId);
        const finalP = { ...p, inventario: novoInventario };
        setPersonagem(finalP);
        await salvarPersonagem(finalP);
        return;
      }
    }

    const novoPersonagem = { ...personagem, inventario: novoInventario };
    setPersonagem(novoPersonagem);
    await salvarPersonagem(novoPersonagem);
  }

  return {
    personagem,
    inventario: personagem?.inventario || [],
    equipados: personagem?.equipados || {},
    equipar: handleEquipar,
    desequipar: handleDesequipar,
    adicionarItem: handleAdicionarItem,
    removerItem: handleRemoverItem,
  };
}
