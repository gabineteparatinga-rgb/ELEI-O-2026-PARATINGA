import React, { useState } from 'react';
import { VotoRecord, PresidenteRecord } from '../types';
import { Sparkles, X, Loader2, CheckCircle2, FileText } from 'lucide-react';

interface AiParserModalProps {
  isOpen: boolean;
  onClose: () => void;
  votos: VotoRecord[];
  presidente: PresidenteRecord[];
  onUpdateVotos: (votos: VotoRecord[]) => void;
  onUpdatePresidente: (presidente: PresidenteRecord[]) => void;
}

export const AiParserModal: React.FC<AiParserModalProps> = ({
  isOpen,
  onClose,
  votos,
  presidente,
  onUpdateVotos,
  onUpdatePresidente,
}) => {
  const [targetTab, setTargetTab] = useState<'votos' | 'presidente'>('votos');
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<any[] | null>(null);

  if (!isOpen) return null;

  const handleParse = async () => {
    if (!rawText.trim()) {
      alert('Por favor, cole o texto com os dados eleitorais.');
      return;
    }

    setLoading(true);
    setParsedPreview(null);

    try {
      const res = await fetch('/api/ai/parse-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText, sheetName: targetTab })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao processar com IA');
      }

      setParsedPreview(data.records);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Falha ao processar texto com IA.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (!parsedPreview || parsedPreview.length === 0) return;

    if (targetTab === 'votos') {
      const newRecords: VotoRecord[] = parsedPreview.map((item, idx) => ({
        id: `v_ai_${Date.now()}_${idx}`,
        SEÇÃO: item.SEÇÃO || '100',
        VOTOS: Number(item.VOTOS || 0),
        NUMCANDIDATO: item.NUMCANDIDATO || '00',
        CANDIDATO: item.CANDIDATO || 'Desconhecido',
        'Unnamed: 4': item['Unnamed: 4'] || 'Geral',
      }));
      onUpdateVotos([...newRecords, ...votos]);
      alert(`${newRecords.length} registros importados com sucesso para a aba Votos!`);
    } else {
      const newRecords: PresidenteRecord[] = parsedPreview.map((item, idx) => ({
        id: `p_ai_${Date.now()}_${idx}`,
        SEÇÃO: item.SEÇÃO || '100',
        VOTOS: Number(item.VOTOS || 0),
        CANDIDATO: item.CANDIDATO || 'Desconhecido',
      }));
      onUpdatePresidente([...newRecords, ...presidente]);
      alert(`${newRecords.length} registros importados com sucesso para a aba Presidente!`);
    }

    setRawText('');
    setParsedPreview(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/50">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Importação Inteligente com IA (Parser)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Selecione a Aba de Destino
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTargetTab('votos')}
                className={`py-2 px-4 rounded-xl text-sm font-medium border transition-all ${
                  targetTab === 'votos'
                    ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700/60'
                }`}
              >
                Aba "Votos"
              </button>
              <button
                type="button"
                onClick={() => setTargetTab('presidente')}
                className={`py-2 px-4 rounded-xl text-sm font-medium border transition-all ${
                  targetTab === 'presidente'
                    ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700/60'
                }`}
              >
                Aba "Presidente"
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Cole o texto bruto (WhatsApp, boletim de urna, relatório)</span>
              <span className="text-slate-500 text-[11px]">A IA estruturará em colunas automaticamente</span>
            </label>
            <textarea
              rows={5}
              placeholder="Ex: Na seção 105, o candidato João Silva (número 15) teve 142 votos para Vereador. Na mesma seção, Maria Souza (número 45) teve 89 votos..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-xs"
            />
          </div>

          {!parsedPreview && (
            <div className="flex justify-end">
              <button
                onClick={handleParse}
                disabled={loading}
                className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analisando com Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Processar com IA</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Preview of Parsed Data */}
          {parsedPreview && (
            <div className="mt-4 space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  {parsedPreview.length} registros estruturados com sucesso pela IA:
                </span>
                <button
                  onClick={() => setParsedPreview(null)}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Editar texto
                </button>
              </div>

              <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700 max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700 pb-1">
                      <th className="pb-2">Seção</th>
                      <th className="pb-2">Votos</th>
                      {targetTab === 'votos' && <th className="pb-2">Nº</th>}
                      <th className="pb-2">Candidato</th>
                      {targetTab === 'votos' && <th className="pb-2">Cargo</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {parsedPreview.map((item, idx) => (
                      <tr key={idx} className="text-slate-200">
                        <td className="py-1.5 font-mono text-emerald-400">{item.SEÇÃO}</td>
                        <td className="py-1.5 font-bold">{item.VOTOS}</td>
                        {targetTab === 'votos' && <td className="py-1.5 font-mono text-cyan-400">{item.NUMCANDIDATO}</td>}
                        <td className="py-1.5">{item.CANDIDATO}</td>
                        {targetTab === 'votos' && <td className="py-1.5 text-slate-400">{item['Unnamed: 4']}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-slate-800 bg-slate-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Cancelar
          </button>
          {parsedPreview && (
            <button
              onClick={handleConfirmImport}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Importar para a Planilha</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
