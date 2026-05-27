import { createDocument, listDocuments } from '../firebase/firestore';

export interface HistoricoCombate {
  id?: string;
  data: string;
  participantes: string[];
  vencedor: string;
  derrotados: string[];
  xpDistribuido: { personagemId: string; valor: number }[];
  ouroDistribuido: { personagemId: string; valor: number }[];
  itensConsumidos: { personagemId: string; itemId: string; quantidade: number }[];
}

export async function salvarHistoricoCombate(historico: Omit<HistoricoCombate, 'id'>): Promise<string> {
  try {
    return await createDocument('historicos_combate', historico);
  } catch (e) {
    console.error('Erro ao salvar histórico:', e);
    return '';
  }
}

export async function listarHistoricos(): Promise<HistoricoCombate[]> {
  try {
    return await listDocuments('historicos_combate') as HistoricoCombate[];
  } catch (e) {
    console.error('Erro ao listar históricos:', e);
    return [];
  }
}
