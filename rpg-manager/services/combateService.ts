"use client";

import monstrosData from "../data/sistema/monstros.json";
import tiposMonstros from "../data/sistema/tiposMonstros.json";
import habilidadesData from "../data/sistema/habilidades.json";
import habilidadesMonstrosData from "../data/sistema/habilidadesMonstros.json";
import {calcularBonusProficiencia,calcularModificador} from "./calculoService";
import {calcularStatusDerivados,normalizarTipoEfeito,EfeitoAtivo} from "./efeitosService";
import {buscarItem,resolverEquipados} from "./itemService";

export type LadoCombate="aliado"|"inimigo";
export type StatusCombate="preparacao"|"em_andamento"|"vitoria"|"derrota";

export type HabilidadeCombate={
id:string;
nome:string;
descricao:string;
custoMana:number;
dano:string;
cooldown:number;
cooldownRestante:number;
alcance:number;
tipo:string;
area:number;
efeitos:EfeitoAtivo[];
};

export type Combatente={
id:string;
origemId:number;
lado:LadoCombate;
nome:string;
imagem:string;
nivel:number;
vidaAtual:number;
vidaMaxima:number;
manaAtual:number;
manaMaxima:number;
armadura:number;
ataque:number;
danoBase:string;
critico:number;
esquiva:number;
velocidade:number;
atributos:Record<string,number>;
efeitos:EfeitoAtivo[];
habilidades:HabilidadeCombate[];
cooldowns:Record<string,number>;
vivo:boolean;
escudo:number;
quantidade:number;
vidaUnitaria:number;
equipamentos?:any;
};

export type EntradaLog={
id:number;
turno:number;
texto:string;
tipo:"sistema"|"ataque"|"habilidade"|"efeito"|"morte";
};

export type EstadoCombate={
status:StatusCombate;
turno:number;
combatenteAtivoId:string;
combatentes:Combatente[];
log:EntradaLog[];
};

export function listarMonstrosCombate(){

const personalizados=
typeof window==="undefined"
? []
: JSON.parse(localStorage.getItem("monstrosPersonalizados") || "[]");

const padrao=(monstrosData as any[]).map((monstro:any)=>{
const tipo=(tiposMonstros as any[]).find((item:any)=>item.id===monstro.tipoId);

return{
...monstro,
tipo:tipo?.nome || "Criatura",
padrao:true
};
});

return[
...padrao,
...personalizados.map((monstro:any)=>({
...monstro,
padrao:false
}))
];

}

export function iniciarCombate(
personagens:any[],
monstros:any[]
):EstadoCombate{

const aliados=personagens.map((personagem,index)=>
criarCombatentePersonagem(personagem,index)
);

const inimigos=monstros.map((monstro,index)=>
criarCombatenteMonstro(monstro,index)
);

const combatentes=[...aliados,...inimigos];

const log=[
criarLog(
1,
0,
`Combate iniciado. O mestre escolhe manualmente quem age a cada ação.`,
"sistema"
)
];

return verificarResultado({
status:"em_andamento",
turno:1,
combatenteAtivoId:"",
combatentes,
log
});

}

export function executarAtaqueBasico(
estado:EstadoCombate,
atacanteId:string,
alvoId:string
):EstadoCombate{

const atacante=buscarCombatente(estado,atacanteId);
const alvo=buscarCombatente(estado,alvoId);

if(!atacante || !alvo || !atacante.vivo || !alvo.vivo)
return estado;

const controle=resolverControleTurno(atacante);

if(controle.bloqueado){
return finalizarAcao(
adicionarLog(estado,controle.texto,"efeito"),
atacante.id
);
}

const rolagemAtaque=rolarDado(20);
const defesa=alvo.armadura;
const esquiva=rolarDado(100)<=alvo.esquiva;
const critico=rolagemAtaque===20 || rolarDado(100)<=atacante.critico;
const acertou=rolagemAtaque!==1 && !esquiva && rolagemAtaque+atacante.ataque>=defesa;

let texto=`${atacante.nome} atacou ${alvo.nome}: d20 ${rolagemAtaque}+${atacante.ataque} contra defesa ${defesa}.`;
let novoEstado=estado;

if(!acertou){
texto+=esquiva ? ` ${alvo.nome} esquivou.` : " O golpe falhou.";
novoEstado=adicionarLog(novoEstado,texto,"ataque");
return finalizarAcao(novoEstado,atacante.id);
}

const danoRolado=rolarExpressao(atacante.danoBase);
const dano=Math.max(1,danoRolado.total + Math.max(0,calcularModificador(atacante.atributos.forca)));
const danoFinal=critico ? dano*2 : dano;

texto+=` Acerto${critico ? " crítico" : ""}: ${atacante.danoBase}=${danoRolado.total}, dano final ${danoFinal}.`;

novoEstado=alterarVida(novoEstado,alvo.id,-danoFinal);
novoEstado=adicionarLog(novoEstado,texto,"ataque");

return finalizarAcao(novoEstado,atacante.id);

}

