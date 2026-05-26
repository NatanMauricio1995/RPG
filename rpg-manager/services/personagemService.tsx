"use client";

import personagensData from "../data/campanha/personagens.json";
import classes from "../data/sistema/classes.json";
import racas from "../data/sistema/racas.json";
import niveis from "../data/sistema/niveis.json";
import { calcularVida } from "./calculoService";
import { buscarItem } from "./itemService";
import { getStorageItem, setStorageItem, STORAGE_KEYS } from "../utils/storage";
import type {
  Personagem,
  PersonagemCompleto,
  Equipados,
  Atributos,
  Classe,
  Raca,
  Nivel,
} from "../types/domain";

export const PERSONAGENS_STORAGE_KEY = STORAGE_KEYS.PERSONAGENS;

export const ATRIBUTOS_PADRAO: Atributos = {
  forca: 10,
  destreza: 10,
  constituicao: 10,
  inteligencia: 10,
  sabedoria: 10,
  carisma: 10,
};

export const EQUIPADOS_PADRAO: Equipados = {
  cabeca: null,
  arma: null,
  escudo: null,
  armadura: null,
  cintura: null,
  acessorio: null,
  bolsa: null,
};

export function criarModeloPersonagem(): Personagem {
  return {
    id: Date.now(),
    nome: "",
    imagem: "/imagens/racas/padrao.png",
    racaId: (racas[0] as Classe)?.id ?? 1,
    classeId: (classes[0] as Classe)?.id ?? 1,
    nivel: 1,
    xpAtual: 0,
    xpNecessario: 100,
    vidaAtual: 10,
    ouro: 0,
    inventario: [],
    equipados: { ...EQUIPADOS_PADRAO },
    atributosBase: { ...ATRIBUTOS_PADRAO },
  };
}

export function carregarPersonagensPersonalizados(): Personagem[] {
  return getStorageItem<Personagem[]>(PERSONAGENS_STORAGE_KEY, []);
}

export function salvarPersonagensPersonalizados(personagens: Personagem[]): void {
  setStorageItem(PERSONAGENS_STORAGE_KEY, personagens);
}

export function normalizarPersonagem(personagem: Partial<Personagem>): Personagem {
  const p = {
    ...criarModeloPersonagem(),
    ...personagem,
    equipados: {
      ...EQUIPADOS_PADRAO,
      ...(personagem?.equipados ?? {}),
    },
    atributosBase: {
      ...ATRIBUTOS_PADRAO,
      ...(personagem?.atributosBase ?? {}),
    },
  };

  // Migração de inventário antigo (number[]) para novo (InventarioItem[])
  if (personagem?.inventario && Array.isArray(personagem.inventario)) {
    p.inventario = personagem.inventario.map((item: any) => {
      if (typeof item === "number") {
        return { itemId: item, quantidade: 1, equipado: false };
      }
      return item;
    });
  } else {
    p.inventario = [];
  }

  return p as Personagem;
}

export function listarPersonagens(): Personagem[] {
  const personalizados = carregarPersonagensPersonalizados();
  const porId = new Map<number, Personagem>();

  (personagensData as any[]).forEach((personagem) => {
    porId.set(personagem.id, normalizarPersonagem(personagem));
  });

  personalizados.forEach((personagem) => {
    porId.set(personagem.id, normalizarPersonagem(personagem));
  });

  return Array.from(porId.values());
}

export function buscarPersonagem(id: number | string): Personagem | undefined {
  const numId = Number(id);
  return listarPersonagens().find((personagem) => personagem.id === numId);
}

// ... (salvarPersonagem, atualizarPersonagem unchanged)

/**
 * Calcula os atributos finais somando base + raça + classe + equipamentos + efeitos
 */
export function calcularAtributosFinais(personagem: Personagem): Atributos {
  if (!personagem) return { ...ATRIBUTOS_PADRAO };

  const raca = (racas as Raca[]).find((item) => item.id === personagem.racaId);
  const dadosNivel = (niveis as Nivel[]).find((item) => item.nivel === personagem.nivel);

  // Começa com atributos base
  const atributos: Atributos = { 
    ...ATRIBUTOS_PADRAO,
    ...(personagem.atributosBase || {}) 
  };

  // Soma bônus de raça
  if (raca?.bonus) {
    Object.entries(raca.bonus).forEach(([attr, bonus]) => {
      if (attr in atributos) {
        atributos[attr as keyof Atributos] += Number(bonus || 0);
      }
    });
  }

  // Soma bônus de nível (classe)
  if (dadosNivel?.bonus) {
    Object.entries(dadosNivel.bonus).forEach(([attr, bonus]) => {
      if (attr in atributos && attr !== "vida") {
        atributos[attr as keyof Atributos] += Number(bonus || 0);
      }
    });
  }

  // Soma bônus e efeitos de equipamentos
  const inv = personagem.inventario || [];
  inv.forEach((invItem) => {
    if (invItem.equipado) {
      const item = buscarItem(invItem.itemId);
      if (!item) return;

      // Bonus fixos
      if (item.bonus) {
        Object.entries(item.bonus).forEach(([attr, bonus]) => {
          if (attr in atributos) {
            atributos[attr as keyof Atributos] += Number(bonus || 0);
          }
        });
      }

      // Efeitos temporários/constantes do item que afetam atributos
      if (item.efeitos) {
        item.efeitos.forEach((efeito) => {
          const tipo = efeito.tipo.toLowerCase();
          if (tipo in atributos) {
            atributos[tipo as keyof Atributos] += Number(efeito.valor || 0);
          }
        });
      }
    }
  });

  return atributos;
}

/**
 * Completa um personagem com dados derivados (classe, raca, atributos finais, etc)
 */
export function completarPersonagem(personagem: Personagem): PersonagemCompleto {
  const personagemBase = normalizarPersonagem(personagem);

  const classe = (classes as Classe[]).find(
    (item) => item.id === personagemBase.classeId
  );

  const raca = (racas as Raca[]).find(
    (item) => item.id === personagemBase.racaId
  );

  const dadosNivel = (niveis as Nivel[]).find(
    (item) => item.nivel === personagemBase.nivel
  );

  const atributos = calcularAtributosFinais(personagemBase);

  const vidaMaxima = calcularVida(
    classe?.vidaBase ?? 8,
    atributos.constituicao,
    personagemBase.nivel
  ) + (dadosNivel?.bonus?.vida ?? 0);

  return {
    ...personagemBase,
    classe: classe?.nome ?? "",
    raca: raca?.nome ?? "",
    classeDados: classe as Classe,
    racaDados: raca as Raca,
    dadosNivel: dadosNivel as Nivel,
    atributos,
    vidaMaxima,
  };
}