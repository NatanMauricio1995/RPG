"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listarMissoes, excluirMissao, type Missao } from "../../services/missaoService";

const COR_STATUS: Record<string, string> = {
  "Não iniciada": "#aaa",
  "Em andamento": "#ff9800",
  "Concluída":    "#4caf50",
  "Falhou":       "#f44336",
};

export default function ListaMissoes() {
  const [missoes, setMissoes] = useState<Missao[]>([]);
  const [filtro,  setFiltro]  = useState<string>("Todas");
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    const lista = await listarMissoes();
    setMissoes(lista);
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, []);

  const STATUS_OPCOES = ["Todas", "Não iniciada", "Em andamento", "Concluída", "Falhou"];

  const filtradas = filtro === "Todas"
    ? missoes
    : missoes.filter((m) => m.status === filtro);

  if (carregando) return <p>Carregando missões...</p>;

  return (
    <div className="missoesPagina">
      <div className="filtroStatus">
        {STATUS_OPCOES.map((s) => (
          <button
            key={s}
            className={`btnFiltro ${filtro === s ? "ativo" : ""}`}
            onClick={() => setFiltro(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {filtradas.length === 0 && (
        <p className="semMissoes">Nenhuma missão encontrada.</p>
      )}

      <div className="listaCartoes">
        {filtradas.map((m) => {
          const objetivos: any[] = (m as any).objetivos ?? [];
          const recompensas: any = (m as any).recompensas ?? {};

          return (
            <div key={m.id} className="cartaoMissao">
              <div className="cartaoMissaoCabecalho">
                <h3 className="missaoTitulo">{m.nome}</h3>
                <span
                  className="badgeStatus"
                  style={{ background: COR_STATUS[m.status] ?? "#aaa" }}
                >
                  {m.status}
                </span>
              </div>

              <p className="missaoDescricao">{m.descricao}</p>

              {(m as any).nivelRecomendado && (
                <p className="missaoNivel">⚔️ Nível recomendado: {(m as any).nivelRecomendado}</p>
              )}

              {objetivos.length > 0 && (
                <div className="objetivos">
                  <strong>Objetivos:</strong>
                  {objetivos.map((obj: any, i: number) => {
                    const progresso = obj.quantidadeAtual ?? 0;
                    const total = obj.quantidadeTotal ?? 1;
                    const pct = Math.min(100, (progresso / total) * 100);
                    return (
                      <div key={i} className={`objetivo ${obj.concluido ? "concluido" : ""}`}>
                        <span>{obj.descricao}</span>
                        {total > 1 && (
                          <div className="progressoObjetivo">
                            <div style={{ width: `${pct}%` }} />
                            <span>{progresso}/{total}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="recompensasMissao">
                {recompensas.xp   && <span>⭐ {recompensas.xp} XP</span>}
                {recompensas.ouro && <span>💰 {recompensas.ouro} Ouro</span>}
              </div>

              <div className="missaoAcoes">
                <button
                  className="btnExcluir"
                  onClick={async () => { await excluirMissao(m.id); carregar(); }}
                >
                  🗑 Excluir
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}