"use client";

import Image from "next/image";
import useInventario from "../../../hooks/useInventario";
import usePersonagem from "../../../hooks/usePersonagem";

export default function CorpoEquipamento() {
  const params = useParams();
  const personagemId = Number(params.id);
  const { personagemAtual, setPersonagemAtual } = usePersonagem(personagemId);
  const { inventario, alternarEquipamento } = useInventario(personagemAtual, (p) => setPersonagemAtual(p));

  function permitirDrop(evento: any) {
    evento.preventDefault();
  }

  function soltarItem(evento: any, slot: string) {
    evento.preventDefault();
    const itemId = evento.dataTransfer.getData("id");
    
    const itemInfo = buscarItem(itemId);
    if (!itemInfo) return;

    // Se o slot for compatível, equipamos
    if (itemInfo.slot === slot) {
      alternarEquipamento(itemId);
    } else {
      alert(`Este item não pode ser equipado no slot: ${slot}`);
    }
  }

  const slots = [
    { nome: "capacete", rotulo: "Cabeça", classe: "slotCapacete" },
    { nome: "colar", rotulo: "Pescoço", classe: "slotColar" },
    { nome: "armadura", rotulo: "Tronco", classe: "slotArmadura" },
    { nome: "arma", rotulo: "Mão Principal", classe: "slotArma" },
    { nome: "armaSecundaria", rotulo: "Mão Secundária", classe: "slotArmaSecundaria" },
    { nome: "escudo", rotulo: "Escudo", classe: "slotEscudo" },
    { nome: "luvas", rotulo: "Mãos", classe: "slotLuvas" },
    { nome: "botas", rotulo: "Pés", classe: "slotBotas" },
    { nome: "anel1", rotulo: "Anel 1", classe: "slotAnel1" },
    { nome: "anel2", rotulo: "Anel 2", classe: "slotAnel2" },
    { nome: "acessorio", rotulo: "Acessório", classe: "slotAcessorio" },
    { nome: "bolsa", rotulo: "Bolsa", classe: "slotBolsa" },
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
              alternarEquipamento(equipados[slot.nome].id);
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