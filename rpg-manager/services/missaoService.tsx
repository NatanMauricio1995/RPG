"use client";

export type StatusMissao = "Não iniciada" | "Em andamento" | "Concluída" | "Falhou";

export type Missao = {
  id: number;
  nome: string;
  descricao: string;
  objetivo: string;
  recompensa: string;
  status: StatusMissao;
};

const MISSOES_STORAGE_KEY = "missoes_rpg";

export function listarMissoes(): Missao[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(MISSOES_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function salvarMissao(missao: Missao) {
  const missoes = listarMissoes();
  const existe = missoes.some((m) => m.id === missao.id);
  const atualizadas = existe
    ? missoes.map((m) => (m.id === missao.id ? missao : m))
    : [...missoes, missao];
  
  localStorage.setItem(MISSOES_STORAGE_KEY, JSON.stringify(atualizadas));
}

export function excluirMissao(id: number) {
  const missoes = listarMissoes();
  const atualizadas = missoes.filter((m) => m.id !== id);
  localStorage.setItem(MISSOES_STORAGE_KEY, JSON.stringify(atualizadas));
}

export function buscarMissao(id: number): Missao | undefined {
  return listarMissoes().find((m) => m.id === id);
}
