"use client";

import { useState, useEffect } from "react";
import { Missao, salvarMissao } from "../../services/missaoService";
import type { ObjetivoMissao } from "../../types/domain";

type Props = {
  missaoInicial?: Missao | null;
  onSalvar: () => void;
  onCancelar: () => void;
};

export default function FormularioMissao({ missaoInicial, onSalvar, onCancelar }: Props) {
  const [missao, setMissao] = useState<Partial<Missao>>({
    nome: "",
    descricao: "",
    objetivos: [],
    recompensas: {
      ouro: 0,
      xp: 0,
      itens: []
    },
    status: "disponível",
    nivelRecomendado: 1
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

  const handleRecompensaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMissao((prev) => ({
      ...prev,
      recompensas: {
        ...(prev.recompensas || { ouro: 0, xp: 0, itens: [] }),
        [name]: Number(value)
      }
    }));
  };

  const addObjetivo = () => {
    const novo: ObjetivoMissao = {
      descricao: "",
      tipo: "explorar",
      quantidadeAtual: 0,
      concluido: false
    };
    setMissao(prev => ({ ...prev, objetivos: [...(prev.objetivos || []), novo] }));
  };

  const removeObjetivo = (index: number) => {
    setMissao(prev => ({
      ...prev,
      objetivos: (prev.objetivos || []).filter((_, i) => i !== index)
    }));
  };

  const updateObjetivo = (index: number, campo: keyof ObjetivoMissao, valor: any) => {
    setMissao(prev => {
      const novos = [...(prev.objetivos || [])];
      novos[index] = { ...novos[index], [campo]: valor };
      return { ...prev, objetivos: novos };
    });
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
        <label>Nível Recomendado</label>
        <input name="nivelRecomendado" type="number" value={missao.nivelRecomendado} onChange={handleChange} />
      </div>

      <div className="secao-formulario">
        <h3>🎯 Objetivos</h3>
        {(missao.objetivos || []).map((obj, i) => (
          <div key={i} className="objetivo-form">
            <input 
              placeholder="Descrição do objetivo" 
              value={obj.descricao} 
              onChange={(e) => updateObjetivo(i, "descricao", e.target.value)} 
            />
            <select value={obj.tipo} onChange={(e) => updateObjetivo(i, "tipo", e.target.value)}>
              <option value="matar">Matar</option>
              <option value="coletar">Coletar</option>
              <option value="falar">Falar</option>
              <option value="explorar">Explorar</option>
            </select>
            <button type="button" onClick={() => removeObjetivo(i)}>✕</button>
          </div>
        ))}
        <button type="button" onClick={addObjetivo}>+ Adicionar Objetivo</button>
      </div>

      <div className="secao-formulario">
        <h3>🎁 Recompensas</h3>
        <div className="campo-horizontal">
          <label>Ouro</label>
          <input name="ouro" type="number" value={missao.recompensas?.ouro} onChange={handleRecompensaChange} />
          <label>XP</label>
          <input name="xp" type="number" value={missao.recompensas?.xp} onChange={handleRecompensaChange} />
        </div>
      </div>

      <div className="campo">
        <label>Status</label>
        <select name="status" value={missao.status} onChange={handleChange}>
          <option value="disponível">Disponível</option>
          <option value="ativa">Ativa</option>
          <option value="concluída">Concluída</option>
          <option value="falhou">Falhou</option>
        </select>
      </div>

      <div className="botoes-formulario">
        <button type="submit">Salvar</button>
        <button type="button" onClick={onCancelar}>Cancelar</button>
      </div>
    </form>
  );
}
