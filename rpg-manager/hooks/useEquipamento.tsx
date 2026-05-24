import { calcularBonusEquipados } from "../services/efeitosService";

export default function useEquipamento(equipados: Record<string, any>) {
  // equipados já chegam resolvidos (objetos Item) pelo InventarioContext
  const bonusCalculado = calcularBonusEquipados(equipados || {});

  function bonus(atributo: string) {
    return bonusCalculado[atributo] || 0;
  }

  return { bonus, bonusCalculado };
}
