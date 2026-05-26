"use client";

/**
 * Utilitário centralizado para operações de localStorage
 * Padroniza leitura/escrita com tratamento de erros e tipagem
 */

const isBrowser = typeof window !== "undefined";

/**
 * Lê um valor do localStorage e o parseia como JSON
 */
export function getStorageItem<T = unknown>(
  key: string,
  defaultValue: T
): T {
  if (!isBrowser) return defaultValue;

  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch {
    console.warn(`[storage] Erro ao ler "${key}", usando valor padrão`);
    return defaultValue;
  }
}

/**
 * Salva um valor no localStorage como JSON
 */
export function setStorageItem<T>(
  key: string,
  value: T
): boolean {
  if (!isBrowser) return false;

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`[storage] Erro ao salvar "${key}":`, error);
    return false;
  }
}

/**
 * Remove um item do localStorage
 */
export function removeStorageItem(key: string): boolean {
  if (!isBrowser) return false;

  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Verifica se uma chave existe no localStorage
 */
export function hasStorageItem(key: string): boolean {
  if (!isBrowser) return false;
  return localStorage.getItem(key) !== null;
}

/**
 * Limpa todos os itens customizados (que começam com um prefixo)
 */
export function clearStorageByPrefix(prefix: string): number {
  if (!isBrowser) return 0;

  let count = 0;
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
    count++;
  });

  return count;
}

// ==================================
// KEYS PADRÃO DO PROJETO
// ==================================

export const STORAGE_KEYS = {
  PERSONAGENS: "personagensPersonalizados",
  MONSTROS: "monstrosPersonalizados",
  ITENS: "itensPersonalizados",
  NPCs: "npcsPersonalizados",
  MISSOES: "missoesPersonalizados",
  CALENDARIO: "calendarioData",
  COMBATE: "estadoCombateAtual",
  CLIMA: "climaData",
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
