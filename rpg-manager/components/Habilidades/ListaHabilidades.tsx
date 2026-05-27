"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { listarHabilidades, excluirHabilidade, Habilidade } from "../../services/habilidadeService";
import CardHabilidade from "./CardHabilidade";

export default function ListaHabilidades() {
  const [habilidades, setHabilidades] = useState<Habilidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setLoading(true);
    setErro(null);
    try {
      const dados = await listarHabilidades();
      setHabilidades(dados);
    } catch (error) {
      setErro("Falha ao carregar habilidades.");
      console.error("Erro ao carregar habilidades:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleExcluir(id: string) {
    if (confirm("Tem certeza que deseja excluir esta habilidade?")) {
      try {
        await excluirHabilidade(id);
        setHabilidades((anterior) => anterior.filter((h) => h.id !== id));
      } catch (error) {
        console.error("Erro ao excluir habilidade:", error);
        alert("Erro ao excluir habilidade.");
      }
    }
  }

  const filtradas = habilidades.filter((h) =>
    h.nome.toLowerCase().includes(busca.toLowerCase()) ||
    h.tipo.toLowerCase().includes(busca.toLowerCase()) ||
    h.descricao.toLowerCase().includes(busca.toLowerCase())
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

      {loading ? (
        <div className="carregando">Convocando habilidades...</div>
      ) : erro ? (
        <div className="erroMensagem">{erro}</div>
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
