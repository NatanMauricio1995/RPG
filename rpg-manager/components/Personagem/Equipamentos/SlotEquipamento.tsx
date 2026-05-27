"use client";

import Image from "next/image";
import type { Item, SlotEquipamento as SlotType } from "../../../types/domain";

type Props = {
  slot: SlotType;
  label: string;
  icone: string;
  item: Item | null;
  itensEquipaveis: any[];
  onEquipar: (itemId: string, slot: SlotType) => void;
  onDesequipar: (slot: SlotType) => void;
};

export default function SlotEquipamento({
  slot,
  label,
  icone,
  item,
  itensEquipaveis,
  onEquipar,
  onDesequipar,
}: Props) {
  return (
    <div className={`equipSlot ${item ? "equipSlotOcupado" : "equipSlotVazio"}`}>
      <span className="equipSlotLabel">
        {icone} {label}
      </span>

      {item ? (
        <div className="equipItemOcupado">
          <div className="equipItemImagemContainer">
            <Image
              src={item.imagem || "/imagens/itens/padrao.png"}
              alt={item.nome}
              width={40}
              height={40}
              className="equipItemImagem"
            />
          </div>
          <span className="equipItemNome">{item.nome}</span>
          <button
            className="btnRetirar"
            onClick={() => onDesequipar(slot)}
            title="Retirar"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="equipSlotSelectWrapper">
          <select
            className="equipSlotSelect"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) onEquipar(e.target.value, slot);
              e.target.value = "";
            }}
          >
            <option value="">— {label} —</option>
            {itensEquipaveis
              .filter(
                (inv) =>
                  inv.dados?.slot === slot ||
                  (slot === "anel2" && inv.dados?.slot === "anel1") ||
                  (slot === "armaSecundaria" && inv.dados?.slot === "arma")
              )
              .map((inv) => (
                <option key={inv.itemId} value={inv.itemId}>
                  {inv.dados?.nome ?? inv.itemId}
                </option>
              ))}
          </select>
        </div>
      )}
    </div>
  );
}
