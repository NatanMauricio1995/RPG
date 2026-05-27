import { Atributos, Personagem, Classe, Raca, Item } from "../types/domain";

export function calcularAtributoFinal(base: number, bonus: number) {
  return base + bonus;
}

export function calcularModificador(atributo: number) {
  return Math.floor((atributo - 10) / 2);
}

export function calcularVida(vidaBase: number, constituicao: number, nivel: number) {
  return vidaBase + calcularModificador(constituicao) * nivel;
}

export function calcularBonusProficiencia(nivel: number) {
  if (nivel <= 4) return 2;
  if (nivel <= 8) return 3;
  if (nivel <= 12) return 4;
  if (nivel <= 16) return 5;
  return 6;
}

/**
 * Calcula os atributos finais somando base, bônus de raça, classe, itens e efeitos.
 */
export function calcularAtributosFinais(
  personagem: Personagem,
  classeDados: Classe,
  racaDados: Raca,
  itensEquipados: Item[]
): Atributos {
  const atributos: Atributos = { ...personagem.atributosBase };

  // 1. Bônus de Raça
  if (racaDados?.bonus) {
    Object.entries(racaDados.bonus).forEach(([attr, val]) => {
      if (attr in atributos) (atributos as any)[attr] += Number(val || 0);
    });
  }

  // 2. Bônus de Classe
  if (classeDados?.bonus) {
    Object.entries(classeDados.bonus).forEach(([attr, val]) => {
      if (attr in atributos) (atributos as any)[attr] += Number(val || 0);
    });
  }

  // 3. Bônus de Equipamentos
  itensEquipados.forEach((item) => {
    if (!item) return;
    if (item.bonus) {
      Object.entries(item.bonus).forEach(([attr, val]) => {
        if (attr in atributos) (atributos as any)[attr] += Number(val || 0);
      });
    }
    if (item.attrsMods) {
      Object.entries(item.attrsMods).forEach(([attr, val]) => {
        if (attr in atributos) (atributos as any)[attr] += Number(val || 0);
      });
    }
  });

  // 4. Efeitos Ativos (Temporários ou Passivas)
  if (personagem.efeitosAtivos) {
    personagem.efeitosAtivos.forEach((efeito: any) => {
      if (efeito.tipo in atributos) (atributos as any)[efeito.tipo] += Number(efeito.valor || 0);
    });
  }

  return atributos;
}

/**
 * Versão estendida que retorna status derivados (Vida, Mana, Defesa, etc.)
 */
export function calcularStatusCompletos(
  personagem: any,
  racaDados?: any,
  classeDados?: any,
  niveisDados?: any[],
  itensEquipados: any[] = []
) {
  const atributosFinais = calcularAtributosFinais(
    personagem,
    classeDados,
    racaDados,
    itensEquipados
  );

  const nivelAtual = personagem.nivel || 1;
  const bonusVidaMana = { vida: 0, mana: 0, armadura: 0, velocidade: 0, critico: 0, ataque: 0 };

  // Bônus acumulados de níveis
  if (niveisDados) {
    niveisDados.forEach((n) => {
      if (n.nivel <= nivelAtual && n.bonus) {
        bonusVidaMana.vida += Number(n.bonus.vida || 0);
        bonusVidaMana.mana += Number(n.bonus.mana || 0);
      }
    });
  }

  // Bônus diretos de equipamentos
  itensEquipados.forEach(item => {
    if (item?.defesa) bonusVidaMana.armadura += Number(item.defesa);
    if (item?.ataque) bonusVidaMana.ataque += Number(item.ataque);
  });

  const vidaMaxima = calcularVida(classeDados?.vidaBase || 10, atributosFinais.constituicao, nivelAtual) + bonusVidaMana.vida;
  const manaMaxima = (classeDados?.manaBase || 10) + (Math.max(0, calcularModificador(atributosFinais.inteligencia)) * nivelAtual) + bonusVidaMana.mana;

  return {
    atributos: atributosFinais,
    vidaMaxima,
    manaMaxima,
    armadura: 10 + calcularModificador(atributosFinais.destreza) + bonusVidaMana.armadura,
    velocidade: 5 + calcularModificador(atributosFinais.destreza) + bonusVidaMana.velocidade,
    critico: 5 + bonusVidaMana.critico,
    ataque: calcularBonusProficiencia(nivelAtual) + bonusVidaMana.ataque,
  };
}

// ─── Inventário (Pesos e Capacidade) ─────────────────────────────────────────

// ─── Inventário (Pesos e Capacidade) ─────────────────────────────────────────

export function calcularPesoAtual(inventario: any[], itensCatalogo: any[]): number {
  return (inventario || []).reduce((acc, inv) => {
    const item = itensCatalogo.find((i) => String(i.id) === String(inv.itemId));
    return acc + (item?.peso || 0) * (inv.quantidade || 0);
  }, 0);
}

export function verificarPesoExcedido(personagem: any, itensCatalogo: any[]): boolean {
  const pesoAtual = calcularPesoAtual(personagem.inventario, itensCatalogo);
  const capacidade = personagem.capacidadeMaxima || 50;
  return pesoAtual > capacidade;
}
