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

type Props = {
  personagem?: Personagem;
  personagemId?: string | number;
  onUpdate?: (p: Personagem) => void;
};

export default function Inventario({ personagem: propPersonagem, personagemId, onUpdate }: Props) {
  const [aba, setAba] = useState<"inventario" | "catalogo">("inventario");
  const [filtroCatalogo, setFiltroCatalogo] = useState("");

  const {
    itensCatalogo,
    inventario,
    adicionarAoInventario,
    removerDoInventario,
    alterarQuantidade,
    consumirItem: hookConsumirItem,
    alternarEquipamento,
    pesoTotal,
    capacidadeMaxima,
    porcentagemPeso,
    corPeso,
  } = useInventario(propPersonagem || personagemId || null, onUpdate);

  // Precisamos do objeto personagem para algumas lógicas locais de cura
  // O hook retorna o inventário resolvido, mas não o personagem completo
  // Porém, o hook useInventario agora gerencia o personagem internamente se passar ID.
  // Vamos tentar obter o personagem do inventário ou passar via props.

  // ─── Consumir item ────────────────────────────────────────────────────────────
  async function handleConsumir(itemId: string, item: Item | null) {
    if (!item) return;
    try {
      // Se tivermos o objeto personagem completo, podemos aplicar efeitos imediatos (cura/mana)
      // Caso contrário, apenas consumimos a quantidade.
      // Idealmente, efeitos seriam processados pelo servidor ou por um serviço de efeitos.
      
      if (propPersonagem && item.tipo === "Consumível" && (item.cura || item.mana)) {
        const vidaMaxima = (propPersonagem as any).vidaMaxima ?? 10;
        const manaMaxima = (propPersonagem as any).manaMaxima ?? 10;
        
        let novaVida = propPersonagem.vidaAtual + (item.cura ?? 0);
        if (novaVida > vidaMaxima) novaVida = vidaMaxima;
        
        let novaMana = propPersonagem.manaAtual + (item.mana ?? 0);
        if (novaMana > manaMaxima) novaMana = manaMaxima;

        await salvarPersonagem({ ...propPersonagem, vidaAtual: novaVida, manaAtual: novaMana });
      }

      // Reduz quantidade via hook
      await hookConsumirItem(itemId, 1);
    } catch (error: any) {
      alert(error.message);
    }
  }

  // ─── Catálogo filtrado ────────────────────────────────────────────────────────
  const catalogoFiltrado = itensCatalogo.filter((item) =>
    item.nome.toLowerCase().includes(filtroCatalogo.toLowerCase())
  );

  async function handleAdicionar(itemId: string) {
    try {
      await adicionarAoInventario(itemId);
    } catch (error: any) {
      alert(error.message);
    }
  }

  async function handleAlterarQuantidade(itemId: string, delta: number) {
    try {
      await alterarQuantidade(itemId, delta);
    } catch (error: any) {
      alert(error.message);
    }
  }

  return (
    <div className="inventarioContainer">
      {/* Cabeçalho com peso */}
      <div className="inventarioCabecalho">
        <div className="pesoContainer">
          <span className="pesoBarra" style={{ color: corPeso }}>
            ⚖️ {pesoTotal.toFixed(1)} / {capacidadeMaxima} kg
          </span>
          <div className="pesoProgressoFundo">
            <div
              className="pesoProgressoBarra"
              style={{
                width: `${Math.min(100, porcentagemPeso)}%`,
                backgroundColor: corPeso,
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
              <div className="itemImagemContainer">
                <Image
                  src={dados?.imagem || "/imagens/itens/padrao.png"}
                  alt={dados?.nome ?? itemId}
                  width={52}
                  height={52}
                  className="itemImagem"
                />
              </div>

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
                  onClick={() => handleAlterarQuantidade(itemId, -1)}
                  title="Diminuir"
                >
                  −
                </button>
                <span>{quantidade}</span>
                <button
                  className="btnQtd"
                  onClick={() => handleAlterarQuantidade(itemId, +1)}
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
                    onClick={() => handleConsumir(itemId, dados)}
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
                  onClick={() => handleAdicionar(String(item.id))}
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