export function executarHabilidade(
estado:EstadoCombate,
atacanteId:string,
alvoId:string,
habilidadeId:string
):EstadoCombate{

const atacante=buscarCombatente(estado,atacanteId);
const alvo=buscarCombatente(estado,alvoId);
const habilidade=atacante?.habilidades.find((item)=>item.id===habilidadeId);

if(!atacante || !alvo || !habilidade || !atacante.vivo || !alvo.vivo)
return estado;

const controle=resolverControleTurno(atacante);

if(controle.bloqueado){
return finalizarAcao(
adicionarLog(estado,controle.texto,"efeito"),
atacante.id
);
}

if(atacante.manaAtual<habilidade.custoMana){
return adicionarLog(
estado,
`${atacante.nome} tentou usar ${habilidade.nome}, mas não tinha mana suficiente.`,
"sistema"
);
}

if((atacante.cooldowns[habilidade.id] || 0)>0){
return adicionarLog(
estado,
`${habilidade.nome} ainda está em recarga por ${atacante.cooldowns[habilidade.id]} turno(s).`,
"sistema"
);
}

let novoEstado=alterarMana(estado,atacante.id,-habilidade.custoMana);
const alvos=selecionarAlvos(novoEstado,alvo,habilidade.area);
const rolagemAtaque=rolarDado(20);
const danoRolado=rolarExpressao(habilidade.dano);
const critico=rolagemAtaque===20 || rolarDado(100)<=atacante.critico;
const modificador=Math.max(0,calcularModificador(atacante.atributos.inteligencia || atacante.atributos.forca));
const danoBase=Math.max(0,danoRolado.total + modificador);
const danoFinal=critico ? danoBase*2 : danoBase;

alvos.forEach((combatente)=>{
if(danoFinal>0){
novoEstado=alterarVida(novoEstado,combatente.id,-danoFinal);
}

habilidade.efeitos.forEach((efeito)=>{
novoEstado=aplicarEfeito(novoEstado,combatente.id,efeito,habilidade.nome);
});
});

novoEstado=atualizarCombatente(novoEstado,atacante.id,(combatente)=>({
...combatente,
cooldowns:{
...combatente.cooldowns,
[habilidade.id]:habilidade.cooldown
}
}));

novoEstado=adicionarLog(
novoEstado,
`${atacante.nome} usou ${habilidade.nome} em ${alvos.map((item)=>item.nome).join(", ")}. Mana -${habilidade.custoMana}. ${habilidade.dano}=${danoRolado.total}${critico ? ", crítico" : ""}, dano ${danoFinal}.`,
"habilidade"
);

return finalizarAcao(novoEstado,atacante.id);

}

export function passarTurno(
estado:EstadoCombate,
combatenteId:string
){

return finalizarAcao(
adicionarLog(estado,`${buscarCombatente(estado,combatenteId)?.nome} aguardou o momento certo.`,"sistema"),
combatenteId
);

}

export function combatenteEstaControlado(
combatente:Combatente
){

return combatente.efeitos.some((efeito)=>{
const tipo=normalizarTipoEfeito(efeito.tipo);
return tipo==="paralisia" || tipo==="medo";
});

}

function criarCombatentePersonagem(
personagem:any,
index:number
):Combatente{

const status=calcularStatusDerivados(personagem);
const equipamentos=resolverEquipados(personagem.equipados);
const arma=buscarItem(equipamentos.arma);
const nivel=Number(personagem.nivel || 1);

const habilidadesBase=criarHabilidadesPersonagem(personagem);

return{
id:`aliado-${personagem.id}-${index}`,
origemId:Number(personagem.id),
lado:"aliado",
nome:personagem.nome || "Personagem",
imagem:personagem.imagem || "/imagens/racas/padrao.png",
nivel,
vidaAtual:Math.min(Number(personagem.vidaAtual || status.vidaMaxima),status.vidaMaxima),
vidaMaxima:status.vidaMaxima,
vidaUnitaria:status.vidaMaxima,
manaAtual:status.manaMaxima,
manaMaxima:status.manaMaxima,
armadura:status.armadura,
ataque:calcularBonusProficiencia(nivel)+calcularModificador(status.atributos.forca),
danoBase:arma?.dano || "1d6",
critico:status.critico,
esquiva:Math.max(0,calcularModificador(status.atributos.destreza)*4),
velocidade:status.velocidade,
atributos:status.atributos,
efeitos:status.efeitosEquipados
.filter((efeito:any)=>["veneno","sangramento","paralisia","medo"].includes(normalizarTipoEfeito(efeito.tipo)))
.map((efeito:any)=>({
...efeito,
tipo:normalizarTipoEfeito(efeito.tipo)
})),
habilidades:habilidadesBase,
cooldowns:{},
vivo:true,
escudo:status.escudo,
quantidade:1,
equipamentos
};

}

