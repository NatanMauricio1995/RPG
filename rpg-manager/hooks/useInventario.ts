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

  const calcularPesoAtual = useCallback(
    (inventario: InventarioItem[]) => {
      return inventario.reduce((acc, inv) => {
        const item = itensCatalogo.find((i) => String(i.id) === String(inv.itemId));
        return acc + (item?.peso || 0) * inv.quantidade;
      }, 0);
    },
    [itensCatalogo]
  );

  const adicionarAoInventario = useCallback(
    async (itemId: string, quantidade: number = 1) => {
      if (!personagem) return;

      const item = itensCatalogo.find((i) => String(i.id) === String(itemId));
      if (!item) return;

      const novoInventario = [...(personagem.inventario || [])];
      const index = novoInventario.findIndex((i) => i.itemId === itemId);

      const pesoAdicional = item.peso * quantidade;
      const pesoAtual = calcularPesoAtual(novoInventario);
      const capacidadeMaxima = personagem.capacidadeMaxima || 50;

      if (pesoAtual + pesoAdicional > capacidadeMaxima) {
        throw new Error(`Capacidade máxima excedida! (${(pesoAtual + pesoAdicional).toFixed(1)}kg / ${capacidadeMaxima}kg)`);
      }

      if (index >= 0) {
        novoInventario[index].quantidade += quantidade;
      } else {
        novoInventario.push({ itemId, quantidade, equipado: false });
      }

      const personagemAtualizado = { ...personagem, inventario: novoInventario };
      await salvarPersonagem(personagemAtualizado);
      if (onUpdate) onUpdate(personagemAtualizado);
    },
    [personagem, itensCatalogo, calcularPesoAtual, onUpdate]
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

      const item = itensCatalogo.find((i) => String(i.id) === String(itemId));
      if (!item) return;

      const novoInventario = [...(personagem.inventario || [])];
      const index = novoInventario.findIndex((i) => i.itemId === itemId);
      if (index < 0) return;

      const novaQuantidade = Math.max(0, novoInventario[index].quantidade + delta);
      
      if (delta > 0) {
        const pesoAdicional = item.peso * delta;
        const pesoAtual = calcularPesoAtual(novoInventario);
        const capacidadeMaxima = personagem.capacidadeMaxima || 50;

        if (pesoAtual + pesoAdicional > capacidadeMaxima) {
          throw new Error(`Capacidade máxima excedida! (${(pesoAtual + pesoAdicional).toFixed(1)}kg / ${capacidadeMaxima}kg)`);
        }
      }

      if (novaQuantidade === 0) {
        await removerDoInventario(itemId);
        return;
      }

      novoInventario[index].quantidade = novaQuantidade;

      const personagemAtualizado = { ...personagem, inventario: novoInventario };
      await salvarPersonagem(personagemAtualizado);
      if (onUpdate) onUpdate(personagemAtualizado);
    },
    [personagem, itensCatalogo, calcularPesoAtual, removerDoInventario, onUpdate]
  );

  const consumirItem = useCallback(
    async (itemId: string, quantidade: number = 1) => {
      if (!personagem) return;

      const itemInv = (personagem.inventario || []).find((i) => i.itemId === itemId);
      if (!itemInv || itemInv.quantidade < quantidade) {
        throw new Error("Quantidade insuficiente para consumir.");
      }

      await alterarQuantidade(itemId, -quantidade);
    },
    [personagem, alterarQuantidade]
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

  const pesoTotal = calcularPesoAtual(personagem?.inventario || []);
  const capacidadeMaxima = personagem?.capacidadeMaxima || 50;
  const porcentagemPeso = (pesoTotal / capacidadeMaxima) * 100;
  
  let corPeso = "var(--cor-sucesso)"; // verde
  if (porcentagemPeso > 90) {
    corPeso = "var(--cor-perigo)"; // vermelho
  } else if (porcentagemPeso > 70) {
    corPeso = "var(--cor-alerta)"; // amarelo
  }

  return {
    itensCatalogo,
    inventario: inventarioResolvido,
    adicionarAoInventario,
    removerDoInventario,
    alterarQuantidade,
    consumirItem,
    alternarEquipamento,
    pesoTotal,
    capacidadeMaxima,
    porcentagemPeso,
    corPeso,
  };
}
