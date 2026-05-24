import { 
  createDocument, 
  listDocuments, 
  getDocument, 
  updateDocument, 
  deleteDocument 
} from "../firebase/firestore";
import { Personagem, ItemSlot } from "../types";
import { where } from "firebase/firestore";

export async function criarPersonagem(personagem: Partial<Personagem>) {
  return await createDocument("personagens", personagem);
}

export async function listarPersonagens(uid: string) {
  return await listDocuments("personagens", [where("uid", "==", uid)]) as Personagem[];
}

export async function buscarPersonagem(id: string) {
  return await getDocument("personagens", id) as Personagem;
}

export async function atualizarPersonagem(id: string, data: Partial<Personagem>) {
  await updateDocument("personagens", id, data);
}

export async function excluirPersonagem(id: string) {
  await deleteDocument("personagens", id);
}

export const equipamentosPadrao: Record<ItemSlot, null> = {
  armaPrincipal: null,
  armaSecundaria: null,
  capacete: null,
  peitoral: null,
  luvas: null,
  botas: null,
  acessorio1: null,
  acessorio2: null,
  itemEspecial: null
};

export function normalizarPersonagem(personagem: any): Personagem {
  return {
    ...personagem,
    id: personagem.id,
    uid: personagem.uid,
    nome: personagem.nome || "",
    imagem: personagem.imagem || "",
    nivel: personagem.nivel || 1,
    inventario: personagem.inventario || [],
    equipados: {
      ...equipamentosPadrao,
      ...(personagem.equipados || {})
    },
    atributosBase: {
      forca: 10,
      destreza: 10,
      constituicao: 10,
      inteligencia: 10,
      sabedoria: 10,
      carisma: 10,
      ...(personagem.atributosBase || {})
    }
  };
}

export async function completarPersonagem(personagem: any) {
  const personagemBase = normalizarPersonagem(personagem);

  const classes = await listDocuments("classes") as any[];
  const racas = await listDocuments("racas") as any[];
  const niveis = await listDocuments("niveis") as any[];

  const classe = classes.find(item => item.id === personagemBase.classeId || item.nome === personagemBase.classeId);
  const raca = racas.find(item => item.id === personagemBase.racaId || item.nome === personagemBase.racaId);
  const dadosNivel = niveis.find(item => item.nivel === personagemBase.nivel);

  const atributosComBonus = {
    forca: (personagemBase.atributosBase.forca || 10) + (raca?.bonus?.forca || 0),
    destreza: (personagemBase.atributosBase.destreza || 10) + (raca?.bonus?.destreza || 0),
    constituicao: (personagemBase.atributosBase.constituicao || 10) + (raca?.bonus?.constituicao || 0),
    inteligencia: (personagemBase.atributosBase.inteligencia || 10) + (raca?.bonus?.inteligencia || 0),
    sabedoria: (personagemBase.atributosBase.sabedoria || 10) + (raca?.bonus?.sabedoria || 0),
    carisma: (personagemBase.atributosBase.carisma || 10) + (raca?.bonus?.carisma || 0)
  };

  // Aqui você pode adicionar lógica de cálculo de vida baseada na classe se necessário
  
  return {
    ...personagemBase,
    classe: classe?.nome || "Sem Classe",
    raca: raca?.nome || "Sem Raça",
    classeDados: classe,
    racaDados: raca,
    dadosNivel,
    atributos: atributosComBonus,
  };
}
