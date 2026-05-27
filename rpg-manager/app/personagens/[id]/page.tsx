"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import usePersonagem from "../../../hooks/usePersonagem";
import useNivel from "../../../hooks/useNivel";
import { useInventarioContext } from "../../../contexts/InventarioContext";

import InformacoesBasicas from "../../../components/Personagem/Ficha/InformacoesBasicas";
import Atributos from "../../../components/Personagem/Ficha/Atributos";
import ModalNivel from "../../../components/Personagem/Nivel/ModalNivel";
import SistemaEquipamento from "../../../components/Personagem/Equipamentos/SistemaEquipamento";
import Inventario from "../../../components/Personagem/Inventario/Inventario";

export default function Ficha() {
  const params = useParams();
  const { personagemAtual, setPersonagemAtual } = usePersonagem(Number(params.id));
  const { carregarInventario } = useInventarioContext();
  const [abaAtiva, setAbaAtiva] = useState<"geral" | "equipamentos" | "inventario">("geral");

  const {
    subindoNivel,
    setSubindoNivel,
    pontosRestantes,
    atributosTemp,
    adicionarPonto,
    removerPonto,
    confirmarNivel,
  } = useNivel(personagemAtual, setPersonagemAtual);

  useEffect(() => {
    if (!personagemAtual) return;
    carregarInventario(personagemAtual.inventario || [], personagemAtual.equipados);
  }, [personagemAtual]);

  if (!personagemAtual) {
    return (
      <div className="containerErro">
        <h1>❌ Personagem não encontrado</h1>
        <Link href="/personagens">Voltar para a lista</Link>
      </div>
    );
  }

  return (
    <div className="fichaPersonagemContainer">
      <div className="fichaHeader">
        <div className="acoesTopo">
          <Link href="/personagens">
            <button className="btnVoltar">⬅️ Voltar</button>
          </Link>
          <Link href={`/personagens/${personagemAtual.id}/editar`}>
            <button className="btnEditar">✏️ Editar</button>
          </Link>
        </div>

        <div className="headerInfo">
          <Image
            src={personagemAtual.imagem || "/imagens/racas/padrao.png"}
            alt={personagemAtual.nome}
            width={120}
            height={120}
            className="imagemMiniatura"
          />
          <div className="textosHeader">
            <h1>{personagemAtual.nome}</h1>
            <p>Nível {personagemAtual.nivel} • {personagemAtual.raca} {personagemAtual.classe}</p>
          </div>
        </div>

        <nav className="fichaTabs">
          <button className={abaAtiva === "geral" ? "active" : ""} onClick={() => setAbaAtiva("geral")}>
            📜 Geral
          </button>
          <button className={abaAtiva === "equipamentos" ? "active" : ""} onClick={() => setAbaAtiva("equipamentos")}>
            ⚔️ Equipamentos
          </button>
          <button className={abaAtiva === "inventario" ? "active" : ""} onClick={() => setAbaAtiva("inventario")}>
            🎒 Inventário
          </button>
        </nav>
      </div>

      <div className="fichaConteudo">
        {abaAtiva === "geral" && (
          <div className="secaoGeral animarEntrada">
            <InformacoesBasicas 
              personagemAtual={personagemAtual} 
              setSubindoNivel={setSubindoNivel} 
            />
            <Atributos personagemAtual={personagemAtual} />
          </div>
        )}

        {abaAtiva === "equipamentos" && (
          <div className="secaoEquipamentos animarEntrada">
            <SistemaEquipamento />
          </div>
        )}

        {abaAtiva === "inventario" && (
          <div className="secaoInventario animarEntrada">
            <Inventario personagemId={personagemAtual.id} />
          </div>
        )}
      </div>

      <ModalNivel
        subindoNivel={subindoNivel}
        setSubindoNivel={setSubindoNivel}
        personagemAtual={personagemAtual}
        atributosTemp={atributosTemp}
        pontosRestantes={pontosRestantes}
        adicionarPonto={adicionarPonto}
        removerPonto={removerPonto}
        confirmarNivel={confirmarNivel}
      />
    </div>
  );
}

