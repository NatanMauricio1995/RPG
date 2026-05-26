"use client";

import { useInventario } from "../../../contexts/InventarioContext";
import CorpoEquipamento from "./CorpoEquipamento";
import { useParams } from "next/navigation";

export default function SistemaEquipamento() {
  const { inventario, setInventario, salvarMudancas } = useInventario();
  const params = useParams();
  const personagemId = Number(params.id);

  function desequiparTudo() {
    setInventario(
      inventario.map((i) => ({ ...i, equipado: false }))
    );
  }

  return (
    <div className="sistemaEquipamentoContainer">
      <div className="sistemaEquipamentoHeader">
        <h2>⚔️ Equipamentos Equipados</h2>
        <div className="acoesEquipamento">
          <button className="btnSecundario" onClick={desequiparTudo}>
            🔓 Desequipar Tudo
          </button>
          <button className="btnPrimario" onClick={() => salvarMudancas(personagemId, inventario)}>
            💾 Salvar Equipamentos
          </button>
        </div>
      </div>

      <CorpoEquipamento />
    </div>
  );
}