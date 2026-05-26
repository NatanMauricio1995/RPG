"use client";

import useInventario from "../../../hooks/useInventario";
import usePersonagem from "../../../hooks/usePersonagem";
import CorpoEquipamento from "./CorpoEquipamento";
import { useParams } from "next/navigation";

export default function SistemaEquipamento() {
  const params = useParams();
  const personagemId = Number(params.id);
  const { personagemAtual, setPersonagemAtual } = usePersonagem(personagemId);
  const { inventario } = useInventario(personagemAtual, (p) => setPersonagemAtual(p));

  return (
    <div className="sistemaEquipamentoContainer">
      <div className="sistemaEquipamentoHeader">
        <h2>⚔️ Equipamentos Equipados</h2>
      </div>

      <CorpoEquipamento />
    </div>
  );
}