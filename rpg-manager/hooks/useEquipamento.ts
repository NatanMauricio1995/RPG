import { useMemo } from "react";
import { resolverEquipados } from "../services/itemService";

export default function useEquipamento(personagem: any) {
  const equipamentosResolvidos = useMemo(() => {
    if (!personagem?.equipados) return {};
    return resolverEquipados(personagem.equipados);
  }, [personagem?.equipados]);

  const bonusCalculado = useMemo(() => {
    return personagem?.bonus || {};
  }, [personagem?.bonus]);

  function getBonus(atributo: string) {
    return bonusCalculado[atributo] || 0;
  }

  return {
    getBonus,
    bonusCalculado,
    equipamentosResolvidos,
  };
}
