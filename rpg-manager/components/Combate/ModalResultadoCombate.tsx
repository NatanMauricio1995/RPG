"use client";

import { useState, useMemo } from "react";
import type { EstadoCombate, Combatente } from "../../services/combateService";
import { calcularResultadoCombate } from "../../services/combateService";
import type { Personagem } from "../../types/domain";
import Modal from "../UI/Modal";
import Button from "../UI/Button";

type Props = {
  estado: EstadoCombate;
  personagensSnapshot: Record<string, Personagem>; // Snapshot original por ID
  onAplicar: (ids: string[]) => void; // IDs dos personagens a aplicar alterações
  onCancelar: () => void;
};

export default function ModalResultadoCombate({ estado, personagensSnapshot, onAplicar, onCancelar }: Props) {
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [modoParcial, setModoParcial] = useState(false);

  const resultado = useMemo(() => calcularResultadoCombate(estado), [estado]);
  const vitoria = estado.status === "vitoria";

  const aliados = useMemo(() => {
    return estado.combatentes.filter(c => c.lado === "aliado");
  }, [estado.combatentes]);

  // Inicializa checklist com todos selecionados
  useState(() => {
    const initial: Record<string, boolean> = {};
    aliados.forEach(c => {
      if (c.origemId) initial[String(c.origemId)] = true;
    });
    setChecklist(initial);
  });

  function handleFinalizar() {
    const idsParaAplicar = Object.entries(checklist)
      .filter(([, selected]) => selected)
      .map(([id]) => id);
    onAplicar(idsParaAplicar);
  }

  return (
    <Modal isOpen={true} onClose={onCancelar} title="Fim de Combate">
      <div className="modalCombateResult">
        <h2 className={vitoria ? "textVitoria" : "textDerrota"}>
          {vitoria ? "⚔️ VITÓRIA!" : "💀 DERROTA"}
        </h2>

        <div className="recompensasSection">
          <h3>Recompensas do Grupo</h3>
          <div className="recompensasGrid">
            <div className="recompensaItem">
              <span>✨ XP Total:</span>
              <strong>{resultado.xp}</strong>
            </div>
            <div className="recompensaItem">
              <span>💰 Ouro:</span>
              <strong>{resultado.ouro}</strong>
            </div>
          </div>
        </div>

        {resultado.itensConsumidos.length > 0 && (
          <div className="consumidosSection">
            <h3>Itens Consumidos</h3>
            <ul>
              {resultado.itensConsumidos.map(item => (
                <li key={item.itemId}>Item ID: {item.itemId} (x{item.quantidade})</li>
              ))}
            </ul>
          </div>
        )}

        <div className="statusPersonagensSection">
          <h3>Alterações nos Personagens</h3>
          {modoParcial ? (
            <div className="checklistPersonagens">
              {aliados.map(c => {
                const snapshot = personagensSnapshot[String(c.origemId)];
                if (!snapshot) return null;

                return (
                  <div key={c.id} className="checkItem">
                    <input 
                      type="checkbox" 
                      id={`check-${c.id}`}
                      checked={checklist[String(c.origemId)] || false}
                      onChange={(e) => setChecklist(prev => ({ ...prev, [String(c.origemId)]: e.target.checked }))}
                    />
                    <label htmlFor={`check-${c.id}`}>
                      {c.nome} (Vida: {snapshot.vidaAtual} → {c.vidaAtual}, Mana: {snapshot.manaAtual} → {c.manaAtual})
                    </label>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>As alterações de Vida, Mana, Ouro e XP serão aplicadas a todos os aliados vivos.</p>
          )}
        </div>

        <div className="modalAcoes">
          {!modoParcial ? (
            <>
              <Button variant="primary" onClick={handleFinalizar}>
                Aplicar Tudo
              </Button>
              <Button variant="secondary" onClick={() => setModoParcial(true)}>
                Aplicar Parcialmente
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={handleFinalizar}>
              Confirmar Seleção
            </Button>
          )}
          <Button variant="danger" onClick={onCancelar}>
            Descartar Tudo
          </Button>
        </div>
      </div>

      <style jsx>{`
        .modalCombateResult { display: flex; flex-direction: column; gap: 1.5rem; text-align: center; }
        .textVitoria { color: var(--cor-sucesso); font-size: 2rem; }
        .textDerrota { color: var(--cor-perigo); font-size: 2rem; }
        .recompensasSection, .consumidosSection, .statusPersonagensSection { 
          background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; text-align: left;
        }
        h3 { margin-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.3rem; }
        .recompensasGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .modalAcoes { display: flex; gap: 1rem; justify-content: center; margin-top: 1rem; }
        .checklistPersonagens { display: flex; flex-direction: column; gap: 0.5rem; }
        .checkItem { display: flex; align-items: center; gap: 0.5rem; }
      `}</style>
    </Modal>
  );
}
