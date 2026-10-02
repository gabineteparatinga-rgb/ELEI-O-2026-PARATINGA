import React, { useState } from 'react';
import { CandidatoRecord } from '../types';
import { Users, Plus, Trash2, Edit3, Search, Check, X, Award, Shield } from 'lucide-react';

interface CandidatosViewProps {
  candidatos: CandidatoRecord[];
  onUpdateCandidatos: (candidatos: CandidatoRecord[]) => void;
}

export const CandidatosView: React.FC<CandidatosViewProps> = ({
  candidatos,
  onUpdateCandidatos,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cargoFilter, setCargoFilter] = useState('all');

  // New / Edit candidate state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [numCandidato, setNumCandidato] = useState('');
  const [nomeCandidato, setNomeCandidato] = useState('');
  const [cargoCandidato, setCargoCandidato] = useState('Vereador');

  const filteredCandidatos = candidatos.filter(c => {
    const matchesSearch = 
      c.CANDIDATO.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(c.NUMCANDIDATO).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCargo = cargoFilter === 'all' || c.CARGO === cargoFilter;
    return matchesSearch && matchesCargo;
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setNumCandidato('');
    setNomeCandidato('');
    setCargoCandidato('Vereador');
    setIsModalOpen(true);
  };

  const handleStartEdit = (c: CandidatoRecord) => {
    setEditingId(c.id);
    setNumCandidato(c.NUMCANDIDATO);
    setNomeCandidato(c.CANDIDATO);
    setCargoCandidato(c.CARGO);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este candidato?')) {
      onUpdateCandidatos(candidatos.filter(c => c.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numCandidato || !nomeCandidato || !cargoCandidato) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    if (editingId) {
      const updated = candidatos.map(c => c.id === editingId ? {
        ...c,
        NUMCANDIDATO: numCandidato,
        CANDIDATO: nomeCandidato,
        CARGO: cargoCandidato
      } : c);
      onUpdateCandidatos(updated);
    } else {
      const newCand: CandidatoRecord = {
        id: `cand_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        NUMCANDIDATO: numCandidato,
        CANDIDATO: nomeCandidato,
        CARGO: cargoCandidato
      };
      onUpdateCandidatos([newCand, ...candidatos]);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">Cadastro de Candidatos e Cargos</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Gerencie os candidatos oficiais, seus números de urna e respectivos cargos eleitorais.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-emerald-600/25 transition-all w-full md:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Candidato</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou número..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-400 font-medium">Filtrar Cargo:</span>
          <select
            value={cargoFilter}
            onChange={(e) => setCargoFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todos os Cargos</option>
            <option value="Presidente da República">Presidente da República</option>
            <option value="Governador">Governador</option>
            <option value="Senador">Senador</option>
            <option value="Deputado Federal">Deputado Federal</option>
            <option value="Deputado Estadual">Deputado Estadual</option>
            <option value="Prefeito">Prefeito</option>
            <option value="Vereador">Vereador</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/60 border-b border-slate-800 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <th className="py-3.5 px-4">Número</th>
                <th className="py-3.5 px-4">Nome do Candidato / Coligação</th>
                <th className="py-3.5 px-4">Cargo Disputado</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {filteredCandidatos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    Nenhum candidato cadastrado. Clique em "Cadastrar Novo Candidato".
                  </td>
                </tr>
              ) : (
                filteredCandidatos.map(c => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400 text-base">
                      {c.NUMCANDIDATO}
                    </td>
                    <td className="py-3.5 px-4 text-white font-medium">
                      {c.CANDIDATO}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-xs font-semibold">
                        {c.CARGO}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleStartEdit(c)}
                          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/50">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">
                  {editingId ? 'Editar Candidato' : 'Cadastrar Candidato'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Número de Urna (NUMCANDIDATO) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 15, 22, 13..."
                  value={numCandidato}
                  onChange={(e) => setNumCandidato(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Nome do Candidato / Coligação *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João Silva ou MDB - COLIGAÇÃO"
                  value={nomeCandidato}
                  onChange={(e) => setNomeCandidato(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Cargo Disputado *
                </label>
                <select
                  value={cargoCandidato}
                  onChange={(e) => setCargoCandidato(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Presidente da República">Presidente da República</option>
                  <option value="Governador">Governador</option>
                  <option value="Senador">Senador</option>
                  <option value="Deputado Federal">Deputado Federal</option>
                  <option value="Deputado Estadual">Deputado Estadual</option>
                  <option value="Prefeito">Prefeito</option>
                  <option value="Vereador">Vereador</option>
                </select>
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
                  <span>Salvar Candidato</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
