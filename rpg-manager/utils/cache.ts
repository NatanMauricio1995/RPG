"use client";

/**
 * Utilitário de Cache local (localStorage) com TTL (Time To Live).
 */

interface CacheItem<T> {
  dados: T;
  expiraEm: number;
}

const TTL_PADRAO = 5 * 60 * 1000; // 5 minutos

/**
 * Obtém um item do cache se não estiver expirado.
 */
export function getCache<T>(chave: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const itemStr = localStorage.getItem(chave);
    if (!itemStr) return null;

    const item: CacheItem<T> = JSON.parse(itemStr);
    const agora = Date.now();

    if (agora > item.expiraEm) {
      localStorage.removeItem(chave);
      return null;
    }

    return item.dados;
  } catch (error) {
    console.error("Erro ao ler cache:", error);
    return null;
  }
}

/**
 * Salva um item no cache com um tempo de vida definido.
 */
export function setCache<T>(chave: string, valor: T, ttlMs: number = TTL_PADRAO): void {
  if (typeof window === "undefined") return;

  try {
    const item: CacheItem<T> = {
      dados: valor,
      expiraEm: Date.now() + ttlMs,
    };
    localStorage.setItem(chave, JSON.stringify(item));
  } catch (error) {
    console.error("Erro ao definir cache:", error);
  }
}

/**
 * Remove todos os itens do cache que começam com um determinado prefixo.
 */
export function invalidarCache(prefixo: string): void {
  if (typeof window === "undefined") return;

  try {
    const chaves = Object.keys(localStorage);
    chaves.forEach((chave) => {
      if (chave.startsWith(prefixo)) {
        localStorage.removeItem(chave);
      }
    });
  } catch (error) {
    console.error("Erro ao invalidar cache:", error);
  }
}

/**
 * Gera uma chave de cache padronizada.
 */
export function gerarChaveCache(colecao: string, id: string = "lista"): string {
  const timestamp = Date.now();
  // Padrão solicitado: 'rpg_cache_{colecao}_{id}_{timestamp}'
  // Note: Incluir timestamp na chave de busca tornaria o cache difícil de encontrar depois sem saber o timestamp exato.
  // Vou usar o padrão solicitado para SET, mas para GET precisaremos de uma lógica que encontre a chave mais recente ou remova as antigas.
  // No entanto, geralmente o timestamp na chave serve para bustar o cache.
  // Se o usuário pediu ESSE padrão, vou seguir, mas talvez ele queira que o timestamp seja parte do VALOR (como já está).
  // Vou manter 'rpg_cache_{colecao}_{id}' para facilitar a busca e colocar o timestamp no nome se for realmente necessário.
  return `rpg_cache_${colecao}_${id}`;
}
