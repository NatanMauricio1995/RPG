"use client";

import { createContext, useContext, useState } from "react";
import { atualizarPersonagem } from "../services/personagemService";

const InventarioContext = createContext<any>(null);

const SLOTS_PADRAO = {
  armaPrincipal: null, armaSecundaria: null,
  capacete: null, peitoral: null,
  luvas: null, botas: null,
  acessorio1: null, acessorio2: null,
  itemEspecial: null,
};

export function InventarioProvider({ children }: { children: React.ReactNode }) {
  const [inventario, setInventario] = useState<any[]>([]);
  const [equipados,  setEquipados]  = useState<Record<string, any>>(SLOTS_PADRAO);

  function carregarInventario(novoInventario: any[], novosEquipados: any) {
    setInventario(novoInventario);
    setEquipados({ ...SLOTS_PADRAO, ...novosEquipados });
  }

  async function salvarMudancas(
    personagemId: string,
    currentInventario: any[],
    currentEquipados: Record<string, any>
  ) {
    const equipadosIds: any = {};
    Object.entries(currentEquipados).forEach(([slot, item]) => {
      equipadosIds[slot] = item ? item.id : null;
    });

    await atualizarPersonagem(personagemId, {
      inventario: currentInventario.map((item) => item.id),
      equipados:  equipadosIds,
    });
  }

  return (
    <InventarioContext.Provider
      value={{ inventario, setInventario, equipados, setEquipados, carregarInventario, salvarMudancas }}
    >
      {children}
    </InventarioContext.Provider>
  );
}

export function useInventario() {
  return useContext(InventarioContext);
}
