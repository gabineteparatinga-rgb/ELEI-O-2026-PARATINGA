import React, { useState } from 'react';
import { VotoRecord, PresidenteRecord, SecaoRecord, CandidatoRecord } from '../types';
import { X, PlusCircle, CheckCircle2, Database, Link2 } from 'lucide-react';

interface CandidateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  votos: VotoRecord[];
  presidente: PresidenteRecord[];
  secoes: SecaoRecord[];
  candidatos: CandidatoRecord[];
  onUpdateVotos: (votos: VotoRecord[]) => void;
  onUpdatePresidente: (presidente: PresidenteRecord[]) => void;
}

export const CandidateManagerModal: React.FC<CandidateManagerModalProps> = ({
  isOpen,
  onClose,
  votos,
  presidente,
  secoes,
  candidatos,
  onUpdateVotos,
  onUpdatePresidente,
}) => {
  const [targetTab, setTargetTab] = useState<'votos' | 'presidente'>('votos');
  const [secao, setSecao] = useState(secoes[0]?.numero || '101');
  const [votosQtd, setVotosQtd] = useState('');
  const [selectedCandidatoId, setSelectedCandidatoId] = useState('');
  const [numCandidato, setNumCandidato] = useState('');
  const [candidatoNome, setCandidatoNome] = useState('');
  const [cargo, setCargo] = useState('Vereador');

  if (!isOpen) return null;

  const handleCandidateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const candId = e.target.value;
    setSelectedCandidatoId(candId);
    if (!candId) {
      setNumCandidato('');
      setCandidatoNome('');
      return;
    }
    const found = candidatos.find(c => c.id === candId);
    if (found) {
      setNumCandidato(found.NUMCANDIDATO);
      setCandidatoNome(found.CANDIDATO);
      setCargo(found.CARGO);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secao || !votosQtd || !candidatoNome) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (targetTab === 'votos') {
      const newRecord: VotoRecord = {
        id: `v_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        SEÇÃO: secao,
        VOTOS: Number(votosQtd),
        NUMCANDIDATO: numCandidato || '00',
        CANDIDATO: candidatoNome,
        'Unnamed: 4': cargo || 'Geral',
      };
      // Relational integrity: append to votos list for this section & candidate
      onUpdateVotos([newRecord, ...votos]);
      alert(`Relacionamento Salvo!\nSeção ${secao} -> Candidato: ${candidatoNome} (${numCandidato}) | Votos: ${votosQtd}`);
    } else {
      const newRecord: PresidenteRecord = {
        id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        SEÇÃO: secao,
        VOTOS: Number(votosQtd),
        CANDIDATO: candidatoNome,
      };
      onUpdatePresidente([newRecord, ...presidente]);
      alert(`Votação de Presidente salva com sucesso!\nSeção ${secao} -> Candidato: ${candidatoNome} | Votos: ${votosQtd}`);
    }

    // Reset Qtd but keep section for rapid entry
    setVotosQtd('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/50">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Registro Relacional de Votos</h2>
              <p className="text-xs text-slate-400">Vincule votos de uma seção a um candidato cadastrado</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Selecione a Tabela de Destino
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTargetTab('votos')}
                className={`py-2.5 px-4 rounded-xl text-sm font-medium border transition-all ${
                  targetTab === 'votos'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-sm'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700/60'
                }`}
              >
                Aba "Votos" (Geral)
              </button>
              <button
                type="button"
                onClick={() => setTargetTab('presidente')}
                className={`py-2.5 px-4 rounded-xl text-sm font-medium border transition-all ${
                  targetTab === 'presidente'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-sm'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700/60'
                }`}
              >
                Aba "Presidente"
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1.5 flex items-center space-x-1">
                <span>1. Seção Eleitoral *</span>
              </label>
              {secoes.length > 0 ? (
                <select
                  value={secao}
                  onChange={(e) => setSecao(e.target.value)}
                  className="w-full bg-slate-800 border border-cyan-500/40 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                >
                  {secoes.map(s => (
                    <option key={s.id} value={s.numero}>Seção {s.numero} (Zona {s.zona || '173'})</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  placeholder="Ex: 101"
                  value={secao}
                  onChange={(e) => setSecao(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1.5">
                3. Qtd de Votos *
              </label>
              <input
                type="number"
                required
                min="0"
                placeholder="Ex: 150"
                value={votosQtd}
                onChange={(e) => setVotosQtd(e.target.value)}
                className="w-full bg-slate-800 border border-emerald-500/40 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-bold text-emerald-400"
              />
            </div>
          </div>

          {/* Relational Candidate Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1.5 flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <Link2 className="w-3.5 h-3.5" />
                <span>2. Vincular Candidato Cadastrado *</span>
              </span>
              <span className="text-slate-400 text-[11px]">{candidatos.length} no cadastro</span>
            </label>
            {candidatos.length > 0 ? (
              <select
                value={selectedCandidatoId}
                onChange={handleCandidateSelect}
                required
                className="w-full bg-slate-800 border border-emerald-500/50 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="">-- Selecione o candidato da tabela mestre --</option>
                {candidatos.map(c => (
                  <option key={c.id} value={c.id}>
                    [{c.NUMCANDIDATO}] {c.CANDIDATO} — Cargo: {c.CARGO}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs">
                Nenhum candidato cadastrado na aba "Candidatos". Cadastre os candidatos primeiro para efetuar a relação relacional.
              </div>
            )}
          </div>

          {targetTab === 'votos' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Número do Candidato (Vinculado)
              </label>
              <input
                type="text"
                readOnly
                placeholder="Preenchido automaticamente pelo cadastro"
                value={numCandidato}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-300 font-mono cursor-not-allowed"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Nome do Candidato / Coligação (Vinculado)
            </label>
            <input
              type="text"
              readOnly
              required
              placeholder="Preenchido automaticamente pelo cadastro"
              value={candidatoNome}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-300 font-medium cursor-not-allowed"
            />
          </div>

          {targetTab === 'votos' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Cargo / Categoria (Vinculado)
              </label>
              <input
                type="text"
                readOnly
                value={cargo}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-300 font-medium cursor-not-allowed"
              />
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salvar Votação Relacional</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
