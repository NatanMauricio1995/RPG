"use client";

import Image from "next/image";
import { useState } from "react";
import useInventario from "../../../hooks/useInventario";
import { salvarPersonagem } from "../../../services/personagemService";
import type { Personagem, Item } from "../../../types/domain";

// ─── Cores por raridade ───────────────────────────────────────────────────────
const COR_RARIDADE: Record<string, string> = {
  Comum:    "#aaa",
  Incomum:  "#4caf50",
  Raro:     "#2196f3",
  Épico:    "#9c27b0",
  Lendário: "#ff9800",
  Único:    "#f44336",
};

const PESO_MAXIMO_PADRAO = 50;

type Props = {
  personagem: Personagem;
  onUpdate: (p: Personagem) => void;
};

export default function Inventario({ personagem, onUpdate }: Props) {
  const [aba, setAba] = useState<"inventario" | "catalogo">("inventario");
  const [filtroCatalogo, setFiltroCatalogo] = useState("");

  const {
    itensCatalogo,
    inventario,
    adicionarAoInventario,
    removerDoInventario,
    alterarQuantidade,
    alternarEquipamento,
  } = useInventario(personagem, onUpdate);

  // ─── Peso total ──────────────────────────────────────────────────────────────
  const pesoAtual = inventario.reduce((soma, inv) => {
    const peso = inv.dados?.peso ?? 0;
    return soma + peso * inv.quantidade;
  }, 0);
  const pesoMaximo = (personagem as any).pesoMaximo ?? PESO_MAXIMO_PADRAO;
  const pesoCheio = pesoAtual >= pesoMaximo;

  // ─── Consumir item ────────────────────────────────────────────────────────────
  async function consumirItem(itemId: string, item: Item | null) {
    if (!item) return;
    // Aplica cura se for consumível com cura
    if (item.tipo === "Consumível" && item.cura) {
      const vidaMaxima = (personagem as any).vidaMaxima ?? 10;
      const novaVida = Math.min(personagem.vidaAtual + (item.cura ?? 0), vidaMaxima);
      const pAtualizado = { ...personagem, vidaAtual: novaVida };
      await salvarPersonagem(pAtualizado);
      onUpdate(pAtualizado);
    }
    // Reduz quantidade (remove se chegar a 0)
    await alterarQuantidade(itemId, -1);
  }

  // ─── Catálogo filtrado ────────────────────────────────────────────────────────
  const catalogoFiltrado = itensCatalogo.filter((item) =>
    item.nome.toLowerCase().includes(filtroCatalogo.toLowerCase())
  );

  return (
    <div className="inventarioContainer">
      {/* Cabeçalho com peso */}
      <div className="inventarioCabecalho">
        <div className="pesoContainer">
          <span className={`pesoBarra ${pesoCheio ? "pesoAlto" : ""}`}>
            ⚖️ {pesoAtual.toFixed(1)} / {pesoMaximo} kg
          </span>
          <div className="pesoProgressoFundo">
            <div
              className="pesoProgressoBarra"
              style={{
                width: `${Math.min(100, (pesoAtual / pesoMaximo) * 100)}%`,
                backgroundColor: pesoCheio ? "#f44336" : "var(--ouro)",
              }}
            />
          </div>
        </div>

        {/* Abas */}
        <div className="inventarioAbas">
          <button
            className={aba === "inventario" ? "abaAtiva" : "abaInativa"}
            onClick={() => setAba("inventario")}
          >
            🎒 Mochila ({inventario.length})
          </button>
          <button
            className={aba === "catalogo" ? "abaAtiva" : "abaInativa"}
            onClick={() => setAba("catalogo")}
          >
            🗃️ Catálogo ({itensCatalogo.length})
          </button>
        </div>
      </div>

      {/* ─── ABA: INVENTÁRIO DO PERSONAGEM ─────────────────────────────────── */}
      {aba === "inventario" && (
        <div className="listaInventario">
          {inventario.length === 0 && (
            <p className="inventarioVazio">Mochila vazia. Adicione itens pelo catálogo.</p>
          )}

          {inventario.map(({ itemId, quantidade, equipado, dados }) => (
            <div key={itemId} className={`itemInventario ${equipado ? "itemEquipado" : ""}`}>
              {/* Imagem */}
              <Image
                src={dados?.imagem || "/imagens/itens/padrao.png"}
                alt={dados?.nome ?? itemId}
                width={52}
                height={52}
                className="itemImagem"
              />

              {/* Info */}
              <div className="itemInfo">
                <span className="itemNome">{dados?.nome ?? itemId}</span>
                <span
                  className="itemRaridade"
                  style={{ color: COR_RARIDADE[dados?.raridade ?? "Comum"] }}
                >
                  {dados?.raridade ?? "—"}
                </span>
                <span className="itemPeso">
                  {dados ? `${(dados.peso * quantidade).toFixed(1)} kg` : ""}
                </span>
                {equipado && <span className="badgeEquipado">✦ Equipado</span>}
              </div>

              {/* Quantidade */}
              <div className="itemQuantidade">
                <button
                  className="btnQtd"
                  onClick={() => alterarQuantidade(itemId, -1)}
                  title="Diminuir"
                >
                  −
                </button>
                <span>{quantidade}</span>
                <button
                  className="btnQtd"
                  onClick={() => alterarQuantidade(itemId, +1)}
                  title="Aumentar"
                >
                  +
                </button>
              </div>

              {/* Ações */}
              <div className="itemAcoes">
                {dados?.slot && dados.slot !== "" && (
                  <button
                    className={`btnItem ${equipado ? "btnDesequipar" : "btnEquipar"}`}
                    onClick={() => alternarEquipamento(itemId)}
                  >
                    {equipado ? "Desequipar" : "Equipar"}
                  </button>
                )}

                {dados?.tipo === "Consumível" && (
                  <button
                    className="btnItem btnConsumir"
                    onClick={() => consumirItem(itemId, dados)}
                  >
                    Consumir
                  </button>
                )}

                <button
                  className="btnItem btnRemover"
                  onClick={() => removerDoInventario(itemId)}
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── ABA: CATÁLOGO GLOBAL ──────────────────────────────────────────── */}
      {aba === "catalogo" && (
        <div className="catalogoContainer">
          <input
            className="catalogoFiltro"
            placeholder="🔍 Buscar item..."
            value={filtroCatalogo}
            onChange={(e) => setFiltroCatalogo(e.target.value)}
          />

          <div className="listaCatalogo">
            {catalogoFiltrado.map((item) => (
              <div key={item.id} className="itemCatalogo">
                <Image
                  src={item.imagem || "/imagens/itens/padrao.png"}
                  alt={item.nome}
                  width={44}
                  height={44}
                  className="itemImagem"
                />

                <div className="itemInfo">
                  <span className="itemNome">{item.nome}</span>
                  <span
                    className="itemRaridade"
                    style={{ color: COR_RARIDADE[item.raridade ?? "Comum"] }}
                  >
                    {item.raridade}
                  </span>
                  <span className="itemTipo">{item.tipo} · {item.subtipo}</span>
                  {item.nivelMinimo && item.nivelMinimo > 1 && (
                    <span className="itemRequisito">Nível {item.nivelMinimo}+</span>
                  )}
                </div>

                <button
                  className="btnItem btnAdicionar"
                  onClick={() => adicionarAoInventario(String(item.id))}
                >
                  + Adicionar
                </button>
              </div>
            ))}

            {catalogoFiltrado.length === 0 && (
              <p className="inventarioVazio">Nenhum item encontrado.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
