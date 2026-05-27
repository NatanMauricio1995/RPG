"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { listarItens, buscarItem } from "../services/itemService";
import { 
  salvarPersonagem, 
  ouvirPersonagem, 
  removerItem, 
  alterarQuantidade as alterarQuantidadeService,
  consumirItem as consumirItemService,
  atualizarPersonagem
} from "../services/personagemService";
import type { Personagem, InventarioItem, Item } from "../types/domain";

export default function useInventario(
  personagemOuId: Personagem | string | number | null, 
  onUpdate?: (p: Personagem) => void
) {
  const [personagemInterno, setPersonagemInterno] = useState<Personagem | null>(
    typeof personagemOuId === "object" ? personagemOuId : null
  );
  const [itensCatalogo, setItensCatalogo] = useState<Item[]>([]);

  const pId = useMemo(() => {
    if (!personagemOuId) return null;
    return typeof personagemOuId === "object" ? personagemOuId.id : personagemOuId;
  }, [personagemOuId]);

  // Sync se for ID
  useEffect(() => {
    if (!pId || typeof personagemOuId === "object") return;
    
    return ouvirPersonagem(pId, (p) => {
      setPersonagemInterno(p);
      if (p && onUpdate) onUpdate(p);
    });
  }, [pId, personagemOuId, onUpdate]);

  // Sync se for objeto (atualiza estado interno quando o objeto mudar)
  useEffect(() => {
    if (typeof personagemOuId === "object") {
      setPersonagemInterno(personagemOuId);
    }
  }, [personagemOuId]);

  useEffect(() => {
    listarItens().then((res) => {
      if (Array.isArray(res)) {
        setItensCatalogo(res);
      } else {
        setItensCatalogo(res.itens || []);
      }
    });
  }, []);

  const personagem = personagemInterno;

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
      if (!personagem || !pId) return;

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

      await atualizarPersonagem(pId, { inventario: novoInventario });
    },
    [personagem, pId, itensCatalogo, calcularPesoAtual]
  );

  const removerDoInventario = useCallback(
    async (itemId: string) => {
      if (!pId) return;
      await removerItem(pId, itemId);
    },
    [pId]
  );

  const alterarQuantidade = useCallback(
    async (itemId: string, delta: number) => {
      if (!personagem || !pId) return;

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

      await alterarQuantidadeService(pId, itemId, novaQuantidade);
    },
    [personagem, pId, itensCatalogo, calcularPesoAtual]
  );

  const consumirItem = useCallback(
    async (itemId: string, quantidade: number = 1) => {
      if (!pId) return;
      await consumirItemService(pId, itemId, quantidade);
    },
    [pId]
  );

  const alternarEquipamento = useCallback(
    async (itemId: string) => {
      if (!personagem || !pId) return;

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

      await atualizarPersonagem(pId, { inventario: novoInventario, equipados: novosEquipados });
    },
    [personagem, pId]
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
