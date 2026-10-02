import React, { useState } from 'react';
import { SecaoRecord } from '../types';
import { Layers, Plus, Trash2, Search, Check, X, ShieldAlert } from 'lucide-react';

interface SecoesViewProps {
  secoes: SecaoRecord[];
  onUpdateSecoes: (secoes: SecaoRecord[]) => void;
}

export const SecoesView: React.FC<SecoesViewProps> = ({
  secoes,
  onUpdateSecoes,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novaSecaoNum, setNovaSecaoNum] = useState('');
  const [novoLocal, setNovoLocal] = useState('Zona Eleitoral Principal');
  const [novaZona, setNovaZona] = useState('173');

  const filteredSecoes = secoes.filter(s =>
    String(s.numero).toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(s.local).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover esta seção?')) {
      onUpdateSecoes(secoes.filter(s => s.id !== id));
    }
  };

  const handleAddSecao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaSecaoNum.trim()) {
      alert('Informe o número da seção.');
      return;
    }

    // Check if section already exists
    if (secoes.some(s => s.numero === novaSecaoNum.trim())) {
      alert(`A seção ${novaSecaoNum} já está cadastrada.`);
      return;
    }

    const newSecao: SecaoRecord = {
      id: `sec_${Date.now()}_${novaSecaoNum}`,
      numero: novaSecaoNum.trim(),
      local: novoLocal.trim() || 'Zona Eleitoral',
      zona: novaZona.trim() || '001'
    };

    onUpdateSecoes([newSecao, ...secoes]);
    setNovaSecaoNum('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">Gerenciamento de Seções Eleitorais</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Lista oficial de seções cadastradas (extraídas da planilha e atualizáveis). Total: {secoes.length} seções.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-emerald-600/25 transition-all w-full md:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Seção</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar seção por número ou local..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="text-xs text-slate-400 hidden sm:block">
          Exibindo {filteredSecoes.length} seções
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredSecoes.map(sec => (
          <div key={sec.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between group shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">SEÇÃO</span>
                <button
                  onClick={() => handleDelete(sec.id)}
                  className="text-slate-600 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Excluir Seção"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
                {sec.numero}
              </div>
              <div className="text-xs text-slate-300 mt-2 truncate" title={sec.local}>
                {sec.local}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>Zona: {sec.zona}</span>
              <span className="text-emerald-500/80 font-medium">Ativa</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Secao */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/50">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">Cadastrar Nova Seção</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSecao} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Número da Seção *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 105, 230..."
                  value={novaSecaoNum}
                  onChange={(e) => setNovaSecaoNum(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono text-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Local / Escola
                </label>
                <input
                  type="text"
                  placeholder="Ex: Escola Municipal ..."
                  value={novoLocal}
                  onChange={(e) => setNovoLocal(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Zona Eleitoral
                </label>
                <input
                  type="text"
                  placeholder="Ex: 001"
                  value={novaZona}
                  onChange={(e) => setNovaZona(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Cadastrar Seção</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
