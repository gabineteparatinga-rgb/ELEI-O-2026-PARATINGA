import React, { useState } from 'react';
import { VotoRecord, PresidenteRecord } from '../types';
import { 
  Search, 
  Trash2, 
  Edit3, 
  Plus, 
  Filter, 
  Check, 
  X, 
  FileSpreadsheet, 
  Users,
  AlertTriangle
} from 'lucide-react';

interface TableViewProps {
  type: 'votos' | 'presidente';
  votos: VotoRecord[];
  presidente: PresidenteRecord[];
  onUpdateVotos: (votos: VotoRecord[]) => void;
  onUpdatePresidente: (presidente: PresidenteRecord[]) => void;
  onOpenNewRecord: () => void;
}

export const TableView: React.FC<TableViewProps> = ({
  type,
  votos,
  presidente,
  onUpdateVotos,
  onUpdatePresidente,
  onOpenNewRecord,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedCargo, setSelectedCargo] = useState('all');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Edit state
  const [editValues, setEditValues] = useState<any>({});

  const isVotos = type === 'votos';
  const currentData = isVotos ? votos : presidente;

  // Extract unique sections and cargos for filter dropdowns
  const sections = Array.from(new Set(currentData.map(item => String(item.SEÇÃO)))).sort();
  const cargos = isVotos ? Array.from(new Set(votos.map(v => (v as VotoRecord)['Unnamed: 4']).filter(Boolean))).sort() : [];

  // Filtered data
  const filteredData = currentData.filter(item => {
    const matchesSearch = Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesSection = selectedSection === 'all' || String(item.SEÇÃO) === selectedSection;
    const matchesCargo = !isVotos || selectedCargo === 'all' || (item as VotoRecord)['Unnamed: 4'] === selectedCargo;
    return matchesSearch && matchesSection && matchesCargo;
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      if (isVotos) {
        onUpdateVotos(votos.filter(v => v.id !== id));
      } else {
        onUpdatePresidente(presidente.filter(p => p.id !== id));
      }
    }
  };

  const handleStartEdit = (item: any) => {
    setEditingId(item.id);
    setEditValues({ ...item });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleSaveEdit = (id: string) => {
    // Validation
    if (!editValues.SEÇÃO || editValues.VOTOS === undefined) {
      alert('Seção e Votos são obrigatórios.');
      return;
    }

    if (isVotos) {
      const updated = votos.map(v => v.id === id ? { ...v, ...editValues, VOTOS: Number(editValues.VOTOS) } : v);
      onUpdateVotos(updated);
    } else {
      const updated = presidente.map(p => p.id === id ? { ...p, ...editValues, VOTOS: Number(editValues.VOTOS) } : p);
      onUpdatePresidente(updated);
    }
    setEditingId(null);
    setEditValues({});
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            {isVotos ? (
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            ) : (
              <Users className="w-5 h-5 text-cyan-400" />
            )}
            <h1 className="text-xl sm:text-2xl font-bold text-white capitalize">
              Aba "{isVotos ? 'Votos' : 'Presidente'}"
            </h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            {isVotos 
              ? 'Estrutura: SEÇÃO, VOTOS, NUMCANDIDATO, CANDIDATO, Unnamed: 4 (Cargo)' 
              : 'Estrutura: SEÇÃO, VOTOS, CANDIDATO'}
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button
            onClick={onOpenNewRecord}
            className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-emerald-600/20 transition-all w-full md:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Votação</span>
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar candidato, número ou seção..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end flex-wrap gap-2">
          {isVotos && cargos.length > 0 && (
            <div className="flex items-center space-x-2">
              <select
                value={selectedCargo}
                onChange={(e) => setSelectedCargo(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">Todos os Cargos</option>
                {cargos.map(cargo => (
                  <option key={cargo} value={cargo}>{cargo}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Filter className="w-4 h-4 text-emerald-400" />
              <span>Seção:</span>
            </div>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todas</option>
              {sections.map(sec => (
                <option key={sec} value={sec}>Seção {sec}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/60 border-b border-slate-800 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <th className="py-3.5 px-4">Seção</th>
                <th className="py-3.5 px-4">Votos</th>
                {isVotos && <th className="py-3.5 px-4">Nº Candidato</th>}
                <th className="py-3.5 px-4">Candidato / Coligação</th>
                {isVotos && <th className="py-3.5 px-4">Cargo (Unnamed: 4)</th>}
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={isVotos ? 6 : 4} className="py-12 text-center text-slate-500">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : (
                filteredData.map(item => {
                  const isEditing = editingId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Seção */}
                      <td className="py-3 px-4 font-mono font-medium text-emerald-400">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editValues.SEÇÃO ?? ''}
                            onChange={(e) => setEditValues({ ...editValues, SEÇÃO: e.target.value })}
                            className="w-20 bg-slate-800 border border-emerald-500 rounded px-2 py-1 text-white text-xs"
                          />
                        ) : (
                          `Seção ${item.SEÇÃO}`
                        )}
                      </td>

                      {/* Votos */}
                      <td className="py-3 px-4 font-semibold text-white">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editValues.VOTOS ?? 0}
                            onChange={(e) => setEditValues({ ...editValues, VOTOS: e.target.value })}
                            className="w-24 bg-slate-800 border border-emerald-500 rounded px-2 py-1 text-white text-xs"
                          />
                        ) : (
                          Number(item.VOTOS).toLocaleString()
                        )}
                      </td>

                      {/* NUMCANDIDATO (Aba Votos only) */}
                      {isVotos && (
                        <td className="py-3 px-4 font-mono text-cyan-400">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editValues.NUMCANDIDATO ?? ''}
                              onChange={(e) => setEditValues({ ...editValues, NUMCANDIDATO: e.target.value })}
                              className="w-20 bg-slate-800 border border-emerald-500 rounded px-2 py-1 text-white text-xs"
                            />
                          ) : (
                            (item as VotoRecord).NUMCANDIDATO || '-'
                          )}
                        </td>
                      )}

                      {/* CANDIDATO */}
                      <td className="py-3 px-4 text-slate-200 font-medium">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editValues.CANDIDATO ?? ''}
                            onChange={(e) => setEditValues({ ...editValues, CANDIDATO: e.target.value })}
                            className="w-full bg-slate-800 border border-emerald-500 rounded px-2 py-1 text-white text-xs"
                          />
                        ) : (
                          item.CANDIDATO
                        )}
                      </td>

                      {/* Unnamed: 4 (Aba Votos only) */}
                      {isVotos && (
                        <td className="py-3 px-4 text-slate-300">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editValues['Unnamed: 4'] ?? ''}
                              onChange={(e) => setEditValues({ ...editValues, 'Unnamed: 4': e.target.value })}
                              className="w-32 bg-slate-800 border border-emerald-500 rounded px-2 py-1 text-white text-xs"
                            />
                          ) : (
                            <span className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-md text-xs font-medium text-slate-300">
                              {(item as VotoRecord)['Unnamed: 4'] || 'Geral'}
                            </span>
                          )}
                        </td>
                      )}

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleSaveEdit(item.id)}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                              title="Salvar"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                              title="Cancelar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleStartEdit(item)}
                              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="bg-slate-800/40 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>Exibindo {filteredData.length} de {currentData.length} registros</div>
          <div className="flex items-center space-x-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Alterações salvas automaticamente na sessão</span>
          </div>
        </div>
      </div>
    </div>
  );
};
