import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { VotoRecord, PresidenteRecord } from '../types';
import { Vote, Users, Layers, Award, TrendingUp, FileCheck } from 'lucide-react';

interface DashboardViewProps {
  votos: VotoRecord[];
  presidente: PresidenteRecord[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ votos, presidente }) => {
  // Calculations for Votos
  const totalVotosGeral = votos.reduce((acc, curr) => acc + Number(curr.VOTOS || 0), 0);
  const totalSecoesGeral = new Set(votos.map(v => v.SEÇÃO)).size;
  const totalCandidatosUnicos = new Set(votos.map(v => v.NUMCANDIDATO)).size;

  // Group votes by candidate for "Votos" with Percentage
  const votosPorCandidatoMap: { [key: string]: { name: string; votos: number; cargo: string } } = {};
  votos.forEach(v => {
    const key = String(v.CANDIDATO || 'Desconhecido');
    if (!votosPorCandidatoMap[key]) {
      votosPorCandidatoMap[key] = { name: key, votos: 0, cargo: v['Unnamed: 4'] || 'Geral' };
    }
    votosPorCandidatoMap[key].votos += Number(v.VOTOS || 0);
  });
  
  const votosPorCandidatoData = Object.values(votosPorCandidatoMap).map(item => ({
    ...item,
    percent: totalVotosGeral > 0 ? Number(((item.votos / totalVotosGeral) * 100).toFixed(1)) : 0
  })).sort((a, b) => b.votos - a.votos);

  // Group votes by Cargo / Unnamed: 4 with Percentage
  const votosPorCargoMap: { [key: string]: number } = {};
  votos.forEach(v => {
    const cargo = v['Unnamed: 4'] || 'Não especificado';
    votosPorCargoMap[cargo] = (votosPorCargoMap[cargo] || 0) + Number(v.VOTOS || 0);
  });
  
  const votosPorCargoData = Object.keys(votosPorCargoMap).map(cargo => {
    const votosCargo = votosPorCargoMap[cargo];
    return {
      name: cargo,
      votos: votosCargo,
      percent: totalVotosGeral > 0 ? Number(((votosCargo / totalVotosGeral) * 100).toFixed(1)) : 0
    };
  }).sort((a, b) => b.votos - a.votos);

  // Calculations for Presidente
  const totalVotosPresidente = presidente.reduce((acc, curr) => acc + Number(curr.VOTOS || 0), 0);
  const presidenteMap: { [key: string]: number } = {};
  presidente.forEach(p => {
    const nome = p.CANDIDATO || 'Outros';
    presidenteMap[nome] = (presidenteMap[nome] || 0) + Number(p.VOTOS || 0);
  });
  const presidenteData = Object.keys(presidenteMap).map(nome => ({
    name: nome,
    votos: presidenteMap[nome]
  })).sort((a, b) => b.votos - a.votos);

  const liderPresidente = presidenteData[0]?.name || 'N/A';
  const liderVotosGeral = votosPorCandidatoData[0]?.name || 'N/A';

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">Painel Executivo Eleitoral</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Visão Geral da Apuração</h1>
          <p className="text-slate-400 text-sm mt-1">
            Análise em tempo real de votos por candidato e cargos em quantidade e percentual (%).
          </p>
        </div>
        <div className="flex items-center space-x-3 bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700/60">
          <FileCheck className="w-5 h-5 text-emerald-400" />
          <div className="text-xs">
            <div className="text-slate-300 font-medium">Status dos Dados</div>
            <div className="text-emerald-400 font-bold">Sincronizado & Validado</div>
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
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Candidatos Cadastrados</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{totalCandidatosUnicos}</span>
            <span className="text-xs text-indigo-400 font-medium">Na apuração</span>
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm relative overflow-hidden group hover:border-amber-500/50 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Líder Geral (Votos)</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-lg font-bold text-white truncate block" title={liderVotosGeral}>
              {liderVotosGeral}
            </span>
            <span className="text-xs text-amber-400 font-medium">Destaque na apuração</span>
          </div>
        </div>
      </div>

      {/* Charts Grid by Candidate and Cargo with Quantity & % Percentage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Votes per Candidate Bar Chart (Quantity & %) */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Votos por Candidato (Quantidade & %)</h2>
              <p className="text-xs text-slate-400">Desempenho absoluto e percentual de cada candidato</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20">
              Por Candidato
            </span>
          </div>

          <div className="h-80 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={votosPorCandidatoData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={130} tick={{ fill: '#cbd5e1' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                  formatter={(value: any, name: any) => [
                    name === 'votos' ? `${value.toLocaleString()} votos` : `${value}%`,
                    name === 'votos' ? 'Quantidade' : 'Percentual'
                  ]}
                />
                <Bar dataKey="votos" name="votos" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed breakdown list with % */}
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 max-h-48 overflow-y-auto pr-1">
            {votosPorCandidatoData.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs bg-slate-800/40 p-2.5 rounded-xl">
                <div className="truncate pr-2">
                  <span className="font-semibold text-white">{c.name}</span>
                  <span className="text-slate-400 ml-1.5">({c.cargo})</span>
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                  <span className="font-mono font-bold text-emerald-400">{c.votos.toLocaleString()} votos</span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 font-bold rounded font-mono">{c.percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Votes by Cargo / Category (Quantity & %) */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Votos por Cargo / Categoria (Quantidade & %)</h2>
              <p className="text-xs text-slate-400">Distribuição proporcional por cargo eleitoral</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 font-medium border border-cyan-500/20">
              Por Cargos
            </span>
          </div>

          <div className="h-80 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={votosPorCargoData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                  formatter={(value: any, name: any) => [
                    name === 'votos' ? `${value.toLocaleString()} votos` : `${value}%`,
                    name === 'votos' ? 'Quantidade' : 'Percentual'
                  ]}
                />
                <Bar dataKey="votos" name="votos" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed breakdown list with % for Cargos */}
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 max-h-48 overflow-y-auto pr-1">
            {votosPorCargoData.map((cg, i) => (
              <div key={i} className="flex items-center justify-between text-xs bg-slate-800/40 p-2.5 rounded-xl">
                <div className="truncate pr-2">
                  <span className="font-semibold text-white">{cg.name}</span>
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                  <span className="font-mono font-bold text-cyan-400">{cg.votos.toLocaleString()} votos</span>
                  <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-300 font-bold rounded font-mono">{cg.percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Presidente Section Overview */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-slate-800 gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Aba "Presidente" - Resumo de Apuração</h2>
            <p className="text-xs text-slate-400">Total de {totalVotosPresidente} votos apurados para Presidente</p>
          </div>
          <div className="flex items-center space-x-2 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span>Líder Presidente: {liderPresidente}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {presidenteData.map((item, idx) => (
            <div key={idx} className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
              <div className="text-xs text-slate-400 font-medium">{item.name}</div>
              <div className="text-2xl font-black text-white mt-1">{item.votos.toLocaleString()}</div>
              <div className="text-xs text-emerald-400 mt-2 font-medium">
                {totalVotosPresidente > 0 ? ((item.votos / totalVotosPresidente) * 100).toFixed(1) : 0}% dos votos
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
