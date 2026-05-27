"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { criarHabilidade, editarHabilidade, buscarHabilidade, Habilidade } from "../../services/habilidadeService";

type Props = {
  modoEdicao?: boolean;
};

const MODELO_HABILIDADE: Omit<Habilidade, 'id'> = {
  nome: "",
  descricao: "",
  imagem: "/imagens/habilidades/padrao.png",
  tipo: "ativa",
  dano: 0,
  cura: 0,
  custoMana: 0,
  cooldown: 0,
  alcance: 1,
  area: 1,
  nivelMinimo: 1,
};

export default function FormularioHabilidade({ modoEdicao = false }: Props) {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [habilidade, setHabilidade] = useState<Omit<Habilidade, 'id'>>(MODELO_HABILIDADE);
  const [arquivoImagem, setArquivoImagem] = useState<File | null>(null);
  const [previewImagem, setPreviewImagem] = useState<string>(MODELO_HABILIDADE.imagem);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (modoEdicao && id) {
      setCarregando(true);
      buscarHabilidade(id).then((dados) => {
        if (dados) {
          const { id: _, ...rest } = dados;
          setHabilidade(rest);
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
      if (modoEdicao && id) {
        await editarHabilidade(id, habilidade, arquivoImagem || undefined);
      } else {
        await criarHabilidade(habilidade, arquivoImagem || undefined);
      }
      router.push("/habilidades");
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
    <div className="formulario">
      <h2 className="formularioTitulo">
        {modoEdicao ? "✦ Editar Habilidade ✦" : "✦ Criar Habilidade ✦"}
      </h2>

      <div className="campo">
        <label>Nome da Habilidade</label>
        <input name="nome" value={habilidade.nome} onChange={alterarCampo} placeholder="Ex: Bola de Fogo" />
      </div>

      <div className="campo">
        <label>Descrição</label>
        <textarea
          name="descricao"
          value={habilidade.descricao}
          onChange={alterarCampo}
          rows={3}
          placeholder="Descreva o que a habilidade faz..."
        />
      </div>

      <div className="bonusGrid">
        <div className="campo">
          <label>Tipo</label>
          <select name="tipo" value={habilidade.tipo} onChange={alterarCampo}>
            <option value="ativa">Ativa</option>
            <option value="passiva">Passiva</option>
            <option value="reacao">Reação</option>
          </select>
        </div>

        <div className="campo">
          <label>Nível Mínimo</label>
          <input type="number" name="nivelMinimo" value={habilidade.nivelMinimo} onChange={alterarCampo} />
        </div>
      </div>

      <div className="bonusGrid">
        <div className="campo">
          <label>Dano</label>
          <input type="number" name="dano" value={habilidade.dano} onChange={alterarCampo} />
        </div>
        <div className="campo">
          <label>Cura</label>
          <input type="number" name="cura" value={habilidade.cura} onChange={alterarCampo} />
        </div>
      </div>

      <div className="bonusGrid">
        <div className="campo">
          <label>Custo de Mana</label>
          <input type="number" name="custoMana" value={habilidade.custoMana} onChange={alterarCampo} />
        </div>
        <div className="campo">
          <label>Recarga (Turnos)</label>
          <input type="number" name="cooldown" value={habilidade.cooldown} onChange={alterarCampo} />
        </div>
      </div>

      <div className="bonusGrid">
        <div className="campo">
          <label>Alcance (Metros)</label>
          <input type="number" name="alcance" value={habilidade.alcance} onChange={alterarCampo} />
        </div>
        <div className="campo">
          <label>Área (Metros)</label>
          <input type="number" name="area" value={habilidade.area} onChange={alterarCampo} />
        </div>
      </div>

      <div className="campo">
        <label>Imagem da Habilidade</label>
        <input type="file" accept="image/*" onChange={carregarImagem} />
        <div className="previewImagem">
          <Image 
            src={previewImagem} 
            alt="Preview" 
            width={200} 
            height={150} 
          />
        </div>
      </div>

      <button className="botaoSalvar" onClick={salvar} disabled={carregando} style={{ width: '100%' }}>
        {carregando ? "Salvando..." : modoEdicao ? "💾 Salvar Alterações" : "💾 Criar Habilidade"}
      </button>

      <button className="botaoVoltar" onClick={() => router.back()} style={{ width: '100%', marginTop: '10px' }}>
        Cancelar
      </button>
    </div>
  );
}
