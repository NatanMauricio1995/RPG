"use client";

import Image from "next/image";
import { useInventario } from "../../../contexts/InventarioContext";
import { buscarItem } from "../../../services/itemService";
import { useParams } from "next/navigation";

export default function CorpoEquipamento() {
  const { inventario, alternarEquipamento } = useInventario();
  const params = useParams();
  const personagemId = Number(params.id);

  function permitirDrop(evento: any) {
    evento.preventDefault();
  }

  function soltarItem(evento: any, slot: string) {
    evento.preventDefault();
    const itemId = Number(evento.dataTransfer.getData("id"));
    
    const itemInfo = buscarItem(itemId);
    if (!itemInfo) return;

    // Se o slot for compatível, equipamos
    if (itemInfo.slot === slot || (slot === "arma" && itemInfo.subtipo === "Arma")) {
      alternarEquipamento(personagemId, itemId);
    } else {
      alert(`Este item não pode ser equipado no slot: ${slot}`);
    }
  }

  const slots = [
    { nome: "cabeca", classe: "slotCabeca" },
    { nome: "arma", classe: "slotArma" },
    { nome: "escudo", classe: "slotEscudo" },
    { nome: "armadura", classe: "slotArmadura" },
    { nome: "cintura", classe: "slotCintura" },
    { nome: "acessorio", classe: "slotAcessorio" },
    { nome: "bolsa", classe: "slotBolsa" },
  ];

  // Resolver itens equipados do inventário
  const equipados: Record<string, any> = {};
  inventario.forEach((invItem) => {
    if (invItem.equipado) {
      const itemInfo = buscarItem(invItem.itemId);
      if (itemInfo && itemInfo.slot) {
        equipados[itemInfo.slot] = itemInfo;
      }
    }
  });

  return (
    <div className="containerCorpo">
      <Image
        src="/imagens/interface/corpo.png"
        alt="Corpo do personagem"
        width={850}
        height={850}
        className="imagemCorpo"
      />

      {slots.map((slot) => (
        <div
          key={slot.nome}
          className={`slotEquipamento ${slot.classe}`}
          onDragOver={permitirDrop}
          onDrop={(evento) => soltarItem(evento, slot.nome)}
          onClick={() => {
            if (equipados[slot.nome]) {
              alternarEquipamento(personagemId, equipados[slot.nome].id);
            }
          }}
        >
          {equipados[slot.nome] ? (
            <Image
              src={equipados[slot.nome]?.imagem || "/imagens/itens/padrao.png"}
              alt={equipados[slot.nome]?.nome || "Item equipado"}
              width={90}
              height={90}
              className="imagemSlot"
            />
          ) : (
            <div className="slotVazio">+</div>
          )}
        </div>
      ))}
    </div>
  );
}