function criarCombatenteMonstro(
monstro:any,
index:number | string
):Combatente{

const atributos={
forca:Number(monstro.atributos?.forca || 10),
destreza:Number(monstro.atributos?.destreza || 10),
constituicao:Number(monstro.atributos?.constituicao || 10),
inteligencia:Number(monstro.atributos?.inteligencia || 10),
sabedoria:Number(monstro.atributos?.sabedoria || 10),
carisma:Number(monstro.atributos?.carisma || 10)
};

const nivel=Number(monstro.nivel || 1);
const vida=Number(monstro.vida || 10);
const mana=Number(monstro.mana || 0);
const defesa=Number(monstro.defesa || monstro.armadura || 10+calcularModificador(atributos.destreza));

return{
id:`inimigo-${monstro.id}-${index}-${Math.random().toString(36).substr(2, 9)}`,
origemId:Number(monstro.id),
lado:"inimigo",
nome:monstro.nome || "Criatura",
imagem:monstro.imagem || "/imagens/monstros/goblin.png",
nivel,
vidaAtual:vida,
vidaMaxima:vida,
vidaUnitaria:vida,
manaAtual:mana,
manaMaxima:mana,
armadura:defesa,
ataque:calcularBonusProficiencia(nivel)+calcularModificador(atributos.forca),
danoBase:monstro.dano || "1d6",
critico:5,
esquiva:Math.max(0,calcularModificador(atributos.destreza)*3),
velocidade:calcularModificador(atributos.destreza)+Number(monstro.deslocamento || 0)/3,
atributos,
efeitos:[],
habilidades:criarHabilidadesMonstro(monstro),
cooldowns:{},
vivo:true,
escudo:0,
quantidade:1
};

}

function criarHabilidadesPersonagem(
personagem:any
):HabilidadeCombate[]{

const nivel=Number(personagem.nivel || 1);

return[
{
id:"golpe-poderoso",
nome:"Golpe Poderoso",
descricao:"Ataque concentrado que sacrifica fôlego por dano consistente.",
custoMana:2,
dano:"1d10",
cooldown:1,
cooldownRestante:0,
alcance:1,
tipo:"fisico",
area:1,
efeitos:[]
},
{
id:"centelha-arcana",
nome:"Centelha Arcana",
descricao:"Explosão mágica curta com chance de aplicar sangramento arcano.",
custoMana:4,
dano:nivel>=5 ? "2d8" : "1d8",
cooldown:2,
cooldownRestante:0,
alcance:6,
tipo:"magico",
area:1,
efeitos:[
{
tipo:"sangramento",
valor:2,
duracao:2,
origem:"Centelha Arcana"
}
]
},
...(habilidadesData as any[]).slice(0,2).map((habilidade:any)=>({
id:`talento-${habilidade.id}`,
nome:habilidade.nome,
descricao:habilidade.descricao || "Talento racial adaptado para combate.",
custoMana:1,
dano:"1d4",
cooldown:1,
cooldownRestante:0,
alcance:3,
tipo:"talento",
area:1,
efeitos:[]
}))
];

}

function criarHabilidadesMonstro(
monstro:any
):HabilidadeCombate[]{

const referencias=Array.isArray(monstro.habilidades) ? monstro.habilidades : [];

return referencias.map((referencia:any,index:number)=>{
const habilidade=typeof referencia==="object"
? referencia
: (habilidadesMonstrosData as any[]).find((item:any)=>item.id===referencia);

return{
id:`monstro-${monstro.id}-${index}`,
nome:habilidade?.nome || "Investida",
descricao:habilidade?.descricao || "",
custoMana:Number(habilidade?.custoMana || 0),
dano:habilidade?.dano || monstro.dano || "1d6",
cooldown:Number(habilidade?.cooldown || 1),
cooldownRestante:0,
alcance:Number(habilidade?.alcance || 1),
tipo:habilidade?.tipo || "fisico",
area:Number(habilidade?.area || 1),
efeitos:(habilidade?.efeitos || monstro.efeitos || [])
.map((efeito:any)=>({
tipo:normalizarTipoEfeito(efeito.tipo),
valor:Number(efeito.valor || 1),
duracao:Number(efeito.duracao || 3),
origem:habilidade?.nome || monstro.nome
}))
};
});

}

