#!/usr/bin/env node
/**
 * setup.mjs — rode UMA VEZ na raiz do projeto:
 *   node setup.mjs
 *
 * Cria todas as pastas necessárias e move cada arquivo
 * para o lugar certo, corrigindo o problema do RAR que
 * extrai tudo na raiz.
 */

import fs   from "fs";
import path from "path";

const ROOT = process.cwd();

// Mapa: nome do arquivo → pasta de destino (relativa à raiz do projeto)
const MAPA = {
  // ── Contexts ──────────────────────────────────────
  "AuthContext.tsx":       "contexts",
  "CalendarioContext.tsx": "contexts",
  "InventarioContext.tsx": "contexts",

  // ── Firebase ──────────────────────────────────────
  "config.ts":    "firebase",
  "auth.ts":      "firebase",
  "firestore.ts": "firebase",
  "storage.ts":   "firebase",

  // ── Services ──────────────────────────────────────
  "calculoService.ts":  "services",
  "efeitosService.ts":  "services",
  "itemService.ts":     "services",
  "personagemService.ts": "services",
  "monstroService.ts":  "services",
  "npcService.ts":      "services",
  "missaoService.ts":   "services",
  "areaService.ts":     "services",
  "combateService.ts":  "services",
  "SeedService.ts":     "services",

  // ── Hooks ─────────────────────────────────────────
  "useCalendario.ts":  "hooks",
  "useEquipamento.ts": "hooks",
  "useInventario.ts":  "hooks",
  "useNivel.ts":       "hooks",
  "usePersonagem.ts":  "hooks",

  // ── Types ─────────────────────────────────────────
  "index.ts": "types",

  // ── Layout components ─────────────────────────────
  "Topo.tsx":    "components/Layout",
  "Sidebar.tsx": "components/Layout",

  // ── Clima ─────────────────────────────────────────
  "Clima.tsx": "components/Clima",

  // ── Bestiário ─────────────────────────────────────
  "CardMonstro.tsx":      "components/Bestiario",
  "FichaMonstro.tsx":     "components/Bestiario",
  "FiltrosMonstros.tsx":  "components/Bestiario",
  "FormularioMonstro.tsx":"components/Bestiario",
  "ListaMonstros.tsx":    "components/Bestiario",

  // ── Itens ─────────────────────────────────────────
  "CardItem.tsx":      "components/Itens",
  "FichaItem.tsx":     "components/Itens",
  "FormularioItem.tsx":"components/Itens",
  "ListaItens.tsx":    "components/Itens",

  // ── NPCs ──────────────────────────────────────────
  "CardNPC.tsx":      "components/NPCs",
  "FichaNPC.tsx":     "components/NPCs",
  "FormularioNPC.tsx":"components/NPCs",
  "ListaNPCs.tsx":    "components/NPCs",

  // ── Missões ───────────────────────────────────────
  "CardMissao.tsx":      "components/Missoes",
  "FormularioMissao.tsx":"components/Missoes",

  // ── Áreas ─────────────────────────────────────────
  "CardArea.tsx":      "components/Areas",
  "FormularioArea.tsx":"components/Areas",

  // ── Combate ───────────────────────────────────────
  "BarraStatusCombate.tsx":  "components/Combate",
  "GrupoCombatentes.tsx":    "components/Combate",
  "LogCombate.tsx":          "components/Combate",
  "PainelSelecaoCombate.tsx":"components/Combate",

  // ── Personagem › Lista ────────────────────────────
  "CardPersonagem.tsx":     "components/Personagem/Lista",
  "FiltrosPersonagem.tsx":  "components/Personagem/Lista",
  "ListaPersonagens.tsx":   "components/Personagem/Lista",
  "FormularioPersonagem.tsx":"components/Personagem/Lista",

  // ── Personagem › Ficha ────────────────────────────
  "FichaPersonagem.tsx":   "components/Personagem/Ficha",
  "Atributos.tsx":         "components/Personagem/Ficha",
  "BarraVida.tsx":         "components/Personagem/Ficha",
  "InformacoesBasicas.tsx":"components/Personagem/Ficha",

  // ── Personagem › Equipamentos ─────────────────────
  "CorpoEquipamento.tsx":  "components/Personagem/Equipamentos",
  "Equipamentos.tsx":      "components/Personagem/Equipamentos",
  "SistemaEquipamento.tsx":"components/Personagem/Equipamentos",
  "SlotEquipamento.tsx":   "components/Personagem/Equipamentos",

  // ── Personagem › Inventário ───────────────────────
  "Inventario.tsx": "components/Personagem/Inventario",
  "ItemCard.tsx":   "components/Personagem/Inventario",

  // ── Personagem › Nível ────────────────────────────
  "ModalNivel.tsx": "components/Personagem/Nivel",
};

let movidos = 0, ignorados = 0;

for (const [arquivo, pasta] of Object.entries(MAPA)) {
  const origem  = path.join(ROOT, arquivo);
  const destDir = path.join(ROOT, pasta);
  const destino = path.join(destDir, arquivo);

  if (!fs.existsSync(origem)) { ignorados++; continue; }

  fs.mkdirSync(destDir, { recursive: true });

  // Só move se o destino não existir ou for mais antigo
  if (!fs.existsSync(destino)) {
    fs.renameSync(origem, destino);
    console.log(`✔ ${arquivo}  →  ${pasta}/`);
    movidos++;
  } else {
    // Destino já existe — sobrescreve e remove origem
    fs.copyFileSync(origem, destino);
    fs.unlinkSync(origem);
    console.log(`↺ ${arquivo}  →  ${pasta}/  (sobrescrito)`);
    movidos++;
  }
}

console.log(`\nConcluído: ${movidos} arquivos organizados, ${ignorados} não encontrados.`);
