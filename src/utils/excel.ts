import * as XLSX from 'xlsx';
import { VotoRecord, PresidenteRecord, SecaoRecord } from '../types';

export const initialVotosData: VotoRecord[] = [];

export const initialPresidenteData: PresidenteRecord[] = [];

const rawSecoesList = [
  '98', '99', '100', '191', '234', '103', '104', '105', '106', '108', '109', '110', '111', '112', '114', '116', '117', '118', '119', '189', '120', '121', '122', '124', '125', '126', '127', '128', '129', '130', '132', '131', '133', '134', '135', '137', '138', '139', '140', '141', '142', '143', '144', '146', '147', '148', '150', '151', '152', '154', '236', '155', '156', '157', '159', '160', '161', '162', '163', '173', '164', '165', '166', '167', '168', '169', '170', '171', '101', '102', '177', '185', '232', '184', '149', '158'
];

export const initialSecoesData: SecaoRecord[] = rawSecoesList.map((num, i) => ({
  id: `sec_${i}_${num}`,
  numero: num,
  local: 'Zona Eleitoral',
  zona: '173'
}));

export function exportToExcel(votos: VotoRecord[], presidente: PresidenteRecord[]) {
  const wb = XLSX.utils.book_new();

  // Format Votos sheet
  const votosClean = votos.map(v => ({
    SEÇÃO: v.SEÇÃO,
    VOTOS: Number(v.VOTOS),
    NUMCANDIDATO: v.NUMCANDIDATO,
    CANDIDATO: v.CANDIDATO,
    'Unnamed: 4': v['Unnamed: 4']
  }));
  const wsVotos = XLSX.utils.json_to_sheet(votosClean);
  XLSX.utils.book_append_sheet(wb, wsVotos, 'Votos');

  // Format Presidente sheet
  const presClean = presidente.map(p => ({
    SEÇÃO: p.SEÇÃO,
    VOTOS: Number(p.VOTOS),
    CANDIDATO: p.CANDIDATO
  }));
  const wsPres = XLSX.utils.json_to_sheet(presClean);
  XLSX.utils.book_append_sheet(wb, wsPres, 'Presidente');

  XLSX.writeFile(wb, 'VOTOS.xlsx');
}

export function parseExcelFile(file: File): Promise<{ votos: VotoRecord[]; presidente: PresidenteRecord[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });

        let votos: VotoRecord[] = [];
        let presidente: PresidenteRecord[] = [];

        // Check sheet names
        wb.SheetNames.forEach(sheetName => {
          const ws = wb.Sheets[sheetName];
          const rawData = XLSX.utils.sheet_to_json<any>(ws);

          if (sheetName.toLowerCase().includes('voto') || sheetName.toLowerCase().includes('geral')) {
            votos = rawData.map((row, index) => ({
              id: `v_${Date.now()}_${index}`,
              SEÇÃO: row.SEÇÃO ?? row.Secao ?? row.secao ?? '000',
              VOTOS: Number(row.VOTOS ?? row.Votos ?? row.votos ?? 0),
              NUMCANDIDATO: row.NUMCANDIDATO ?? row.NumCandidato ?? row.numero ?? '',
              CANDIDATO: row.CANDIDATO ?? row.Candidato ?? row.nome ?? '',
              'Unnamed: 4': row['Unnamed: 4'] ?? row.Cargo ?? row.cargo ?? 'Geral'
            }));
          } else if (sheetName.toLowerCase().includes('pres')) {
            presidente = rawData.map((row, index) => ({
              id: `p_${Date.now()}_${index}`,
              SEÇÃO: row.SEÇÃO ?? row.Secao ?? row.secao ?? '000',
              VOTOS: Number(row.VOTOS ?? row.Votos ?? row.votos ?? 0),
              CANDIDATO: row.CANDIDATO ?? row.Candidato ?? row.nome ?? ''
            }));
          }
        });

        // Fallback if sheets didn't match names exactly
        if (votos.length === 0 && wb.SheetNames.length > 0) {
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rawData = XLSX.utils.sheet_to_json<any>(ws);
          votos = rawData.map((row, index) => ({
            id: `v_${Date.now()}_${index}`,
            SEÇÃO: row.SEÇÃO ?? row.Secao ?? '000',
            VOTOS: Number(row.VOTOS ?? row.Votos ?? 0),
            NUMCANDIDATO: row.NUMCANDIDATO ?? row.Numero ?? '',
            CANDIDATO: row.CANDIDATO ?? row.Candidato ?? '',
            'Unnamed: 4': row['Unnamed: 4'] ?? row.Cargo ?? 'Geral'
          }));
        }

        if (presidente.length === 0 && wb.SheetNames.length > 1) {
          const ws = wb.Sheets[wb.SheetNames[1]];
          const rawData = XLSX.utils.sheet_to_json<any>(ws);
          presidente = rawData.map((row, index) => ({
            id: `p_${Date.now()}_${index}`,
            SEÇÃO: row.SEÇÃO ?? row.Secao ?? '000',
            VOTOS: Number(row.VOTOS ?? row.Votos ?? 0),
            CANDIDATO: row.CANDIDATO ?? row.Candidato ?? ''
          }));
        }

        resolve({ votos, presidente });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
