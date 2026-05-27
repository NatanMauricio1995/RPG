"use client";

import { useState, useCallback, useEffect } from "react";
import { listarItens, buscarItem } from "../services/itemService";
import { salvarPersonagem } from "../services/personagemService";
import type { Personagem, InventarioItem, Item } from "../types/domain";

export default function useInventario(personagem: Personagem | null, onUpdate?: (p: Personagem) => void) {
  const [itensCatalogo, setItensCatalogo] = useState<Item[]>([]);

  useEffect(() => {
    listarItens().then(setItensCatalogo);
  }, []);

  const adicionarAoInventario = useCallback(
    async (itemId: string) => {
      if (!personagem) return;

      const novoInventario = [...(personagem.inventario || [])];
      const index = novoInventario.findIndex((i) => i.itemId === itemId);

      if (index >= 0) {
        novoInventario[index].quantidade += 1;
      } else {
        novoInventario.push({ itemId, quantidade: 1, equipado: false });
      }

      const personagemAtualizado = { ...personagem, inventario: novoInventario };
      await salvarPersonagem(personagemAtualizado);
      if (onUpdate) onUpdate(personagemAtualizado);
    },
    [personagem, onUpdate]
  );

  const removerDoInventario = useCallback(
    async (itemId: string) => {
      if (!personagem) return;

      const novoInventario = (personagem.inventario || []).filter((i) => i.itemId !== itemId);
      
      // Também desequipar se estiver equipado
      const novosEquipados = { ...personagem.equipados };
      Object.keys(novosEquipados).forEach((slot) => {
        if ((novosEquipados as any)[slot] === itemId) {
          (novosEquipados as any)[slot] = null;
        }
      });

      const personagemAtualizado = { ...personagem, inventario: novoInventario, equipados: novosEquipados };
      await salvarPersonagem(personagemAtualizado);
      if (onUpdate) onUpdate(personagemAtualizado);
    },
    [personagem, onUpdate]
  );

  const alterarQuantidade = useCallback(
    async (itemId: string, delta: number) => {
      if (!personagem) return;

      const novoInventario = (personagem.inventario || [])
        .map((i) => {
          if (i.itemId === itemId) {
            return { ...i, quantidade: Math.max(0, i.quantidade + delta) };
          }
          return i;
        })
        .filter((i) => i.quantidade > 0);

      const personagemAtualizado = { ...personagem, inventario: novoInventario };
      await salvarPersonagem(personagemAtualizado);
      if (onUpdate) onUpdate(personagemAtualizado);
    },
    [personagem, onUpdate]
  );

  const alternarEquipamento = useCallback(
    async (itemId: string) => {
      if (!personagem) return;

      const item = await buscarItem(itemId);
      if (!item || !item.slot) return;

      const novoInventario = [...(personagem.inventario || [])];
      const itemInv = novoInventario.find((i) => i.itemId === itemId);
      if (!itemInv) return;

      const novosEquipados = { ...personagem.equipados };
      const slot = item.slot;
      const estaEquipado = itemInv.equipado;

      if (estaEquipado) {
        // Desequipar
        itemInv.equipado = false;
        (novosEquipados as any)[slot] = null;
      } else {
        // Equipar
        // Primeiro, desequipar o que estava no slot
        const idAnterior = (novosEquipados as any)[slot];
        if (idAnterior) {
          const anteriorInv = novoInventario.find((i) => i.itemId === idAnterior);
          if (anteriorInv) anteriorInv.equipado = false;
        }

        itemInv.equipado = true;
        (novosEquipados as any)[slot] = itemId;
      }

      const personagemAtualizado = { ...personagem, inventario: novoInventario, equipados: novosEquipados };
      await salvarPersonagem(personagemAtualizado);
      if (onUpdate) onUpdate(personagemAtualizado);
    },
    [personagem, onUpdate]
  );

  // Inventário com dados resolvidos - síncrono via itensCatalogo (cache)
  const inventarioResolvido = (personagem?.inventario || []).map((inv) => ({
    ...inv,
    dados: itensCatalogo.find(i => String(i.id) === String(inv.itemId)) || null,
  }));

  return {
    itensCatalogo,
    inventario: inventarioResolvido,
    adicionarAoInventario,
    removerDoInventario,
    alterarQuantidade,
    alternarEquipamento,
  };
}