function finalizarAcao(
estado:EstadoCombate,
combatenteId:string
):EstadoCombate{

let novoEstado=reduzirCooldowns(estado,combatenteId);
novoEstado={
...novoEstado,
turno:novoEstado.turno+1,
combatenteAtivoId:""
};
return verificarResultado(novoEstado);

}

export function selecionarCombatenteAtivo(
estado:EstadoCombate,
combatenteId:string
):EstadoCombate{

const combatente=buscarCombatente(estado,combatenteId);

if(!combatente || !combatente.vivo)
return estado;

return verificarResultado({
...estado,
combatenteAtivoId:combatenteId
});

}

export function removerCombatente(
estado:EstadoCombate,
combatenteId:string
):EstadoCombate{

const combatente=buscarCombatente(estado,combatenteId);

if(!combatente)
return estado;

return verificarResultado(
adicionarLog(
{
...estado,
combatenteAtivoId:estado.combatenteAtivoId===combatenteId ? "" : estado.combatenteAtivoId,
combatentes:estado.combatentes.filter((item)=>item.id!==combatenteId)
},
`${combatente.nome} fugiu do combate.`,
"sistema"
)
);

}

export function alterarQuantidadeMonstro(
estado:EstadoCombate,
combatenteId:string,
delta:number
):EstadoCombate{

const combatente=buscarCombatente(estado,combatenteId);

if(!combatente || combatente.lado!=="inimigo")
return estado;

if(delta>0){
const novo=criarCombatenteMonstro(
{
id:combatente.origemId,
nome:combatente.nome,
imagem:combatente.imagem,
nivel:combatente.nivel,
vida:combatente.vidaUnitaria,
mana:combatente.manaMaxima,
armadura:combatente.armadura,
dano:combatente.danoBase,
atributos:combatente.atributos,
habilidades:combatente.habilidades
},
`extra-${Date.now()}`
);

const index=estado.combatentes.findIndex((item)=>item.id===combatenteId);
const novosCombatentes=[...estado.combatentes];
novosCombatentes.splice(index+1,0,novo);

return adicionarLog(
{
...estado,
combatentes:novosCombatentes
},
`Um novo ${combatente.nome} entrou na batalha!`,
"sistema"
);
}else{
return removerCombatente(estado,combatenteId);
}

}

function aplicarEfeito(
estado:EstadoCombate,
combatenteId:string,
efeito:EfeitoAtivo,
origem:string
):EstadoCombate{

const tipo=normalizarTipoEfeito(efeito.tipo);

if(tipo==="cura")
return alterarVida(estado,combatenteId,Math.max(1,efeito.valor));

if(tipo==="escudo")
return atualizarCombatente(estado,combatenteId,(combatente)=>({
...combatente,
escudo:combatente.escudo+Math.max(1,efeito.valor)
}));

return atualizarCombatente(estado,combatenteId,(combatente)=>({
...combatente,
efeitos:[
...combatente.efeitos,
{
tipo,
valor:Number(efeito.valor || 1),
duracao:Number(efeito.duracao || 3),
origem
}
]
}));

}

function alterarVida(
estado:EstadoCombate,
combatenteId:string,
valor:number
):EstadoCombate{

const antes=buscarCombatente(estado,combatenteId);

const atualizado=atualizarCombatente(estado,combatenteId,(combatente)=>{
let alteracao=valor;
let escudo=combatente.escudo;

if(alteracao<0 && escudo>0){
const absorvido=Math.min(escudo,Math.abs(alteracao));
escudo-=absorvido;
alteracao+=absorvido;
}

const vidaAtual=Math.max(0,Math.min(combatente.vidaMaxima,combatente.vidaAtual+alteracao));
const morreu=vidaAtual<=0 && combatente.vivo;

return{
...combatente,
vidaAtual,
escudo,
vivo:!morreu && vidaAtual>0
};
});

const depois=buscarCombatente(atualizado,combatenteId);

if(antes?.vivo && depois && !depois.vivo){
return adicionarLog(
atualizado,
`${depois.nome} caiu em combate.`,
"morte"
);
}

return atualizado;

}

