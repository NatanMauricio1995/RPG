"use client";

export type TipoArea = "Cidade" | "Vila" | "Floresta" | "Caverna" | "Ruína" | "Templo" | "Reino" | "Outro";

export type Area = {
  id: number;
  nome: string;
  descricao: string;
  tipo: TipoArea;
  imagem?: string;
  mapa?: string;
  observacoes?: string;
};

const AREAS_STORAGE_KEY = "areas_rpg";

export function listarAreas(): Area[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(AREAS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function salvarArea(area: Area) {
  const areas = listarAreas();
  const existe = areas.some((a) => a.id === area.id);
  const atualizadas = existe
    ? areas.map((a) => (a.id === area.id ? area : a))
    : [...areas, area];
  
  localStorage.setItem(AREAS_STORAGE_KEY, JSON.stringify(atualizadas));
}

export function excluirArea(id: number) {
  const areas = listarAreas();
  const atualizadas = areas.filter((a) => a.id !== id);
  localStorage.setItem(AREAS_STORAGE_KEY, JSON.stringify(atualizadas));
}

export function buscarArea(id: number): Area | undefined {
  return listarAreas().find((a) => a.id === id);
}
