"use client";

// ==================================
// TIPOS BASE / ATRIBUTOS
// ==================================

export type Atributos = {
  forca: number;
  destreza: number;
  constituicao: number;
  inteligencia: number;
  sabedoria: number;
  carisma: number;
};

export type BonusEquipados = Record<string, number>;

// ==================================
// PERSONAGEM
// ==================================

export type Equipados = {
  arma: string | null;
  armaSecundaria: string | null;
  escudo: string | null;
  armadura: string | null;
  capacete: string | null;
  luvas: string | null;
  botas: string | null;
  anel1: string | null;
  anel2: string | null;
  colar: string | null;
  acessorio: string | null;
  bolsa: string | null;
};

export type InventarioItem = {
  itemId: string;
  quantidade: number;
  equipado: boolean;
};

export type Personagem = {
  id: string | number;
  userId?: string;
  nome: string;
  imagem: string;
  racaId: number | string;
  classeId: number | string;
  nivel: number;
  xpAtual: number;
  xpNecessario: number;
  vidaAtual: number;
  vidaMaxima?: number;
  manaAtual: number;
  manaMaxima?: number;
  ouro: number;
  inventario: InventarioItem[];
  equipados: Equipados;
  atributosBase: Atributos;
  efeitosAtivos?: EfeitoAtivo[];
  habilidadesIds?: string[]; // IDs das habilidades adquiridas
  capacidadeMaxima?: number;
};

export type PersonagemCompleto = Personagem & {
  classe: string;
  raca: string;
  classeDados: Classe;
  racaDados: Raca;
  dadosNivel: Nivel;
  atributos: Atributos;
  vidaMaxima: number;
  manaMaxima: number;
  armadura: number;
  velocidade: number;
  critico: number;
  ataque: number;
  bonus: any;
  habilidades: Habilidade[];
};

// ==================================
// SISTEMA (Classes, Raças, Níveis)
// ==================================

export type Classe = {
  id: number | string;
  nome: string;
  descricao?: string;
  imagem?: string;
  vidaBase: number;
  manaBase?: number;
  habilidades?: string[]; // IDs de habilidades padrão da classe
  bonus?: Partial<Atributos>;
};

export type Raca = {
  id: number | string;
  nome: string;
  descricao?: string;
  imagem?: string;
  bonus?: Partial<Atributos>;
};

export type Nivel = {
  nivel: number;
  xpNecessaria: number;
  bonus?: {
    forca?: number;
    destreza?: number;
    constituicao?: number;
    inteligencia?: number;
    sabedoria?: number;
    carisma?: number;
    vida?: number;
    mana?: number;
  };
};

// ==================================
// HABILIDADES
// ==================================

export type Habilidade = {
  id: string;
  nome: string;
  descricao: string;
  imagem?: string;
  tipo: "Físico" | "Mágico" | "Especial" | "Passiva";
  categoria: "Ataque" | "Defesa" | "Suporte" | "Utilitário";
  dano?: string;
  cura?: string;
  custoMana: number;
  cooldown: number;
  alcance: number;
  area: number;
  efeitos: EfeitoAtivo[];
  nivelMin: number;
  castTime: string;
  passiva: boolean;
};

// ==================================
// ITENS
// ==================================

export type SlotEquipamento = 
  | "arma" 
  | "armaSecundaria" 
  | "escudo" 
  | "armadura" 
  | "capacete" 
  | "luvas" 
  | "botas" 
  | "anel1" 
  | "anel2" 
  | "colar" 
  | "acessorio" 
  | "bolsa"
  | "";

export type EfeitoItem = {
  tipo: string;
  valor: number;
  duracao: number;
};

export type Item = {
  id: string;
  nome: string;
  descricao?: string;
  imagem?: string;
  tipo: "Equipamento" | "Consumível" | "Diversos";
  subtipo: string;
  slot: SlotEquipamento;
  raridade: "Comum" | "Incomum" | "Raro" | "Épico" | "Lendário" | "Único";
  peso: number;
  preco: number;
  nivelMinimo?: number;
  requisitos?: Partial<Atributos> & { nivel?: number; racaId?: number; classeId?: number };
  efeitos?: EfeitoItem[];
  bonus?: BonusEquipados;
  attrsMods?: Partial<Atributos>;
  durabilidade?: number;
  defesa?: number;
  ataque?: number;
  dano?: string;
  cura?: number;
  mana?: number;
};

