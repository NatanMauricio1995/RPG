"use client";

import { useState } from "react";
import type { EstadoCombate, Combatente } from "../../services/combateService";
import { buscarPersonagem, salvarPersonagem } from "../../services/personagemService";
import Image from "next/image";

type Props = {
  estado: EstadoCombate;
  onClose: () => void;
};

export default function ModalResultadoCombate({ estado, onClose }: Props) {
  const [salvando, setSalvando] = useState(false);
  const [opcoes, setOpcoes] = useState<Record<string, Record<string, boolean>>>({});

  const aliados = estado.combatentes.filter((c) => c.lado === "aliado");

  // Inicializar opções
  useState(() => {
    const initial: any = {};
    aliados.forEach((c) => {
      initial[c.id] = {
        vida: true,
        mana: true,
        xp: true,
        ouro: true,
      };
    });
    setOpcoes(initial);
  });

  const handleToggle = (combatenteId: string, campo: string) => {
    setOpcoes((prev) => ({
      ...prev,
      [combatenteId]: {
        ...prev[combatenteId],
        [campo]: !prev[combatenteId][campo],
      },
    }));
  };

  const aplicarAlteracoes = async (apenasSelecionados = true) => {
    setSalvando(true);
    try {
      for (const combatente of aliados) {
        const pOriginal = buscarPersonagem(combatente.origemId);
        if (!pOriginal) continue;

        const opt = opcoes[combatente.id];
        const pAtualizado = { ...pOriginal };

        if (!apenasSelecionados || opt.vida) pAtualizado.vidaAtual = combatente.vidaAtual;
        if (!apenasSelecionados || opt.mana) pAtualizado.manaAtual = combatente.manaAtual;
        
        // XP e Ouro poderiam vir de uma lógica de recompensa, aqui simulamos
        if (!apenasSelecionados || opt.xp) {
          // Exemplo: 100 XP por vitória
          if (estado.status === "vitoria") pAtualizado.xpAtual += 100;
        }

        await salvarPersonagem(pAtualizado);
      }
      onClose();
    } catch (error) {
      console.error("Erro ao aplicar alterações:", error);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="modalSobreposicao">
      <div className="modalConteudo resultadoCombate">
        <h2>{estado.status === "vitoria" ? "🏆 Vitória!" : "💀 Derrota..."}</h2>
        <p>O combate terminou. Deseja aplicar as alterações nos personagens?</p>

        <div className="listaDifs">
          {aliados.map((c) => (
            <div key={c.id} className="itemDif">
              <div className="infoCombatente">
                <Image src={c.imagem} alt={c.nome} width={40} height={40} />
                <span>{c.nome}</span>
              </div>
              
              <div className="gridChecks">
                <label>
                  <input type="checkbox" checked={opcoes[c.id]?.vida} onChange={() => handleToggle(c.id, "vida")} />
                  HP: {c.vidaAtual}/{c.vidaMaxima}
                </label>
                <label>
                  <input type="checkbox" checked={opcoes[c.id]?.mana} onChange={() => handleToggle(c.id, "mana")} />
                  MP: {c.manaAtual}/{c.manaMaxima}
                </label>
                <label>
                  <input type="checkbox" checked={opcoes[c.id]?.xp} onChange={() => handleToggle(c.id, "xp")} />
                  Ganhar XP
                </label>
                <label>
                  <input type="checkbox" checked={opcoes[c.id]?.ouro} onChange={() => handleToggle(c.id, "ouro")} />
                  Ganhar Ouro
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="modalAcoes">
          <button className="btnCancelar" onClick={onClose} disabled={salvando}>
            Cancelar
          </button>
          <button className="btnParcial" onClick={() => aplicarAlteracoes(true)} disabled={salvando}>
            Aplicar Selecionados
          </button>
          <button className="btnConfirmar" onClick={() => aplicarAlteracoes(false)} disabled={salvando}>
            Aplicar Tudo
          </button>
        </div>
      </div>
    </div>
  );
}
