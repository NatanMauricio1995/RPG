"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { listarAreas, excluirArea, type Area } from "../../services/areaService";
import { listarNPCs, type NPC } from "../../services/npcService";

const ICONE_TIPO: Record<string, string> = {
  Cidade:   "🏙️",
  Vila:     "🏘️",
  Floresta: "🌲",
  Caverna:  "🗻",
  Ruína:    "🏚️",
  Templo:   "⛩️",
  Reino:    "👑",
  Outro:    "📍",
};

export default function ListaAreas() {
  const [areas,     setAreas]     = useState<Area[]>([]);
  const [todosNPCs, setTodosNPCs] = useState<NPC[]>([]);
  const [aberta,    setAberta]    = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    const [listaAreas, listaNPCs] = await Promise.all([listarAreas(), listarNPCs()]);
    setAreas(listaAreas);
    setTodosNPCs(listaNPCs);
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, []);

  if (carregando) return <p>Carregando áreas...</p>;

  return (
    <div className="listaAreas">
      {areas.length === 0 && (
        <p className="semAreas">Nenhuma área cadastrada ainda.</p>
      )}

      {areas.map((area) => {
        const expandida = aberta === area.id;
        const npcIds: string[] = (area as any).npcs ?? [];
        const npcsArea = todosNPCs.filter((n) => npcIds.includes(n.id));
        const monstrosIds: string[] = (area as any).monstros ?? [];
        const missoesIds: string[] = (area as any).missoes ?? [];

        return (
          <div key={area.id} className={`cardArea ${expandida ? "expandida" : ""}`}>
            {/* Cabeçalho clicável */}
            <div
              className="cardAreaCabecalho"
              onClick={() => setAberta(expandida ? null : area.id)}
            >
              {area.imagem ? (
                <Image
                  src={area.imagem}
                  alt={area.nome}
                  width={64}
                  height={64}
                  className="areaImagem"
                />
              ) : (
                <div className="areaIconePlaceholder">
                  {ICONE_TIPO[area.tipo] ?? "📍"}
                </div>
              )}

              <div className="areaInfo">
                <h3>{area.nome}</h3>
                <span className="areaTipo">{ICONE_TIPO[area.tipo] ?? "📍"} {area.tipo}</span>
                <p className="areaDescricaoResumida">
                  {area.descricao?.slice(0, 100)}{area.descricao?.length > 100 ? "…" : ""}
                </p>
              </div>

              <span className="expandirIcone">{expandida ? "▲" : "▼"}</span>
            </div>

            {/* Detalhes expandidos */}
            {expandida && (
              <div className="areaDetalhes">
                {area.observacoes && (
                  <p className="areaObs">📝 {area.observacoes}</p>
                )}

                {/* NPCs */}
                {npcsArea.length > 0 && (
                  <div className="areaSecao">
                    <h4>👥 NPCs</h4>
                    <div className="areaNPCsGrid">
                      {npcsArea.map((n) => (
                        <Link key={n.id} href={`/npcs/${n.id}`} className="areaNPCCard">
                          <Image
                            src={n.imagem || "/imagens/npcs/padrao.png"}
                            alt={n.nome}
                            width={36}
                            height={36}
                          />
                          <span>{n.nome}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Monstros */}
                {monstrosIds.length > 0 && (
                  <div className="areaSecao">
                    <h4>🐉 Monstros</h4>
                    <div className="areaMonstrosGrid">
                      {monstrosIds.map((id) => (
                        <Link
                          key={id}
                          href={`/combate?monstroId=${id}`}
                          className="areaMonstroBtn"
                        >
                          ⚔️ Combater #{id}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missões */}
                {missoesIds.length > 0 && (
                  <div className="areaSecao">
                    <h4>📜 Missões</h4>
                    <div className="areaMissoesGrid">
                      {missoesIds.map((id) => (
                        <Link key={id} href={`/missoes`} className="areaMissaoBtn">
                          📋 Missão #{id}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ações */}
                <div className="areaAcoes">
                  <Link href={`/areas/editar/${area.id}`}>
                    <button className="btnEditar">✏️ Editar</button>
                  </Link>
                  <button
                    className="btnExcluir"
                    onClick={async () => {
                      if (confirm(`Excluir "${area.nome}"?`)) {
                        await excluirArea(area.id);
                        carregar();
                      }
                    }}
                  >
                    🗑 Excluir
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}