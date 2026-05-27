"use client";

import {useState, useEffect, type ChangeEvent} from "react";
import {useParams, useRouter} from "next/navigation";
import Image from "next/image";

import classes from "../../data/sistema/classes.json";
import racas from "../../data/sistema/racas.json";
import {buscarItem, normalizarItem, salvarItem, editarItem} from "../../services/itemService";
import type { Item } from "../../types/domain";

type Props = {
  modoEdicao?: boolean;
};

const modeloItem = {
  nome: "",
  descricao: "",
  tipo: "Equipamento",
  subtipo: "Arma",
  nivelMinimo: 1,
  imagem: "/imagens/itens/padrao.png",
  bonus: {
    forca: 0,
    destreza: 0,
    constituicao: 0,
    inteligencia: 0,
    sabedoria: 0,
    carisma: 0
  },
  efeitos: [] as any[]
};

export default function FormularioItem({ modoEdicao = false }: Props) {
  const router = useRouter();
  const params = useParams();
  const id = params?.id ? String(params.id) : null;

  const [item, setItem] = useState<any>(modeloItem);
  const [carregando, setCarregando] = useState(modoEdicao);

  useEffect(() => {
    if (modoEdicao && id) {
      buscarItem(id).then(encontrado => {
        if (encontrado) {
          setItem(normalizarItem(encontrado));
        }
        setCarregando(false);
      });
    }
  }, [modoEdicao, id]);

  function alterarCampo(evento: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setItem((anterior: any) => ({
      ...anterior,
      [evento.target.name]: evento.target.value
    }));
  }

  function alterarBonus(atributo: string, valor: number) {
    setItem((anterior: any) => ({
      ...anterior,
      bonus: {
        ...anterior.bonus,
        [atributo]: valor
      }
    }));
  }

  function carregarImagem(evento: ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = () => {
      setItem((anterior: any) => ({
        ...anterior,
        imagem: String(leitor.result || "/imagens/itens/padrao.png")
      }));
    };
    leitor.readAsDataURL(arquivo);
  }

  async function salvar() {
    try {
      if (modoEdicao && id) {
        await editarItem(id, item);
      } else {
        await salvarItem(item);
      }
      router.push("/itens");
    } catch (error) {
      console.error("Erro ao salvar item:", error);
    }
  }

  if (carregando) return <div>Forjando item...</div>;

  return (
    <div className="formulario">
      <h2 className="formularioTitulo">
        {modoEdicao ? "✦ Editar Item ✦" : "✦ Criar Item ✦"}
      </h2>

      <label>Nome</label>
      <input name="nome" value={item.nome} onChange={alterarCampo} />

      <label>Descrição</label>
      <textarea name="descricao" value={item.descricao} onChange={alterarCampo} />

      <label>Tipo</label>
      <select name="subtipo" value={item.subtipo} onChange={alterarCampo}>
        <option>Arma</option>
        <option>Armadura</option>
        <option>Acessório</option>
        <option>Munição</option>
        <option>Consumível</option>
      </select>

      <label>Nível mínimo</label>
      <input name="nivelMinimo" type="number" value={item.nivelMinimo} onChange={alterarCampo} />

      <label>Bônus do Item</label>
      <div className="bonusGrid">
        {Object.keys(item.bonus || {}).map((atributo) => (
          <div key={atributo}>
            <label>{atributo}</label>
            <input
              type="number"
              value={(item.bonus as any)[atributo]}
              onChange={(e) => alterarBonus(atributo, Number(e.target.value))}
            />
          </div>
        ))}
      </div>

      <label>Imagem</label>
      <input type="file" accept="image/*" onChange={carregarImagem} />

      <div className="previewImagem">
        <Image src={item.imagem || "/imagens/itens/padrao.png"} alt="Preview item" width={180} height={180} />
      </div>

      <button className="botaoSalvar" onClick={salvar}>
        {modoEdicao ? "💾 Salvar Alterações" : "💾 Salvar Item"}
      </button>
    </div>
  );
}
