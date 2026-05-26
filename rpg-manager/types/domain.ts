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
  cabeca: string | null;
  arma: string | null;
  escudo: string | null;
  armadura: string | null;
  cintura: string | null;
  acessorio: string | null;
  bolsa: string | null;
  municao?: string | null;
};

export type Personagem = {
  id: number;
  nome: string;
  imagem: string;
  racaId: number;
  classeId: number;
  nivel: number;
  xpAtual: number;
  xpNecessario: number;
  vidaAtual: number;
  vidaMaxima?: number;
  ouro: number;
  inventario: InventarioItem[];
  equipados: Equipados;
  atributosBase: Atributos;
};

export type InventarioItem = {
  itemId: string;
  quantidade: number;
  equipado: boolean;
};

export type PersonagemCompleto = Personagem & {
  classe: string;
  raca: string;
  classeDados: Classe;
  racaDados: Raca;
  dadosNivel: Nivel;
  atributos: Atributos;
  manaMaxima?: number;
};

// ==================================
// SISTEMA (Classes, Raças, Níveis)
// ==================================

export type Classe = {
  id: number;
  nome: string;
  vidaBase: number;
  manaBase?: number;
  habilidades?: string[];
};

export type Raca = {
  id: number;
  nome: string;
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
  };
};

// ==================================
// ITENS
// ==================================

export type SlotEquipamento = 
  | "cabeca" 
  | "arma" 
  | "escudo" 
  | "armadura" 
  | "cintura" 
  | "acessorio" 
  | "bolsa" 
  | "municao"
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
  tipo: "Equipamento" | "Consumível" | "Diversos";
  subtipo: string;
  slot: SlotEquipamento;
  imagem?: string;
  preco?: number;
  peso?: number;
  raridade: "Comum" | "Incomum" | "Raro" | "Épico" | "Lendário" | "Único";
  nivel?: number;
  bonus?: BonusEquipados;
  efeitos?: EfeitoItem[];
  requisitos?: Partial<Atributos> & { nivel?: number };
  // Propriedades de equipamento
  defesa?: number;
  ataque?: number;
  dano?: string;
  // Propriedades de consumível
  cura?: number;
  mana?: number;
};

// ==================================
// MONSTRO
// ==================================

export type Monstro = {
  id: number;
  nome: string;
  tipoId: number;
  tipo?: string;
  nivel: number;
  vida: number;
  ataque: number;
  defesa: number;
  velocidade: number;
  experiencia?: number;
  drop?: {
    ouro?: number;
    itens?: number[];
  };
  habilidades?: string[];
  descricao?: string;
  imagem?: string;
};

// ==================================
// NPC
// ==================================

export type NPC = {
  id: number;
  nome: string;
  funcao: string;
  localizacao?: string;
  dialogo?: string;
  imagem?: string;
  missaoId?: number;
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

export type HabilidadeCombate = {
  id: string;
  nome: string;
  descricao: string;
  custoMana: number;
  dano: string;
  cooldown: number;
  cooldownRestante: number;
  alcance: number;
  tipo: string;
  area: number;
  efeitos: EfeitoAtivo[];
};

export type Combatente = {
  id: string;
  origemId: number;
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
  atributos: Record<string, number>;
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

export type Missao = {
  id: number;
  nome: string;
  descricao: string;
  dificuldade: "fácil" | "médio" | "difícil" | "lendário";
  recompensa?: {
    ouro?: number;
    experiencia?: number;
    itens?: number[];
  };
  npcs?: number[];
  area?: string;
  status?: "disponível" | "ativa" | "concluída" | "falhou";
};

export type Area = {
  id: number;
  nome: string;
  descricao: string;
  tipo: "cidade" | "masmorra" | "floresta" | "montanha" | "caverna" | "outro";
  nivelMinimo?: number;
  encontros?: number[];
  boss?: number;
};
