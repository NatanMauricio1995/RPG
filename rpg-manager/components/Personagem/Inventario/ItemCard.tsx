"use client";

import Image from "next/image";
import type { Item, InventarioItem } from "../../../types/domain";

type Props = {
  item: Item;
  invData?: InventarioItem;
  contexto: "catalogo" | "inventario";
  onAdd?: (item: Item) => void;
  onRemove?: (itemId: string) => void;
  onAlterarQuantidade?: (itemId: string, delta: number) => void;
  onEquipar?: (itemId: string) => void;
};

export default function ItemCard({
  item,
  invData,
  contexto,
  onAdd,
  onRemove,
  onAlterarQuantidade,
  onEquipar,
}: Props) {
  const corRaridade = {
    Comum: "#a0a0a0",
    Incomum: "#1eff00",
    Raro: "#0070dd",
    Épico: "#a335ee",
    Lendário: "#ff8000",
    Único: "#e6cc80",
  }[item.raridade || "Comum"];

  return (
    <div className={`itemCard ${invData?.equipado ? "equipado" : ""} ${contexto}`}>
      {invData?.equipado && <div className="badgeEquipado">Equipado</div>}
      
      <div className="itemImagemContainer">
        <Image
          src={item.imagem || "/imagens/itens/padrao.png"}
          alt={item.nome}
          width={120}
          height={120}
          className="imagemItemInventario"
        />
      </div>

      <div className="itemInfo">
        <div className="headerItem">
          <h3 style={{ color: corRaridade }}>{item.nome}</h3>
          <span className="raridade" style={{ backgroundColor: corRaridade + "33", color: corRaridade }}>
            {item.raridade}
          </span>
        </div>
        
        <div className="detalhesRapidos">
          <span className="tagSubtipo">📦 {item.subtipo}</span>
          {item.nivel && <span className="tagNivel">📜 Nível {item.nivel}</span>}
          {item.peso !== undefined && <span className="tagPeso">⚖️ {item.peso}kg</span>}
        </div>

        {item.bonus && Object.keys(item.bonus).length > 0 && (
          <div className="bonusList">
            {Object.entries(item.bonus).map(([attr, val]) => (
              <span key={attr} className="bonusItem">
                +{val} {attr.substring(0, 3).toUpperCase()}
              </span>
            ))}
          </div>
        )}

        {item.descricao && <p className="itemDescricao" title={item.descricao}>{item.descricao}</p>}
      </div>

      <div className="itemAcoes">
        {contexto === "catalogo" ? (
          <button className="btnAdicionar" onClick={() => onAdd?.(item)}>
            ➕ Adicionar
          </button>
        ) : (
          <>
            <div className="controleQuantidade">
              <button onClick={() => onAlterarQuantidade?.(String(item.id), -1)}>-</button>
              <span className="quantidade">{invData?.quantidade || 1}</span>
              <button onClick={() => onAlterarQuantidade?.(String(item.id), 1)}>+</button>
            </div>
            
            <div className="botoesPrincipais">
              {item.tipo === "Equipamento" && (
                <button 
                  className={`btnEquipar ${invData?.equipado ? "ativo" : ""}`}
                  onClick={() => onEquipar?.(String(item.id))}
                >
                  {invData?.equipado ? "🛡️ Desequipar" : "⚔️ Equipar"}
                </button>
              )}
              <button className="btnRemover" onClick={() => onRemove?.(String(item.id))}>
                🗑️
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}