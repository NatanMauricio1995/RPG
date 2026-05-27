"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { listarAreas, excluirArea, type Area } from "../../services/areaService";
import { listarNPCs, abrirLoja, buscarMissoesNPC, obterDialogo, type NPC } from "../../services/npcService";
import { listarMonstros } from "../../services/combateService";
import { listarMissoes } from "../../services/missaoService";
import type { Monstro, Missao, Item } from "../../types/domain";
import Modal from "../UI/Modal";
import Button from "../UI/Button";

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
  const [areas, setAreas] = useState<Area[]>([]);
  const [todosNPCs, setTodosNPCs] = useState<NPC[]>([]);
  const [todosMonstros, setTodosMonstros] = useState<Monstro[]>([]);
  const [todasMissoes, setTodasMissoes] = useState<Missao[]>([]);
  
  const [aberta, setAberta] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Estados para Modal de Interação
  const [npcSelecionado, setNpcSelecionado] = useState<NPC | null>(null);
  const [modoInteracao, setModoInteracao] = useState<"inicio" | "dialogo" | "loja" | "missoes">("inicio");
  const [itensLoja, setItensLoja] = useState<Item[]>([]);
  const [missoesNPC, setMissoesNPC] = useState<Missao[]>([]);
  const [dialogoNPC, setDialogoNPC] = useState<string>("");

  async function carregar() {
    setLoading(true);
    setErro(null);
    try {
      const [resAreas, resNPCs, listaMonstros, resMissoes] = await Promise.all([
        listarAreas(), 
        listarNPCs(),
        listarMonstros(),
        listarMissoes()
      ]);
      setAreas(resAreas.areas);
      setTodosNPCs(resNPCs.npcs);
      setTodosMonstros(listaMonstros as any);
      setTodasMissoes(resMissoes.missoes);
    } catch (e) {
      setErro("Falha ao carregar os dados da área.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  const handleFalarComNPC = (npc: NPC) => {
    setNpcSelecionado(npc);
    setModoInteracao("inicio");
  };

  const handleAbrirLoja = async (npcId: string) => {
    const itens = await abrirLoja(npcId);
    setItensLoja(itens);
    setModoInteracao("loja");
  };

  const handleVerMissoes = async (npcId: string) => {
    const missoes = await buscarMissoesNPC(npcId, 1);
    setMissoesNPC(missoes);
    setModoInteracao("missoes");
  };

  const handleConversar = (npc: NPC) => {
    const dialogo = obterDialogo(npc, { id: "1", nome: "Viajante" } as any);
    setDialogoNPC(dialogo);
    setModoInteracao("dialogo");
  };

  if (loading) return <p>Carregando áreas...</p>;
  if (erro) return <div className="erroMensagem">{erro}</div>;

  return (
    <div className="listaAreas">
      {areas.length === 0 && (
        <p className="semAreas">Nenhuma área cadastrada ainda.</p>
      )}

      {areas.map((area) => {
        const expandida = aberta === area.id;
        
        const npcsArea = todosNPCs.filter((n) => area.npcsIds?.includes(n.id));
        const monstrosArea = todosMonstros.filter((m) => area.monstrosIds?.includes(String(m.id)));
        const missoesArea = todasMissoes.filter((m) => area.missoesIds?.includes(m.id));

        return (
          <div key={area.id} className={`cardArea ${expandida ? "expandida" : ""}`}>
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
                  {ICONE_TIPO[area.tipo as string] ?? "📍"}
                </div>
              )}

              <div className="areaInfo">
                <h3>{area.nome}</h3>
                <span className="areaTipo">{ICONE_TIPO[area.tipo as string] ?? "📍"} {area.tipo}</span>
                <p className="areaDescricaoResumida">
                  {area.descricao?.slice(0, 100)}{area.descricao?.length > 100 ? "…" : ""}
                </p>
              </div>

              <span className="expandirIcone">{expandida ? "▲" : "▼"}</span>
            </div>

            {expandida && (
              <div className="areaDetalhes">
                {area.descricao && <p className="areaDescFull">{area.descricao}</p>}

                <div className="areaSecao">
                  <h4>👥 NPCs na Área</h4>
                  {npcsArea.length > 0 ? (
                    <div className="areaNPCsGrid">
                      {npcsArea.map((n) => (
                        <div key={n.id} className="areaNPCCard">
                          <Image
                            src={n.imagem || "/imagens/npcs/padrao.png"}
                            alt={n.nome}
                            width={36}
                            height={36}
                          />
                          <div className="npcInfo">
                            <span>{n.nome}</span>
                            <button 
                              className="btnFalar" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFalarComNPC(n);
                              }}
                            >
                              💬 Interagir
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="vazio">Nenhum NPC conhecido nesta região.</p>
                  )}
                </div>

                <div className="areaSecao">
                  <h4>🐉 Perigos & Exploração</h4>
                  <div className="areaMonstrosGrid">
                    {monstrosArea.length > 0 && (
                      <div className="monstrosLista">
                        {monstrosArea.map(m => (
                          <span key={m.id} className="badgeMonstro">{m.nome} (v{m.nivel})</span>
                        ))}
                      </div>
                    )}
                    <Link
                      href={`/combate?areaId=${area.id}`}
                      className="btnCombateArea"
                    >
                      ⚔️ Entrar em Combate
                    </Link>
                  </div>
                </div>

                <div className="areaSecao">
                  <h4>📜 Missões Locais</h4>
                  {missoesArea.length > 0 ? (
                    <div className="areaMissoesGrid">
                      {missoesArea.map((m) => (
                        <Link key={m.id} href={`/missoes`} className="areaMissaoBtn">
                          <span className={`statusDot ${m.status}`}></span>
                          {m.nome}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="vazio">Sem missões ativas nesta área.</p>
                  )}
                </div>

                <div className="areaAcoes">
                  <Link href={`/areas/editar/${area.id}`}>
                    <button className="btnEditar">✏️ Editar</button>
                  </Link>
                  <button
                    className="btnExcluir"
                    onClick={async (e) => {
                      e.stopPropagation();
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

      {npcSelecionado && (
        <Modal 
          isOpen={true} 
          onClose={() => setNpcSelecionado(null)} 
          title={`Interagir com ${npcSelecionado.nome}`}
        >
          <div className="npcInteracao">
            <div className="npcHeader">
              <Image 
                src={npcSelecionado.imagem || "/imagens/npcs/padrao.png"} 
                alt={npcSelecionado.nome} 
                width={80} 
                height={80}
              />
              <div>
                <h3>{npcSelecionado.nome}</h3>
                <p>{npcSelecionado.funcao} · {npcSelecionado.faccao}</p>
              </div>
            </div>
            
            <div className="npcConteudo">
              {modoInteracao === "inicio" && (
                <>
                  <p className="npcDesc">{npcSelecionado.descricao}</p>
                  <div className="npcOpcoes">
                    <Button variant="primary" onClick={() => handleConversar(npcSelecionado)}>
                      🗣️ Conversar
                    </Button>
                    {npcSelecionado.loja && (
                      <Button variant="success" onClick={() => handleAbrirLoja(npcSelecionado.id)}>
                        💰 Loja
                      </Button>
                    )}
                    {npcSelecionado.missoes && npcSelecionado.missoes.length > 0 && (
                      <Button variant="secondary" onClick={() => handleVerMissoes(npcSelecionado.id)}>
                        📜 Missões
                      </Button>
                    )}
                  </div>
                </>
              )}

              {modoInteracao === "dialogo" && (
                <div className="npcDialogoBox">
                  <p className="dialogoTexto">"{dialogoNPC}"</p>
                  <Button variant="ghost" onClick={() => setModoInteracao("inicio")}>
                    Voltar
                  </Button>
                </div>
              )}

              {modoInteracao === "loja" && (
                <div className="npcLoja">
                  <h4>Itens Disponíveis</h4>
                  <div className="listaItensLoja">
                    {itensLoja.map(item => (
                      <div key={item.id} className="itemLoja">
                        <span className="itemName">{item.nome}</span>
                        <span className="itemPreco">🪙 {item.preco}</span>
                      </div>
                    ))}
                    {itensLoja.length === 0 && <p>A loja está vazia.</p>}
                  </div>
                  <Button variant="ghost" onClick={() => setModoInteracao("inicio")}>
                    Voltar
                  </Button>
                </div>
              )}

              {modoInteracao === "missoes" && (
                <div className="npcMissoes">
                  <h4>Missões Oferecidas</h4>
                  <div className="listaMissoesNPC">
                    {missoesNPC.map(m => (
                      <div key={m.id} className="missaoNPC">
                        <h5>{m.nome}</h5>
                        <p>{m.descricao}</p>
                        <Button size="small">Aceitar Missão</Button>
                      </div>
                    ))}
                    {missoesNPC.length === 0 && <p>Nenhuma missão disponível no momento.</p>}
                  </div>
                  <Button variant="ghost" onClick={() => setModoInteracao("inicio")}>
                    Voltar
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <style jsx>{`
            .npcInteracao { display: flex; flex-direction: column; gap: 1rem; }
            .npcHeader { display: flex; gap: 1rem; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 1rem; }
            .npcOpcoes { display: grid; grid-template-columns: 1fr; gap: 0.5rem; margin-top: 1rem; }
            .npcDialogoBox { background: #f9f9f9; padding: 1rem; border-radius: 8px; font-style: italic; }
            .listaItensLoja, .listaMissoesNPC { display: flex; flex-direction: column; gap: 0.5rem; margin: 1rem 0; max-height: 300px; overflow-y: auto; }
            .itemLoja { display: flex; justify-content: space-between; padding: 0.5rem; border-bottom: 1px solid #eee; }
            .missaoNPC { padding: 0.8rem; border: 1px solid #ddd; border-radius: 6px; }
            @media (min-width: 640px) { .npcOpcoes { grid-template-columns: 1fr 1fr; } }
          `}</style>
        </Modal>
      )}
    </div>
  );
}
