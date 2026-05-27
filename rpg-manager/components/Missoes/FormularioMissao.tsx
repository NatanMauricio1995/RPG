"use client";

import { useState, useEffect } from "react";
import { Missao, salvarMissao, StatusMissao } from "../../services/missaoService";

type Props = {
  missaoInicial?: Missao | null;
  onSalvar: () => void;
  onCancelar: () => void;
};

export default function FormularioMissao({ missaoInicial, onSalvar, onCancelar }: Props) {
  const [missao, setMissao] = useState<Partial<Missao>>({
    nome: "",
    descricao: "",
    objetivo: "",
    recompensa: "",
    status: "Não iniciada",
  });

  useEffect(() => {
    if (missaoInicial) {
      setMissao(missaoInicial);
    }
  }, [missaoInicial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMissao((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await salvarMissao(missao);
    onSalvar();
  };

  return (
    <form className="formulario-missao" onSubmit={handleSubmit}>
      <h2>{missaoInicial ? "Editar Missão" : "Nova Missão"}</h2>
      
      <div className="campo">
        <label>Nome</label>
        <input name="nome" value={missao.nome} onChange={handleChange} required />
      </div>

      <div className="campo">
        <label>Descrição</label>
        <textarea name="descricao" value={missao.descricao} onChange={handleChange} required />
      </div>

      <div className="campo">
        <label>Objetivo</label>
        <input name="objetivo" value={missao.objetivo} onChange={handleChange} required />
      </div>

      <div className="campo">
        <label>Recompensa</label>
        <input name="recompensa" value={missao.recompensa} onChange={handleChange} required />
      </div>

      <div className="campo">
        <label>Status</label>
        <select name="status" value={missao.status} onChange={handleChange}>
          <option value="Não iniciada">Não iniciada</option>
          <option value="Em andamento">Em andamento</option>
          <option value="Concluída">Concluída</option>
          <option value="Falhou">Falhou</option>
        </select>
      </div>

      <div className="botoes-formulario">
        <button type="submit">Salvar</button>
        <button type="button" onClick={onCancelar}>Cancelar</button>
      </div>
    </form>
  );
}
