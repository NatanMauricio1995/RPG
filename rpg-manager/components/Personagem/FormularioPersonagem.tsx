"use client";

import {useState, useEffect} from "react";
import {useParams, useRouter} from "next/navigation";
import Image from "next/image";

import {enviarImagem} from "../../services/uploadImagem";

import { 
  salvarPersonagem, 
  buscarPersonagem,
  atualizarPersonagem,
  listarClasses,
  listarRacas,
  criarModeloPersonagem,
  normalizarPersonagem
} from "../../services/personagemService";

import {listarHabilidades} from "../../services/habilidadeService";

type Props = {
  modoEdicao?: boolean;
};

export default function FormularioPersonagem({ modoEdicao = false }: Props) {
  const router = useRouter();
  const params = useParams();
  const id = params?.id ? String(params.id) : null;

  const [classes, setClasses] = useState<any[]>([]);
  const [racas, setRacas] = useState<any[]>([]);
  const [habilidadesDisponiveis, setHabilidadesDisponiveis] = useState<any[]>([]);
  const [personagem, setPersonagem] = useState<any>(criarModeloPersonagem());
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      const classesFirebase = await listarClasses();
      const racasFirebase = await listarRacas();
      const { habilidades: habilidadesFirebase } = await listarHabilidades();

      setClasses(classesFirebase.classes || []);
      setRacas(racasFirebase.racas || []);
      setHabilidadesDisponiveis(habilidadesFirebase || []);

      if (modoEdicao && id) {
        const encontrado = await buscarPersonagem(id);
        if (encontrado) {
          setPersonagem(normalizarPersonagem(encontrado));
        }
      }
      setCarregando(false);
    }
    carregarDados();
  }, [modoEdicao, id]);

  const nomesAtributos = {
    forca: "Força",
    destreza: "Destreza",
    constituicao: "Constituição",
    inteligencia: "Inteligência",
    sabedoria: "Sabedoria",
    carisma: "Carisma"
  };

  function alterarCampo(evento: any) {
    const campo = evento.target.name;
    const valor = evento.target.type === "number" ? Number(evento.target.value) : evento.target.value;

    setPersonagem((anterior: any) => ({
      ...anterior,
      [campo]: valor
    }));
  }

  function alterarAtributo(atributo: string, valor: number) {
    setPersonagem((anterior: any) => ({
      ...anterior,
      atributosBase: {
        ...anterior.atributosBase,
        [atributo]: valor
      }
    }));
  }

  async function carregarImagem(evento: any) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;
    try {
      const url = await enviarImagem(arquivo, "personagens");
      setPersonagem((anterior: any) => ({ ...anterior, imagem: url }));
    } catch (erro) {
      console.error(erro);
    }
  }

  async function salvar() {
    try {
      if (modoEdicao && id) {
        await atualizarPersonagem(id, personagem);
      } else {
        await salvarPersonagem(personagem);
      }
      router.push("/personagens");
    } catch (error) {
      console.error("Erro ao salvar personagem:", error);
    }
  }

  if (carregando) return <div className="carregando">Convocando aventureiro...</div>;

  return (
    <div className="formularioPersonagem">
      <h2 className="formularioTitulo">
        {modoEdicao ? "✦ Editar Personagem ✦" : "✦ Criar Personagem ✦"}
      </h2>

      <div className="formularioPersonagemGrid">
        <div>
          <label>Nome</label>
          <input name="nome" value={personagem.nome} onChange={alterarCampo} />
        </div>

        <div>
          <label>Raça</label>
          <select name="racaId" value={personagem.racaId} onChange={alterarCampo}>
            {racas.map((raca: any) => (
              <option key={raca.id} value={raca.id}>{raca.nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Classe</label>
          <select name="classeId" value={personagem.classeId} onChange={alterarCampo}>
            {classes.map((classe: any) => (
              <option key={classe.id} value={classe.id}>{classe.nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Nível</label>
          <input type="number" name="nivel" min={1} value={personagem.nivel} onChange={alterarCampo} />
        </div>

        <div>
          <label>XP Atual</label>
          <input type="number" name="xpAtual" value={personagem.xpAtual} onChange={alterarCampo} />
        </div>

        <div>
          <label>Ouro</label>
          <input type="number" name="ouro" value={personagem.ouro} onChange={alterarCampo} />
        </div>
      </div>

      <label>Imagem</label>
      <input type="file" accept="image/*" onChange={carregarImagem} />

      <div className="previewImagemPersonagem">
        <Image src={personagem.imagem || "/imagens/personagens/padrao.png"} alt="Preview" width={220} height={220} />
      </div>

      <div className="atributosFormularioPersonagem">
        {Object.keys(personagem.atributosBase).map((atributo) => (
          <div key={atributo}>
            <label>{(nomesAtributos as any)[atributo]}</label>
            <input
              type="number"
              value={personagem.atributosBase[atributo]}
              onChange={(e) => alterarAtributo(atributo, Number(e.target.value))}
            />
          </div>
        ))}
      </div>

      <button className="botaoSalvarPersonagem" onClick={salvar}>
        {modoEdicao ? "💾 Salvar Alterações" : "💾 Salvar Personagem"}
      </button>
    </div>
  );
}
