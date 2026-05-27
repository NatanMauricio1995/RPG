"use client";

import { calcularModificador, calcularAtributosFinais } from "./calculoService";
import { resolverEquipados } from "./itemService";
import type { EfeitoAtivo, BonusEquipados, Atributos, Equipados } from "../types/domain";

// =============================================
// CONSTANTES
// =============================================

export const ATRIBUTOS_COMBATE: (keyof Atributos)[] = [
  "forca", "destreza", "constituicao",
  "inteligencia", "sabedoria", "carisma",
];

// Alias legado (compatibilidade com arquivos que usam atributosCombate em minúsculo)
export const atributosCombate = ATRIBUTOS_COMBATE;

export type { EfeitoAtivo };

// =============================================
// NORMALIZAÇÃO
// =============================================

export function normalizarTipoEfeito(tipo: string): string {
  const valor = String(tipo || "").toLowerCase();
  if (valor.includes("veneno"))      return "veneno";
  if (valor.includes("sangramento")) return "sangramento";
  if (valor.includes("paralis"))     return "paralisia";
  if (valor.includes("medo"))        return "medo";
  if (valor.includes("cura"))        return "cura";
  if (valor.includes("escudo"))      return "escudo";
  if (valor.includes("vida"))        return "vida";
  if (valor.includes("mana"))        return "mana";
  if (valor.includes("crit"))        return "critico";
  if (valor.includes("armadura"))    return "armadura";
  if (valor.includes("veloc"))       return "velocidade";
  return valor;
}

// =============================================
// EFEITOS DE EQUIPAMENTOS (sistema legado: equipados por slot)
// =============================================

export function coletarEfeitosEquipados(equipados: any): EfeitoAtivo[] {
  return Object.values(resolverEquipados(equipados))
    .filter(Boolean)
    .flatMap((item: any) =>
      (item.efeitos || []).map((efeito: any) => ({
        ...efeito,
        origem: item.nome,
      }))
    );
}

// =============================================
// BÔNUS DE EQUIPADOS
// Suporta os dois sistemas:
//   - Novo: personagem.inventario[] com equipado:true
//   - Legado: personagem.equipados (slots diretos)
// =============================================

export function calcularBonusEquipados(
  equipadosOuPersonagem: Partial<Equipados> | any
): BonusEquipados {
  const bonus: BonusEquipados = {
    forca: 0, destreza: 0, constituicao: 0,
    inteligencia: 0, sabedoria: 0, carisma: 0,
    vida: 0, mana: 0, critico: 0,
    armadura: 0, velocidade: 0, escudo: 0,
    ataque: 0, defesa: 0,
  };

  // Se vier um objeto de slots (arma, armadura, etc.), usar resolverEquipados
  const itens = Object.values(resolverEquipados(equipadosOuPersonagem)).filter(Boolean);

  itens.forEach((item: any) => {
    Object.entries(item.bonus || {}).forEach(([atributo, valor]) => {
      const key = normalizarTipoEfeito(atributo);
      bonus[key] = (bonus[key] || 0) + Number(valor || 0);
    });

    (item.efeitos || []).forEach((efeito: any) => {
      const tipo = normalizarTipoEfeito(efeito.tipo);
      if (tipo in bonus) bonus[tipo] += Number(efeito.valor || 0);
    });

    if (item.defesa) bonus.armadura += Number(item.defesa || 0);
  });

  return bonus;
}

// =============================================
// ATRIBUTOS COM EQUIPAMENTO (sistema legado)
// =============================================

export function calcularAtributosComEquipamento(personagem: any): Record<string, number> {
  const bonus = calcularBonusEquipados(personagem.equipados);
  const atributos: Record<string, number> = {};

  ATRIBUTOS_COMBATE.forEach((atributo) => {
    atributos[atributo] =
      Number(personagem.atributos?.[atributo] ?? personagem.atributosBase?.[atributo] ?? 10) +
      Number(bonus[atributo] || 0);
  });

  return atributos;
}

// =============================================
// STATUS DERIVADOS
// Usa o novo sistema (inventario[].equipado) como principal,
// com fallback para o sistema de slots legado.
// =============================================

export function calcularStatusDerivados(personagem: any) {
  // Atributos finais via calculoService (inclui raça, classe, nível)
  const atributos = calcularAtributosFinais(personagem);

  const bonus: BonusEquipados = {
    forca: 0, destreza: 0, constituicao: 0,
    inteligencia: 0, sabedoria: 0, carisma: 0,
    vida: 0, mana: 0, critico: 0,
    armadura: 0, velocidade: 0, escudo: 0,
    ataque: 0, defesa: 0,
  };

  // Novo sistema: lê inventario[] com equipado:true
  const inv = (personagem.inventario || []) as any[];
  const temInventarioNovo = inv.length > 0;

  if (temInventarioNovo) {
    // Importação dinâmica não disponível aqui — usar cache via resolverInventario síncrono
    // buscarItem é async; para status derivados usamos o cache local (localStorage)
    const cacheKey = "itens_cache";
    const cache = typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;
    const itensCache: any[] = cache ? JSON.parse(cache) : [];

    inv.forEach((invItem) => {
      if (!invItem.equipado) return;
      const item = itensCache.find((i: any) => String(i.id) === String(invItem.itemId));
      if (!item) return;

      if (item.bonus) {
        Object.entries(item.bonus).forEach(([attr, val]) => {
          const key = normalizarTipoEfeito(attr);
          if (key in bonus) (bonus as any)[key] += Number(val || 0);
        });
      }
      if (item.efeitos) {
        item.efeitos.forEach((efeito: any) => {
          const key = normalizarTipoEfeito(efeito.tipo);
          if (key in bonus) (bonus as any)[key] += Number(efeito.valor || 0);
        });
      }
      if (item.defesa) bonus.armadura += Number(item.defesa);
    });
  } else if (personagem.equipados) {
    // Fallback: sistema de slots legado
    const bonusLegado = calcularBonusEquipados(personagem.equipados);
    Object.keys(bonus).forEach((k) => {
      (bonus as any)[k] += bonusLegado[k] || 0;
    });
  }

  const vidaBase = Number(personagem.vidaMaxima ?? 10);
  const manaBase = Number(personagem.manaMaxima ?? 10);

  return {
    atributos,
    bonus,
    vidaMaxima: Math.max(1, vidaBase + Number(bonus.vida || 0)),
    manaMaxima: Math.max(0, manaBase + Number(bonus.mana || 0)),
    armadura: 10 + Math.floor((atributos.destreza - 10) / 2) + Number(bonus.armadura || 0),
    velocidade: Math.floor((atributos.destreza - 10) / 2) + 5 + Number(bonus.velocidade || 0),
    critico: 5 + Number(bonus.critico || 0),
    escudo: Number(bonus.escudo || 0),
    efeitosEquipados: temInventarioNovo ? [] : coletarEfeitosEquipados(personagem.equipados),
  };
}
