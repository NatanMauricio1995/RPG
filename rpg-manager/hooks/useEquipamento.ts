import { useMemo } from "react";
import { resolverEquipados } from "../services/itemService";
import { calcularBonusEquipados } from "../services/efeitosService";

export default function useEquipamento(personagem: any) {
  const equipamentosResolvidos = useMemo(() => {
    if (!personagem?.equipados) return {};
    return resolverEquipados(personagem.equipados);
  }, [personagem?.equipados]);

  const bonusCalculado = useMemo(() => {
    // Mesclando: usa calcularBonusEquipados do .tsx
    return calcularBonusEquipados(equipamentosResolvidos || {});
  }, [equipamentosResolvidos]);

  function getBonus(atributo: string) {
    return bonusCalculado[atributo] || 0;
  }

  return {
    getBonus,
    bonus: getBonus, // Compatibilidade com versão .tsx
    bonusCalculado,
    equipamentosResolvidos,
  };
}
