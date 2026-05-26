"use client";

import { useEffect, useState } from "react";
import { completarPersonagem, listarPersonagens } from "../../../services/personagemService";
import CardPersonagem from "./CardPersonagem";
import FiltrosPersonagem from "./FiltrosPersonagem";

export default function ListaPersonagens() {
  const [pesquisa, setPesquisa] = useState("");
  const [classe, setClasse] = useState("");
  const [raca, setRaca] = useState("");
  const [personagens, setPersonagens] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const base = await listarPersonagens();
      const completos = await Promise.all(base.map(p => completarPersonagem(p)));
      setPersonagens(completos);
      setCarregando(false);
    }
    carregar();
  }, []);

  const filtrados = personagens.filter((personagem) => {
    const nomeOk = (personagem.nome || "").toLowerCase().includes(pesquisa.toLowerCase());
    const classeOk = (personagem.classe || "").toLowerCase().includes(classe.toLowerCase());
    const racaOk = (personagem.raca || "").toLowerCase().includes(raca.toLowerCase());
    return nomeOk && classeOk && racaOk;
  });

  const classesUnicas = [...new Set(personagens.map((p) => p.classe))];
  const racasUnicas = [...new Set(personagens.map((p) => p.raca))];

  if (carregando) return <div className="carregando">Convocando aventureiros...</div>;

  return (
    <div>
      <h1 className="paginaTitulo">👥 Personagens</h1>

      <FiltrosPersonagem
        pesquisa={pesquisa}
        setPesquisa={setPesquisa}
        classe={classe}
        setClasse={setClasse}
        raca={raca}
        setRaca={setRaca}
        classes={classesUnicas}
        racas={racasUnicas}
      />

      <div className="listaPersonagensGrid">
        {filtrados.map((personagem) => (
          <CardPersonagem key={personagem.id} personagem={personagem} />
        ))}
      </div>
    </div>
  );
}