function alterarMana(
estado:EstadoCombate,
combatenteId:string,
valor:number
):EstadoCombate{

return atualizarCombatente(estado,combatenteId,(combatente)=>({
...combatente,
manaAtual:Math.max(0,Math.min(combatente.manaMaxima,combatente.manaAtual+valor))
}));

}

function reduzirCooldowns(
estado:EstadoCombate,
combatenteId:string
):EstadoCombate{

return atualizarCombatente(estado,combatenteId,(combatente)=>{
const cooldowns:Record<string,number>={};

Object.entries(combatente.cooldowns).forEach(([id,valor])=>{
cooldowns[id]=Math.max(0,Number(valor)-1);
});

return{
...combatente,
cooldowns
};
});

}

function verificarResultado(
estado:EstadoCombate
):EstadoCombate{

const aliadosVivos=estado.combatentes.some((combatente)=>combatente.lado==="aliado" && combatente.vivo);
const inimigosVivos=estado.combatentes.some((combatente)=>combatente.lado==="inimigo" && combatente.vivo);

if(aliadosVivos && inimigosVivos)
return estado;

const status=aliadosVivos ? "vitoria" : "derrota";
const texto=aliadosVivos
? "Vitória dos aliados. Os inimigos foram derrotados."
: "Derrota. O grupo caiu em combate.";

return adicionarLog(
{
...estado,
status
},
texto,
"sistema"
);

}

function selecionarAlvos(
estado:EstadoCombate,
alvo:Combatente,
area:number
){

if(area<=1)
return [alvo];

return estado.combatentes
.filter((combatente)=>combatente.lado===alvo.lado && combatente.vivo)
.slice(0,area);

}

function resolverControleTurno(
combatente:Combatente
){

const paralisia=combatente.efeitos.find((efeito)=>normalizarTipoEfeito(efeito.tipo)==="paralisia");

if(paralisia){
return{
bloqueado:true,
texto:`${combatente.nome} perdeu a ação por paralisia.`
};
}

const medo=combatente.efeitos.find((efeito)=>normalizarTipoEfeito(efeito.tipo)==="medo");

if(medo && rolarDado(100)<=50){
return{
bloqueado:true,
texto:`${combatente.nome} foi dominado pelo medo e não conseguiu agir.`
};
}

return{
bloqueado:false,
texto:""
};

}

export function rolarDado(
lados:number
){

return Math.floor(Math.random()*lados)+1;

}

export function rolarExpressao(
expressao:string
){

const partes=String(expressao || "1d4").toLowerCase().match(/(\d*)d(\d+)([+-]\d+)?/);

if(!partes){
const valor=Number(expressao) || 0;
return{
total:valor,
rolagens:[valor],
modificador:0
};
}

const quantidade=Number(partes[1] || 1);
const lados=Number(partes[2] || 4);
const modificador=Number(partes[3] || 0);
const rolagens=Array.from({length:quantidade},()=>rolarDado(lados));
const total=rolagens.reduce((soma,valor)=>soma+valor,0)+modificador;

return{
total,
rolagens,
modificador
};

}

function atualizarCombatente(
estado:EstadoCombate,
combatenteId:string,
atualizador:(combatente:Combatente)=>Combatente
):EstadoCombate{

return{
...estado,
combatentes:estado.combatentes.map((combatente)=>{
if(combatente.id!==combatenteId)
return combatente;

const atualizado=atualizador(combatente);

if(combatente.vivo && !atualizado.vivo){
return{
...atualizado,
efeitos:[]
};
}

return atualizado;
})
};

}

function buscarCombatente(
estado:EstadoCombate,
combatenteId:string
){

return estado.combatentes.find((combatente)=>combatente.id===combatenteId);

}

function adicionarLog(
estado:EstadoCombate,
texto:string,
tipo:EntradaLog["tipo"]
):EstadoCombate{

return{
...estado,
log:[
criarLog(estado.log.length+1,estado.turno,texto,tipo),
...estado.log
]
};

}

function criarLog(
id:number,
turno:number,
texto:string,
tipo:EntradaLog["tipo"]
):EntradaLog{

return{
id,
turno,
texto,
tipo
};

}
on criarLog(
id:number,
turno:number,
texto:string,
tipo:EntradaLog["tipo"]
):EntradaLog{

return{
id,
turno,
texto,
tipo
};

}
