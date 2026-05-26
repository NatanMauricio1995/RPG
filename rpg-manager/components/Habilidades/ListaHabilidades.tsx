"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { listarHabilidades, excluirHabilidade } from "../../services/habilidadeServiceFirebase";
import CardHabilidade from "./CardHabilidade";
import type { Habilidade } from "../../types/domain";

export default function ListaHabilidades() {
  const [habilidades, setHabilidades] = useState<Habilidade[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);
    const dados = await listarHabilidades();
    setHabilidades(dados);
    setCarregando(false);
  }

  async function handleExcluir(id: string) {
    if (confirm("Tem certeza que deseja excluir esta habilidade?")) {
      const sucesso = await excluirHabilidade(id);
      if (sucesso) {
        setHabilidades((anterior) => anterior.filter((h) => h.id !== id));
      }
    }
  }

  const filtradas = habilidades.filter((h) =>
    h.nome.toLowerCase().includes(busca.toLowerCase()) ||
    h.tipo.toLowerCase().includes(busca.toLowerCase()) ||
    h.categoria.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Buscar habilidade..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{
            flex: 1,
            padding: '10px',
            background: 'var(--pedra-clara)',
            border: '1px solid var(--ouro-escuro)',
            borderRadius: '4px',
            color: 'var(--texto)',
            fontFamily: 'Cinzel, serif'
          }}
        />
        <Link href="/habilidades/inserir" className="botaoAcao" style={{ marginBottom: 0 }}>
          + Nova Habilidade
        </Link>
      </div>

      {carregando ? (
        <div className="carregando">Convocando habilidades...</div>
      ) : filtradas.length > 0 ? (
        <div className="habilidadesGrid">
          {filtradas.map((h) => (
            <CardHabilidade key={h.id} habilidade={h} onExcluir={handleExcluir} />
          ))}
        </div>
      ) : (
        <div className="semDados">Nenhuma habilidade encontrada.</div>
      )}
    </div>
  );
}