// ==================================
// MONSTRO
// ==================================

export type Monstro = {
  id: number | string;
  nome: string;
  tipoId: number | string;
  tipo?: string;
  nivel: number;
  vida: number;
  ataque: number;
  defesa: number;
  velocidade: number;
  experiencia?: number;
  drop?: {
    ouro?: number;
    itens?: string[];
  };
  habilidades?: string[];
  descricao?: string;
  imagem?: string;
};

// ==================================
// NPC
// ==================================

export type Faccao = "Aliado" | "Neutro" | "Inimigo" | "Mercador";

export type Dialogo = {
  id: string;
  texto: string;
  opcoes?: { texto: string; proximoId?: string; missaoId?: string }[];
};

export type NPC = {
  id: string;
  nome: string;
  imagem?: string;
  descricao: string;
  faccao: Faccao;
  funcao: string;
  localizacao?: string;
  relacionamento?: number; // 0-100
  loja?: string[]; // IDs de itens que vende
  dialogos?: Dialogo[];
  missoes?: string[]; // IDs de missões que oferece
};

// ==================================
// COMBATE
// ==================================

export type LadoCombate = "aliado" | "inimigo";
export type StatusCombate = "preparacao" | "em_andamento" | "vitoria" | "derrota";

export type EfeitoAtivo = {
  tipo: string;
  valor: number;
  duracao: number;
  origem?: string;
};

export type HabilidadeCombate = Habilidade & {
  cooldownRestante: number;
};

export type Combatente = {
  id: string;
  origemId: string | number;
  lado: LadoCombate;
  nome: string;
  imagem: string;
  nivel: number;
  vidaAtual: number;
  vidaMaxima: number;
  manaAtual: number;
  manaMaxima: number;
  armadura: number;
  ataque: number;
  danoBase: string;
  critico: number;
  esquiva: number;
  velocidade: number;
  atributos: Atributos;
  efeitos: EfeitoAtivo[];
  habilidades: HabilidadeCombate[];
  cooldowns: Record<string, number>;
  vivo: boolean;
  escudo: number;
  quantidade: number;
  vidaUnitaria: number;
  equipamentos?: Equipados;
};

export type TipoLogCombate = "sistema" | "ataque" | "habilidade" | "efeito" | "morte";

export type EntradaLog = {
  id: number;
  turno: number;
  texto: string;
  tipo: TipoLogCombate;
};

export type EstadoCombate = {
  status: StatusCombate;
  turno: number;
  combatenteAtivoId: string;
  combatentes: Combatente[];
  log: EntradaLog[];
};

export type HistoricoCombate = {
  id: string | number;
  data: string;
  participantes: { nome: string; lado: string }[];
  vencedor: string;
  derrotados: string[];
  log: EntradaLog[];
  recompensas?: {
    xp: number;
    ouro: number;
    itens: string[];
  };
};

// ==================================
// CALENDÁRIO / CLIMA
// ==================================

export type DiaCalendario = {
  dia: number;
  mes: string;
  ano: number;
  estacao?: string;
  clima?: string;
  eventos?: string[];
};

export type RegistroClima = {
  dia: number;
  mes: string;
  ano: number;
  clima: string;
  temperatura?: number;
  umidade?: number;
};

// ==================================
// MISSÕES / ÁREAS
// ==================================

export type ObjetivoMissao = {
  descricao: string;
  tipo: "matar" | "coletar" | "falar" | "explorar";
  alvoId?: string;
  quantidadeTotal?: number;
  quantidadeAtual: number;
  concluido: boolean;
};

export type Missao = {
  id: string;
  nome: string;
  descricao: string;
  objetivos: ObjetivoMissao[];
  recompensas: {
    ouro?: number;
    xp?: number;
    itens?: string[];
  };
  npcId: string;
  status: "disponível" | "ativa" | "concluída" | "falhou";
  nivelRecomendado: number;
};

export type Area = {
  id: string;
  nome: string;
  descricao: string;
  npcs: string[]; // IDs de NPCs na área
  monstros: string[]; // IDs de monstros que podem aparecer
  eventos?: string[];
  missoes: string[]; // IDs de missões relacionadas
  mapa?: string; // URL da imagem do mapa
};
