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

export type Faccao = string;

export type RespostaDialogo = {
  condicao?: string; // Ex: "reputacao > 50"
  texto: string;
};

export type DialogoNPC = {
  saudacao: string;
  respostas: RespostaDialogo[];
};

export type LojaNPC = {
  itensIds: string[];
  desconto?: number; // 0 a 1 (Ex: 0.1 = 10% de desconto)
};

export type NPC = {
  id: string;
  nome: string;
  imagem?: string;
  descricao: string;
  faccao: Faccao;
  funcao: string;
  localizacao?: string;
  reputacao: Record<string, number>; // personagemId -> valor -100 a 100
  missoes: string[]; // IDs de missões que este NPC oferece
  loja?: LojaNPC;
  dialogo?: DialogoNPC;
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
  id?: string | number;
  data: string;
  participantes: string[];
  vencedor: string;
  derrotados: string[];
  xpDistribuido: { personagemId: string; valor: number }[];
  ouroDistribuido: { personagemId: string; valor: number }[];
  itensConsumidos: { personagemId: string; itemId: string; quantidade: number }[];
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

export type StatusMissao = "disponivel" | "em_andamento" | "concluida" | "falhou";

export type ObjetivoMissao = {
  descricao: string;
  progresso: number;
  total: number;
  concluido: boolean;
};

export type Missao = {
  id: string;
  nome: string;
  descricao: string;
  status: StatusMissao;
  objetivos: ObjetivoMissao[];
  recompensas: {
    xp: number;
    ouro: number;
    itens: string[]; // IDs dos itens
  };
  npcId: string;
  nivelRecomendado?: number;
};

export type EventoArea = {
  nome: string;
  probabilidade: number; // 0 a 100
  descricao: string;
};

export type ClimaArea = 'ensolarado' | 'nublado' | 'chuva' | 'tempestade' | 'neve';

export type Area = {
  id: string;
  nome: string;
  descricao: string;
  npcsIds: string[];
  monstrosIds: string[];
  missoesIds: string[];
  eventos: EventoArea[];
  clima: ClimaArea;
  mapa?: string;
};
