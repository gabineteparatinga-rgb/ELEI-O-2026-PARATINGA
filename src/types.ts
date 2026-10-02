export interface VotoRecord {
  id: string;
  SEÇÃO: number | string;
  VOTOS: number;
  NUMCANDIDATO: number | string;
  CANDIDATO: string;
  'Unnamed: 4': string; // Cargo/Categoria (e.g. Prefeito, Vereador, Deputado Federal)
}

export interface PresidenteRecord {
  id: string;
  SEÇÃO: number | string;
  VOTOS: number;
  CANDIDATO: string;
}

export interface CandidatoRecord {
  id: string;
  NUMCANDIDATO: string;
  CANDIDATO: string;
  CARGO: string;
}

export interface SecaoRecord {
  id: string;
  numero: string;
  local?: string;
  zona?: string;
}

export type ActiveTab = 'dashboard' | 'votos' | 'presidente' | 'candidatos' | 'secoes' | 'ia-assistente';


