import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { VotoRecord, PresidenteRecord } from '../types';
import { Vote, Users, Layers, Award, TrendingUp, FileCheck, Filter } from 'lucide-react';

interface DashboardViewProps {
  votos: VotoRecord[];
  presidente: PresidenteRecord[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ votos, presidente }) => {
  const [selectedCargoFilter, setSelectedCargoFilter] = useState<string>('todos');

  // Total calculations
  const totalVotosGeral = votos.reduce((acc, curr) => acc + Number(curr.VOTOS || 0), 0);
  const totalSecoesGeral = new Set(votos.map(v => v.SEÇÃO)).size;
  const totalCandidatosUnicos = new Set(votos.map(v => v.NUMCANDIDATO)).size;

  // Group votes by Cargo first
  const cargosMap: { [cargo: string]: { [candidato: string]: { name: string; votos: number; numCandidato: string } } } = {};
  
  votos.forEach(v => {
    const cargo = v['Unnamed: 4'] || 'Geral / Outros';
    const candName = v.CANDIDATO || 'Desconhecido';
    const numCand = String(v.NUMCANDIDATO || '');

    if (!cargosMap[cargo]) {
      cargosMap[cargo] = {};
    }
    if (!cargosMap[cargo][candName]) {
      cargosMap[cargo][candName] = { name: candName, votos: 0, numCandidato: numCand };
    }
    cargosMap[cargo][candName].votos += Number(v.VOTOS || 0);
  });

  // Also include Presidente table data into Presidente da República cargo if applicable
  const totalVotosPresidente = presidente.reduce((acc, curr) => acc + Number(curr.VOTOS || 0), 0);
  if (presidente.length > 0) {
    const presCargo = 'Presidente da República';
    if (!cargosMap[presCargo]) {
      cargosMap[presCargo] = {};
    }
    presidente.forEach(p => {
      const candName = p.CANDIDATO || 'Outros';
      if (!cargosMap[presCargo][candName]) {
        cargosMap[presCargo][candName] = { name: candName, votos: 0, numCandidato: '-' };
      }
      cargosMap[presCargo][candName].votos += Number(p.VOTOS || 0);
    });
  }

  // Convert cargosMap into structured list with percentages per cargo
  const cargosList = Object.keys(cargosMap).map(cargoName => {
    const candObj = cargosMap[cargoName];
    const totalVotosCargo = Object.values(candObj).reduce((sum, c) => sum + c.votos, 0);

    const candidates = Object.values(candObj).map(c => ({
      ...c,
      percent: totalVotosCargo > 0 ? Number(((c.votos / totalVotosCargo) * 100).toFixed(1)) : 0
    })).sort((a, b) => b.votos - a.votos);

    return {
      cargo: cargoName,
      totalVotos: totalVotosCargo,
      candidates
    };
  }).filter(item => item.totalVotos > 0).sort((a, b) => b.totalVotos - a.totalVotos);

  const filteredCargos = selectedCargoFilter === 'todos' 
    ? cargosList 
    : cargosList.filter(c => c.cargo.toLowerCase() === selectedCargoFilter.toLowerCase());

  const liderVotosGeral = cargosList[0]?.candidates[0]?.name || 'N/A';

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">Painel Executivo Eleitoral — Por Cargo</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Apuração Separada por Cargo</h1>
          <p className="text-slate-400 text-sm mt-1">
            Gráficos isolados e independentes para cada cargo, garantindo que não haja mistura de dados entre diferentes concorrentes.
          </p>
        </div>
        <div className="flex items-center space-x-3 bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700/60">
          <FileCheck className="w-5 h-5 text-emerald-400" />
          <div className="text-xs">
            <div className="text-slate-300 font-medium">Status da Apuração</div>
            <div className="text-emerald-400 font-bold">Isolamento por Cargo Ativo</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total de Votos (Geral)</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Vote className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{totalVotosGeral.toLocaleString()}</span>
            <span className="text-xs text-emerald-400 font-medium flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> {votos.length} registros
            </span>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Seções Apuradas</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{totalSecoesGeral}</span>
            <span className="text-xs text-cyan-400 font-medium">Seções ativas</span>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cargos Distintos</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{cargosList.length}</span>
            <span className="text-xs text-indigo-400 font-medium">Categorias</span>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm relative overflow-hidden group hover:border-amber-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Destaque Geral</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-lg font-bold text-white truncate block" title={liderVotosGeral}>
              {liderVotosGeral}
            </span>
            <span className="text-xs text-amber-400 font-medium">Maior votação</span>
          </div>
        </div>
      </div>

      {/* Filter by Cargo Bar */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-slate-300 text-sm font-semibold">
          <Filter className="w-4 h-4 text-emerald-400" />
          <span>Filtrar Exibição por Cargo:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCargoFilter('todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedCargoFilter === 'todos'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            Todos os Cargos ({cargosList.length})
          </button>
          {cargosList.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCargoFilter(item.cargo)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCargoFilter.toLowerCase() === item.cargo.toLowerCase()
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {item.cargo}
            </button>
          ))}
        </div>
      </div>

      {/* Dedicated Chart Card for Each Cargo */}
      <div className="space-y-6">
        {filteredCargos.map((cargoItem, index) => {
          const topCandidate = cargoItem.candidates[0];
          return (
            <div key={index} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm space-y-6">
              {/* Cargo Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider border border-emerald-500/20">
                      Cargo Específico
                    </span>
                    <h2 className="text-xl font-black text-white">{cargoItem.cargo}</h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Total de votos apurados para {cargoItem.cargo}: <strong className="text-white font-mono">{cargoItem.totalVotos.toLocaleString()}</strong> ({cargoItem.candidates.length} concorrentes)
                  </p>
                </div>
                {topCandidate && (
                  <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/60 flex items-center space-x-3">
                    <Award className="w-5 h-5 text-amber-400" />
                    <div className="text-xs">
                      <div className="text-slate-400">Líder do Cargo</div>
                      <div className="text-white font-bold">{topCandidate.name} ({topCandidate.percent}%)</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chart & Candidates Breakdown Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                {/* Chart for this specific cargo */}
                <div className="lg:col-span-2 h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cargoItem.candidates} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                      <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={130} tick={{ fill: '#cbd5e1' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                        formatter={(value: any, name: any) => [
                          name === 'votos' ? `${Number(value).toLocaleString()} votos` : `${value}%`,
                          name === 'votos' ? 'Quantidade' : 'Percentual'
                        ]}
                      />
                      <Bar dataKey="votos" name="votos" fill="#10b981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Candidate List with Quantity & Percentage for this Cargo */}
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Concorrentes ao Cargo ({cargoItem.candidates.length})
                  </div>
                  {cargoItem.candidates.map((cand, idx) => (
                    <div key={idx} className="bg-slate-800/50 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/60 transition-colors flex items-center justify-between">
                      <div className="truncate pr-2">
                        <div className="font-bold text-white text-xs truncate" title={cand.name}>
                          {idx === 0 && '👑 '} {cand.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Nº {cand.numCandidato || 'N/A'}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-mono font-bold text-emerald-400">
                          {cand.votos.toLocaleString()} votos
                        </div>
                        <div className="text-[11px] font-mono font-bold text-cyan-400 mt-0.5">
                          {cand.percent}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
