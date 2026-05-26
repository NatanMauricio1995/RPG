"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { InventarioItem, Equipados } from "../types/domain";

type InventarioContextType = {
  inventario: InventarioItem[];
  setInventario: (inv: InventarioItem[]) => void;
  equipados: Equipados;
  setEquipados: (eq: Equipados) => void;
  carregarInventario: (inv: InventarioItem[], eq: Equipados) => void;
};

const InventarioContext = createContext<InventarioContextType | null>(null);

export const EQUIPADOS_PADRAO: Equipados = {
  arma: null,
  armaSecundaria: null,
  escudo: null,
  armadura: null,
  capacete: null,
  luvas: null,
  botas: null,
  anel1: null,
  anel2: null,
  colar: null,
  acessorio: null,
  bolsa: null,
};

export function InventarioProvider({ children }: { children: ReactNode }) {
  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [equipados, setEquipados] = useState<Equipados>(EQUIPADOS_PADRAO);

  function carregarInventario(novoInventario: InventarioItem[], novosEquipados: Equipados) {
    setInventario(novoInventario || []);
    setEquipados(novosEquipados || EQUIPADOS_PADRAO);
  }

  return (
    <InventarioContext.Provider
      value={{
        inventario,
        setInventario,
        equipados,
        setEquipados,
        carregarInventario,
      }}
    >
      {children}
    </InventarioContext.Provider>
  );
}

export function useInventarioContext() {
  const context = useContext(InventarioContext);
  if (!context) {
    throw new Error("useInventarioContext deve ser usado dentro de um InventarioProvider");
  }
  return context;
}
