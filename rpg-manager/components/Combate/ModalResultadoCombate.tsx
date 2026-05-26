"use client";

import { useState, useEffect } from "react";
import type { EstadoCombate } from "../../services/combateService";
import { buscarPersonagem, salvarPersonagem } from "../../services/personagemService";
import { salvarHistoricoCombate } from "../../services/combateHistoryService";
import Image from "next/image";
import "../../styles/combate.css";

type Props = {
  estado: EstadoCombate;
  onClose: () => void;
};

export default function ModalResultadoCombate({ estado, onClose }: Props) {
  const [salvando, setSalvando] = useState(false);
  const [opcoes, setOpcoes] = useState<Record<string, Record<string, boolean>>>({});
  const [recompensas, setRecompensas] = useState({ xp: 0, ouro: 0, itens: [] as string[] });

  const aliados = estado.combatentes.filter((c) => c.lado === "aliado");
  const inimigosDerrotados = estado.combatentes.filter((c) => c.lado === "inimigo" && !c.vivo);

  useEffect(() => {
    // Inicializar opções
    const initial: any = {};
    aliados.forEach((c) => {
      initial[c.id] = {
        vida: true,
        mana: true,
        xp: true,
        ouro: true,
        efeitos: true,
      };
    });
    setOpcoes(initial);

    // Calcular recompensas baseadas nos monstros derrotados
    // Simplificado: cada monstro dá XP e Ouro proporcional ao nível
    let totalXP = 0;
    let totalOuro = 0;
    inimigosDerrotados.forEach(i => {
      totalXP += (i.nivel * 50);
      totalOuro += (i.nivel * 10);
    });

    setRecompensas({ xp: totalXP, ouro: totalOuro, itens: [] });
  }, []);

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
        const pOriginal = await buscarPersonagem(combatente.origemId);
        if (!pOriginal) continue;

        const opt = apenasSelecionados ? opcoes[combatente.id] : { vida: true, mana: true, xp: true, ouro: true, efeitos: true };
        const pAtualizado = { ...pOriginal };

        if (opt.vida) pAtualizado.vidaAtual = combatente.vidaAtual;
        if (opt.mana) pAtualizado.manaAtual = combatente.manaAtual;
        if (opt.xp && estado.status === "vitoria") pAtualizado.xpAtual += recompensas.xp;
        if (opt.ouro && estado.status === "vitoria") pAtualizado.ouro += recompensas.ouro;
        
        // Efeitos permanentes ou temporários poderiam ser salvos aqui
        if (opt.efeitos) {
           pAtualizado.efeitosAtivos = combatente.efeitos;
        }

        await salvarPersonagem(pAtualizado);
      }

      // Salvar no histórico
      await salvarHistoricoCombate({
        participantes: estado.combatentes.map(c => ({ nome: c.nome, lado: c.lado })),
        vencedor: estado.status === "vitoria" ? "Aliados" : "Inimigos",
        derrotados: estado.combatentes.filter(c => !c.vivo).map(c => c.nome),
        log: estado.log,
        recompensas: estado.status === "vitoria" ? {
           xp: recompensas.xp,
           ouro: recompensas.ouro,
           itens: recompensas.itens
        } : undefined
      });

      onClose();
    } catch (error) {
      console.error("Erro ao aplicar alterações:", error);
      alert("Erro ao salvar alterações.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="modalSobreposicao" style={{ zIndex: 1000 }}>
      <div className="modalConteudo resultadoCombate">
        <h2 className={estado.status === "vitoria" ? "tituloVitoria" : "tituloDerrota"}>
          {estado.status === "vitoria" ? "✦ Vitória Gloriosa ✦" : "✦ Derrota Amarga ✦"}
        </h2>
        
        <div className="recompensasGerais">
          {estado.status === "vitoria" && (
            <p>Recompensas do Grupo: <span className="ouro">{recompensas.ouro} Ouro</span> | <span className="xp">{recompensas.xp} XP</span></p>
          )}
        </div>

        <div className="listaDifs">
          {aliados.map((c) => (
            <div key={c.id} className="itemDif">
              <div className="infoCombatente">
                <Image src={c.imagem} alt={c.nome} width={50} height={50} className="avatarMini" />
                <div className="nomeCombatente">
                  <strong>{c.nome}</strong>
                  <span>Nível {c.nivel}</span>
                </div>
              </div>
              
              <div className="gridChecks">
                <div className="checkGroup">
                  <input type="checkbox" id={`hp-${c.id}`} checked={opcoes[c.id]?.vida} onChange={() => handleToggle(c.id, "vida")} />
                  <label htmlFor={`hp-${c.id}`}>HP: {c.vidaAtual}/{c.vidaMaxima}</label>
                </div>
                <div className="checkGroup">
                  <input type="checkbox" id={`mp-${c.id}`} checked={opcoes[c.id]?.mana} onChange={() => handleToggle(c.id, "mana")} />
                  <label htmlFor={`mp-${c.id}`}>MP: {c.manaAtual}/{c.manaMaxima}</label>
                </div>
                <div className="checkGroup">
                  <input type="checkbox" id={`xp-${c.id}`} checked={opcoes[c.id]?.xp} onChange={() => handleToggle(c.id, "xp")} />
                  <label htmlFor={`xp-${c.id}`}>+ {recompensas.xp} XP</label>
                </div>
                <div className="checkGroup">
                  <input type="checkbox" id={`ouro-${c.id}`} checked={opcoes[c.id]?.ouro} onChange={() => handleToggle(c.id, "ouro")} />
                  <label htmlFor={`ouro-${c.id}`}>+ {recompensas.ouro} Ouro</label>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="modalAcoes">
          <button className="botaoVoltar" onClick={onClose} disabled={salvando}>
            Descartar Tudo
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="botaoAcao" onClick={() => aplicarAlteracoes(true)} disabled={salvando} style={{ background: 'var(--pedra-media)', color: 'var(--ouro)' }}>
              Aplicar Selecionados
            </button>
            <button className="botaoAcao" onClick={() => aplicarAlteracoes(false)} disabled={salvando}>
              {salvando ? "Salvando..." : "Aplicar Tudo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
