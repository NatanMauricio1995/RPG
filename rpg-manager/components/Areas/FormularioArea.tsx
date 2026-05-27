"use client";

import { useState, useEffect } from "react";
import { Area, salvarArea, TipoArea } from "../../services/areaService";

type Props = {
  areaInicial?: Area | null;
  onSalvar: () => void;
  onCancelar: () => void;
};

export default function FormularioArea({ areaInicial, onSalvar, onCancelar }: Props) {
  const [area, setArea] = useState<Partial<Area>>({
    nome: "",
    descricao: "",
    tipo: "Cidade",
    observacoes: "",
    imagem: "",
    mapa: ""
  });

  useEffect(() => {
    if (areaInicial) {
      setArea(areaInicial);
    }
  }, [areaInicial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setArea((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: "imagem" | "mapa") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setArea((prev) => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await salvarArea(area);
    onSalvar();
  };

  return (
    <form className="formulario-area" onSubmit={handleSubmit}>
      <h2>{areaInicial ? "Editar Área" : "Nova Área"}</h2>
      
      <div className="campo">
        <label>Nome</label>
        <input name="nome" value={area.nome} onChange={handleChange} required />
      </div>

      <div className="campo">
        <label>Tipo</label>
        <select name="tipo" value={area.tipo} onChange={handleChange}>
          <option value="Cidade">Cidade</option>
          <option value="Vila">Vila</option>
          <option value="Floresta">Floresta</option>
          <option value="Caverna">Caverna</option>
          <option value="Ruína">Ruína</option>
          <option value="Templo">Templo</option>
          <option value="Reino">Reino</option>
          <option value="Outro">Outro</option>
        </select>
      </div>

      <div className="campo">
        <label>Descrição</label>
        <textarea name="descricao" value={area.descricao} onChange={handleChange} required />
      </div>

      <div className="campo">
        <label>Observações</label>
        <textarea name="observacoes" value={area.observacoes} onChange={handleChange} />
      </div>

      <div className="campo">
        <label>Imagem (URL ou Upload)</label>
        <input name="imagem" value={area.imagem} onChange={handleChange} placeholder="URL da imagem..." />
        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "imagem")} />
      </div>

      <div className="botoes-formulario">
        <button type="submit">Salvar</button>
        <button type="button" onClick={onCancelar}>Cancelar</button>
      </div>
    </form>
  );
}
