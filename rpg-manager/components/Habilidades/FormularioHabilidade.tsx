"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { salvarHabilidade, buscarHabilidade } from "../../services/habilidadeServiceFirebase";
import type { Habilidade } from "../../types/domain";

type Props = {
  modoEdicao?: boolean;
};

const MODELO_HABILIDADE: Partial<Habilidade> = {
  nome: "",
  descricao: "",
  imagem: "/imagens/habilidades/padrao.png",
  tipo: "Físico",
  categoria: "Ataque",
  dano: "",
  cura: "",
  custoMana: 0,
  cooldown: 0,
  alcance: 1,
  area: 1,
  efeitos: [],
  nivelMin: 1,
  castTime: "1 ação",
  passiva: false,
};

export default function FormularioHabilidade({ modoEdicao = false }: Props) {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [habilidade, setHabilidade] = useState<Partial<Habilidade>>(MODELO_HABILIDADE);
  const [arquivoImagem, setArquivoImagem] = useState<File | null>(null);
  const [previewImagem, setPreviewImagem] = useState<string>(MODELO_HABILIDADE.imagem!);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (modoEdicao && id) {
      setCarregando(true);
      buscarHabilidade(id).then((dados) => {
        if (dados) {
          setHabilidade(dados);
          if (dados.imagem) setPreviewImagem(dados.imagem);
        }
        setCarregando(false);
      });
    }
  }, [modoEdicao, id]);

  function alterarCampo(evento: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = evento.target;
    setHabilidade((anterior) => ({
      ...anterior,
      [name]: type === "number" ? Number(value) : value,
    }));
  }

  function alterarCheckbox(evento: React.ChangeEvent<HTMLInputElement>) {
    const { name, checked } = evento.target;
    setHabilidade((anterior) => ({
      ...anterior,
      [name]: checked,
    }));
  }

  function carregarImagem(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;

    setArquivoImagem(arquivo);
    const leitor = new FileReader();
    leitor.onload = () => {
      setPreviewImagem(leitor.result as string);
    };
    leitor.readAsDataURL(arquivo);
  }

  async function salvar() {
    setCarregando(true);
    try {
      const idSalvo = await salvarHabilidade(habilidade, arquivoImagem || undefined);
      if (idSalvo) {
        router.push("/habilidades");
      }
    } catch (erro) {
      console.error("Erro ao salvar habilidade:", erro);
      alert("Erro ao salvar habilidade.");
    } finally {
      setCarregando(false);
    }
  }

  if (carregando && modoEdicao) {
    return <div className="carregando">Carregando dados da habilidade...</div>;
  }

  return (
    <div className="formularioHabilidade">
      <h2 className="formularioTitulo">
        {modoEdicao ? "✦ Editar Habilidade ✦" : "✦ Criar Habilidade ✦"}
      </h2>

      <div className="campoHabilidade">
        <label>Nome da Habilidade</label>
        <input name="nome" value={habilidade.nome} onChange={alterarCampo} placeholder="Ex: Bola de Fogo" />
      </div>

      <div className="gridHabilidade">
        <div className="campoHabilidade">
          <label>Tipo</label>
          <select name="tipo" value={habilidade.tipo} onChange={alterarCampo}>
            <option value="Físico">Físico</option>
            <option value="Mágico">Mágico</option>
            <option value="Especial">Especial</option>
            <option value="Passiva">Passiva</option>
          </select>
        </div>

        <div className="campoHabilidade">
          <label>Categoria</label>
          <select name="categoria" value={habilidade.categoria} onChange={alterarCampo}>
            <option value="Ataque">Ataque</option>
            <option value="Defesa">Defesa</option>
            <option value="Suporte">Suporte</option>
            <option value="Utilitário">Utilitário</option>
          </select>
        </div>
      </div>

      <div className="campoHabilidade">
        <label>Descrição</label>
        <textarea
          name="descricao"
          value={habilidade.descricao}
          onChange={alterarCampo}
          rows={3}
          placeholder="Descreva o que a habilidade faz..."
        />
      </div>

      <div className="gridHabilidade">
        <div className="campoHabilidade">
          <label>Dano (Expressão)</label>
          <input name="dano" value={habilidade.dano} onChange={alterarCampo} placeholder="Ex: 2d6 + 4" />
        </div>
        <div className="campoHabilidade">
          <label>Cura (Expressão)</label>
          <input name="cura" value={habilidade.cura} onChange={alterarCampo} placeholder="Ex: 1d8 + 2" />
        </div>
      </div>

      <div className="gridHabilidade">
        <div className="campoHabilidade">
          <label>Custo de Mana</label>
          <input type="number" name="custoMana" value={habilidade.custoMana} onChange={alterarCampo} />
        </div>
        <div className="campoHabilidade">
          <label>Recarga (Turnos)</label>
          <input type="number" name="cooldown" value={habilidade.cooldown} onChange={alterarCampo} />
        </div>
      </div>

      <div className="gridHabilidade">
        <div className="campoHabilidade">
          <label>Alcance (Metros)</label>
          <input type="number" name="alcance" value={habilidade.alcance} onChange={alterarCampo} />
        </div>
        <div className="campoHabilidade">
          <label>Área (Metros)</label>
          <input type="number" name="area" value={habilidade.area} onChange={alterarCampo} />
        </div>
      </div>

      <div className="gridHabilidade">
        <div className="campoHabilidade">
          <label>Nível Mínimo</label>
          <input type="number" name="nivelMin" value={habilidade.nivelMin} onChange={alterarCampo} />
        </div>
        <div className="campoHabilidade">
          <label>Tempo de Conjuração</label>
          <input name="castTime" value={habilidade.castTime} onChange={alterarCampo} placeholder="Ex: 1 ação" />
        </div>
      </div>

      <div className="campoHabilidade" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input 
          type="checkbox" 
          name="passiva" 
          id="passiva"
          checked={habilidade.passiva} 
          onChange={alterarCheckbox}
          style={{ width: 'auto' }}
        />
        <label htmlFor="passiva" style={{ marginBottom: 0 }}>Esta habilidade é passiva</label>
      </div>

      <div className="campoHabilidade">
        <label>Imagem da Habilidade</label>
        <input type="file" accept="image/*" onChange={carregarImagem} />
        <Image 
          src={previewImagem} 
          alt="Preview" 
          width={200} 
          height={150} 
          className="previewHabilidade"
        />
      </div>

      <button className="botaoAcao" onClick={salvar} disabled={carregando} style={{ width: '100%' }}>
        {carregando ? "Salvando..." : modoEdicao ? "💾 Salvar Alterações" : "💾 Criar Habilidade"}
      </button>

      <button className="botaoVoltar" onClick={() => router.back()} style={{ width: '100%' }}>
        Cancelar
      </button>
    </div>
  );
}
