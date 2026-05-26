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

export function calcularAtributosFinais(
  personagem: any,
  racaDados?: any,
  classeDados?: any,
  niveisDados?: any[],
  itensEquipados: any[] = []
) {
  const atributosBase = { ...personagem.atributosBase };
  const bonus = {
    forca: 0,
    destreza: 0,
    constituicao: 0,
    inteligencia: 0,
    sabedoria: 0,
    carisma: 0,
    vida: 0,
    mana: 0,
    armadura: 0,
    velocidade: 0,
    critico: 0,
    ataque: 0,
  };

  // 1. Bônus de Raça
  if (racaDados?.bonus) {
    Object.entries(racaDados.bonus).forEach(([attr, val]) => {
      if (attr in bonus) (bonus as any)[attr] += Number(val);
    });
  }

  // 2. Bônus de Classe
  if (classeDados?.bonus) {
    Object.entries(classeDados.bonus).forEach(([attr, val]) => {
      if (attr in bonus) (bonus as any)[attr] += Number(val);
    });
  }

  // 3. Bônus de Nível (acumulado)
  const nivelAtual = personagem.nivel || 1;
  if (niveisDados) {
    niveisDados.forEach((n) => {
      if (n.nivel <= nivelAtual && n.bonus) {
        Object.entries(n.bonus).forEach(([attr, val]) => {
          if (attr in bonus) (bonus as any)[attr] += Number(val);
        });
      }
    });
  }

  // 4. Bônus de Equipamentos
  itensEquipados.forEach((item) => {
    if (!item) return;
    if (item.bonus) {
      Object.entries(item.bonus).forEach(([attr, val]) => {
        if (attr in bonus) (bonus as any)[attr] += Number(val);
      });
    }
    if (item.attrsMods) {
      Object.entries(item.attrsMods).forEach(([attr, val]) => {
        if (attr in bonus) (bonus as any)[attr] += Number(val);
      });
    }
    if (item.defesa) bonus.armadura += Number(item.defesa);
    if (item.ataque) bonus.ataque += Number(item.ataque);
  });

  // 5. Efeitos Ativos (Passivas, Temporários)
  if (personagem.efeitosAtivos) {
    personagem.efeitosAtivos.forEach((efeito: any) => {
      if (efeito.tipo in bonus) (bonus as any)[efeito.tipo] += Number(efeito.valor);
    });
  }

  const atributosFinais = {
    forca: atributosBase.forca + bonus.forca,
    destreza: atributosBase.destreza + bonus.destreza,
    constituicao: atributosBase.constituicao + bonus.constituicao,
    inteligencia: atributosBase.inteligencia + bonus.inteligencia,
    sabedoria: atributosBase.sabedoria + bonus.sabedoria,
    carisma: atributosBase.carisma + bonus.carisma,
  };

  const vidaMaxima = calcularVida(classeDados?.vidaBase || 10, atributosFinais.constituicao, nivelAtual) + bonus.vida;
  
  // Mana Base + (Modificador de Int * Nível) + Bônus
  const manaMaxima = (classeDados?.manaBase || 10) + (Math.max(0, calcularModificador(atributosFinais.inteligencia)) * nivelAtual) + bonus.mana;

  return {
    atributos: atributosFinais,
    vidaMaxima,
    manaMaxima,
    armadura: 10 + calcularModificador(atributosFinais.destreza) + bonus.armadura,
    velocidade: 5 + calcularModificador(atributosFinais.destreza) + bonus.velocidade,
    critico: 5 + bonus.critico,
    ataque: calcularBonusProficiencia(nivelAtual) + bonus.ataque,
    bonus,
  };
}

export { calcularVida, calcularModificador, calcularBonusProficiencia };
