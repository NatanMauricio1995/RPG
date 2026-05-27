"use client";

import { useState, useMemo, useEffect } from "react";
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

  // Inicializa checklist com todos selecionados corretamente via useEffect
  useEffect(() => {
    const initial: Record<string, boolean> = {};
    aliados.forEach(c => {
      if (c.origemId) initial[String(c.origemId)] = true;
    });
    setChecklist(initial);
  }, [aliados]);

  function handleFinalizar() {
    const idsParaAplicar = Object.entries(checklist)
      .filter(([, selected]) => selected)
      .map(([id]) => id);
    onAplicar(idsParaAplicar);
  }

  return (
    <Modal isOpen={true} onClose={onCancelar} title="Fim de Combate">
      <div className="modalCombateResult animate-in zoom-in-95 duration-200">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {resultado.itensConsumidos.map(item => (
                <div key={item.itemId} className="text-xs bg-black/10 p-2 rounded">
                  ID: {item.itemId} <span className="font-bold">(x{item.quantidade})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="statusPersonagensSection">
          <h3>Status dos Heróis</h3>
          <div className="checklistPersonagens">
            {aliados.map(c => {
              const snapshot = personagensSnapshot[String(c.origemId)];
              if (!snapshot) return null;

              return (
                <div key={c.id} className="p-3 border-b border-white/10 last:border-0">
                  <div className="checkItem">
                    {modoParcial && (
                      <input 
                        type="checkbox" 
                        id={`check-${c.id}`}
                        checked={checklist[String(c.origemId)] || false}
                        onChange={(e) => setChecklist(prev => ({ ...prev, [String(c.origemId)]: e.target.checked }))}
                        className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 mr-3"
                      />
                    )}
                    <div className="flex-1 text-left">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold">{c.nome}</span>
                        <div className="text-[10px] space-x-2">
                          <span className={c.vidaAtual < snapshot.vidaAtual ? "text-red-400" : "text-emerald-400"}>
                            ❤️ {snapshot.vidaAtual} → {c.vidaAtual}
                          </span>
                          <span className="text-blue-400">
                            💧 {snapshot.manaAtual} → {c.manaAtual}
                          </span>
                        </div>
                      </div>
                      
                      {/* Efeitos Ativos */}
                      {c.efeitos.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {c.efeitos.map((e, idx) => (
                            <span key={idx} className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                              {e.tipo} ({e.duracao}t)
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modalAcoes flex flex-col sm:flex-row gap-3">
          {!modoParcial ? (
            <>
              <Button variant="success" className="flex-1 h-12" onClick={handleFinalizar}>
                Aplicar Alterações
              </Button>
              <Button variant="secondary" className="flex-1 h-12" onClick={() => setModoParcial(true)}>
                Aplicar Parcialmente
              </Button>
            </>
          ) : (
            <Button variant="primary" className="flex-1 h-12" onClick={handleFinalizar}>
              Confirmar Seleção
            </Button>
          )}
          <Button variant="danger" className="w-full sm:w-auto h-12" onClick={onCancelar}>
            Cancelar Alterações
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
        h3 { margin-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.3rem; font-size: 0.9rem; font-weight: bold; text-transform: uppercase; color: rgba(255,255,255,0.6); }
        .recompensasGrid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .modalAcoes { margin-top: 1rem; }
        .checklistPersonagens { display: flex; flex-direction: column; }
        .checkItem { display: flex; align-items: center; }
      `}</style>
    </Modal>
  );
}
