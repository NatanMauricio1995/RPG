export type Rarity = "Comum" | "Incomum" | "Raro" | "Épico" | "Lendário";

export type ItemSlot = 
  | "armaPrincipal" 
  | "armaSecundaria" 
  | "capacete" 
  | "peitoral" 
  | "luvas" 
  | "botas" 
  | "acessorio1" 
  | "acessorio2" 
  | "itemEspecial";

export interface ItemBonus {
  ataque?: number;
  defesa?: number;
  vida?: number;
  mana?: number;
  velocidade?: number;
  forca?: number;
  destreza?: number;
  constituicao?: number;
  inteligencia?: number;
  sabedoria?: number;
  carisma?: number;
}

export interface Efeito {
  tipo: string;
  valor: number;
  duracao: number;
}

export interface Item {
  id: string | number;
  nome: string;
  descricao?: string;
  tipo: "Equipamento" | "Consumível" | "Diversos";
  subtipo: string;
  raridade: Rarity;
  imagem: string;
  slotCompativel?: ItemSlot[];
  bonus?: ItemBonus;
  efeitos?: Efeito[];
  quantidade?: number;
  preco?: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface Personagem {
  id: string | number;
  uid: string; // Firebase User ID
  nome: string;
  imagem: string;
  racaId: number | string;
  classeId: number | string;
  nivel: number;
  xpAtual: number;
  xpNecessario: number;
  vidaAtual: number;
  vidaMaxima: number;
  manaAtual: number;
  manaMaxima: number;
  ouro: number;
  inventario: (string | number)[];
  equipados: Record<ItemSlot, string | number | null>;
  atributosBase: Record<string, number>;
  createdAt?: any;
  updatedAt?: any;
}

export interface NPC {
  id: string | number;
  nome: string;
  imagem: string;
  profissao: string;
  alinhamento: string;
  personalidade: string;
  relacionamento: number;
  dialogos: string[];
  inventario: (string | number)[];
  createdAt?: any;
  updatedAt?: any;
}

export interface Missao {
  id: string | number;
  nome: string;
  descricao: string;
  objetivo: string;
  recompensa: string;
  status: "Não iniciada" | "Em andamento" | "Concluída" | "Falhou";
  createdAt?: any;
  updatedAt?: any;
}

export interface Area {
  id: string | number;
  nome: string;
  descricao: string;
  tipo: string;
  imagem?: string;
  mapa?: string;
  observacoes?: string;
  createdAt?: any;
  updatedAt?: any;
}
