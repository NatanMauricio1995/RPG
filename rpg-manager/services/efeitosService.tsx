import { calcularModificador } from "./calculoService";
import { calcularAtributosFinais } from "./personagemService";
import type { EfeitoAtivo, Personagem, BonusEquipados, Atributos, Equipados } from "../types/domain";

export const ATRIBUTOS_COMBATE: (keyof Atributos)[] = [
  "forca", "destreza", "constituicao",
  "inteligencia", "sabedoria", "carisma",
];

export type { EfeitoAtivo };

export function calcularBonusEquipados(equipados: Partial<Equipados> | any): BonusEquipados {
  const bonus: BonusEquipados = {
    forca: 0,
    destreza: 0,
    constituicao: 0,
    inteligencia: 0,
    sabedoria: 0,
    carisma: 0,
    vida: 0,
    mana: 0,
    critico: 0,
    armadura: 0,
    velocidade: 0,
    escudo: 0,
    ataque: 0,
    defesa: 0,
  };

  // Se for o novo sistema, o personagem tem o inventário. 
  // Mas esta função parece ser usada para personagens parciais ou genéricos.
  // Vamos manter a compatibilidade mas priorizar o novo sistema se disponível.
  
  Object.values(equipados || {})
    .filter(Boolean)
    .forEach((item: any) => {
      // Bonus diretos do item
      Object.entries(item.bonus || {}).forEach(([atributo, valor]) => {
        const key = normalizarTipoEfeito(atributo);
        bonus[key] = (bonus[key] || 0) + Number(valor || 0);
      });

      // Efeitos do item
      (item.efeitos || []).forEach((efeito: any) => {
        const tipo = normalizarTipoEfeito(efeito.tipo);
        if (tipo in bonus) bonus[tipo] += Number(efeito.valor || 0);
      });

      // Defesa direta
      if (item.defesa) bonus.armadura += Number(item.defesa || 0);
    });

  return bonus;
}

export function calcularStatusDerivados(personagem: any) {
  const atributos = calcularAtributosFinais(personagem);
  const bonus = calcularBonusEquipados(personagem.equipados || {});
  const nivel = Number(personagem.nivel ?? 1);

  const vidaBase = Number(personagem.vidaMaxima ?? personagem.vidaAtual ?? 10);
  const manaBase = Number(
    personagem.manaMaxima ??
    personagem.mana ??
    10 + Math.max(0, calcularModificador(atributos.inteligencia)) * nivel
  );

  return {
    atributos,
    bonus,
    vidaMaxima: Math.max(1, vidaBase + Number(bonus.vida || 0)),
    manaMaxima: Math.max(0, manaBase + Number(bonus.mana || 0)),
    armadura: 10 + calcularModificador(atributos.destreza) + Number(bonus.armadura || 0),
    velocidade: calcularModificador(atributos.destreza) + Number(bonus.velocidade || 0),
    critico: 5 + Number(bonus.critico || 0),
    escudo: Number(bonus.escudo || 0),
    efeitosEquipados: [] // Fallback para compatibilidade
  };
}

export function normalizarTipoEfeito(tipo: string): string {
  const valor = String(tipo || "").toLowerCase();
  if (valor.includes("veneno")) return "veneno";
  if (valor.includes("sangramento")) return "sangramento";
  if (valor.includes("paralis")) return "paralisia";
  if (valor.includes("medo")) return "medo";
  if (valor.includes("cura")) return "cura";
  if (valor.includes("escudo")) return "escudo";
  if (valor.includes("vida")) return "vida";
  if (valor.includes("mana")) return "mana";
  if (valor.includes("crit")) return "critico";
  if (valor.includes("armadura")) return "armadura";
  if (valor.includes("veloc")) return "velocidade";
  return valor;
}
