"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { buscarItem } from "../../services/itemService";
import { buscarMissao } from "../../services/missaoService";
import type { NPC } from "../../services/npcService";
import type { Item } from "../../types/domain";

const COR_FACCAO: Record<string, string> = {
  Aliado:   "#4caf50",
  Neutro:   "#aaa",
  Inimigo:  "#f44336",
  Mercador: "#ff9800",
};

type Props = { npc: NPC };

export default function FichaNPC({ npc }: Props) {
  const [itensLoja,  setItensLoja]  = useState<Item[]>([]);
  const [missoes,    setMissoes]    = useState<any[]>([]);
  const [dialogoAberto, setDialogoAberto] = useState<string | null>(null);

  useEffect(() => {
    // Resolver itens da loja
    const lojaIds: string[] = (npc as any).loja ?? [];
    Promise.all(lojaIds.map((id) => buscarItem(id))).then((res) =>
      setItensLoja(res.filter(Boolean) as Item[])
    );

    // Resolver missões
    const missaoIds: string[] = (npc as any).missoes ?? [];
    Promise.all(missaoIds.map((id) => buscarMissao(id))).then((res) =>
      setMissoes(res.filter(Boolean))
    );
  }, [npc]);

  const faccao = (npc as any).faccao ?? "Neutro";
  const dialogos = (npc as any).dialogos ?? [];

  return (
    <div className="fichaNPC container">
      <Link href="/npcs"><button className="btnVoltar">⬅️ Voltar</button></Link>

      <div className="npcHeader">
        <Image
          src={npc.imagem || "/imagens/npcs/padrao.png"}
          alt={npc.nome}
          width={110}
          height={110}
          className="npcAvatar"
        />
        <div className="npcInfo">
          <h1>{npc.nome}</h1>
          <span className="npcProfissao">{npc.profissao}</span>
          <span
            className="badgeFaccao"
            style={{ background: COR_FACCAO[faccao] ?? "#aaa" }}
          >
            {faccao}
          </span>
          <p className="npcDescricao">{npc.personalidade}</p>
        </div>
      </div>

      { dialogos.length > 0 && (
        <section className="npcSecao">
          <h2>💬 Diálogos</h2>
          {dialogos.map((dialogo: any, i: number) => {
            const id = dialogo.id ?? String(i);
            const aberto = dialogoAberto === id;
            return (
              <div key={id} className="dialogoItem">
                <button
                  className="dialogoBtnToggle"
                  onClick={() => setDialogoAberto(aberto ? null : id)}
                >
                  {aberto ? "▼" : "▶"} {dialogo.texto?.slice(0, 60) ?? `Diálogo ${i + 1}`}…
                </button>
                {aberto && (
                  <div className="dialogoConteudo">
                    <p>{dialogo.texto}</p>
                    {(dialogo.opcoes ?? []).map((op: any, j: number) => (
                      <div key={j} className="dialogoOpcao">↳ {op.texto}</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      { itensLoja.length > 0 && (
        <section className="npcSecao">
          <h2>🛒 Loja</h2>
          <div className="lojaGrid">
            {itensLoja.map((item) => (
              <div key={item.id} className="lojaItem">
                <Image
                  src={item.imagem || "/imagens/itens/padrao.png"}
                  alt={item.nome}
                  width={44}
                  height={44}
                />
                <span>{item.nome}</span>
                <span className="lojaPreco">💰 {item.preco ?? "—"}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      { missoes.length > 0 && (
        <section className="npcSecao">
          <h2>📜 Missões</h2>
          <div className="missoesList">
            {missoes.map((m) => (
              <div key={m.id} className="missaoItem">
                <span className="missaoNome">{m.nome ?? m.titulo}</span>
                <span className={`badgeStatus status-${(m.status ?? "").toLowerCase().replace(" ", "-")}`}>
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
*/