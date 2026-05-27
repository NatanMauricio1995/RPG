"use client";

import { useState, useEffect } from "react";
import { listarAreas, Area } from "../../services/areaService";
import Link from "next/link";
import Image from "next/image";

export default function ListaAreas() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    listarAreas().then(dados => {
      setAreas(dados);
      setCarregando(false);
    });
  }, []);

  if (carregando) return <div className="carregando">Mapeando territórios...</div>;

  return (
    <div className="habilidadesGrid">
      {areas.map(area => (
        <div key={area.id} className="cardHabilidade">
          <Image src={area.mapa || "/imagens/areas/padrao.png"} alt={area.nome} width={300} height={160} className="imagemHabilidade" />
          <div className="conteudoHabilidade">
            <div className="tipoHabilidade">{area.tipo}</div>
            <h3 className="nomeHabilidade">{area.nome}</h3>
            <p className="descricaoHabilidade">{area.descricao}</p>
          </div>
          <div className="acoesHabilidade">
             <Link href={`/areas/${area.id}`} className="botaoHabilidade botaoEditarHabilidade">Explorar</Link>
          </div>
        </div>
      ))}
    </div>
  );
}
