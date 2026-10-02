import React, { useRef } from 'react';
import { 
  BarChart3, 
  FileSpreadsheet, 
  Users, 
  Bot, 
  Upload, 
  Download, 
  Sparkles, 
  PlusCircle,
  Vote,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { ActiveTab, VotoRecord, PresidenteRecord } from '../types';
import { parseExcelFile, exportToExcel } from '../utils/excel';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  votos: VotoRecord[];
  presidente: PresidenteRecord[];
  candidatosCount: number;
  secoesCount: number;
  onDataLoaded: (votos: VotoRecord[], presidente: PresidenteRecord[]) => void;
  onOpenNewRecord: () => void;
  onOpenAiParser: () => void;
  onOpenAiChat: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  votos,
  presidente,
  candidatosCount,
  secoesCount,
  onDataLoaded,
  onOpenNewRecord,
  onOpenAiParser,
  onOpenAiChat,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await parseExcelFile(file);
      onDataLoaded(data.votos, data.presidente);
      alert(`Planilha VOTOS.xlsx importada com sucesso! ${data.votos.length} votos carregados.`);
    } catch (err) {
      console.error(err);
      alert('Erro ao ler arquivo Excel. Verifique se o formato é válido.');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Vote className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">UrnaAI</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  VOTOS.xlsx
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Gestão Inteligente de Dados Eleitorais</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex space-x-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Painel</span>
            </button>

            <button
              onClick={() => setActiveTab('votos')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'votos'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Aba "Votos" ({votos.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('presidente')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'presidente'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Aba "Presidente" ({presidente.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('candidatos')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'candidatos'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Candidatos ({candidatosCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('secoes')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'secoes'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Seções ({secoesCount})</span>
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium rounded-lg border border-slate-700 transition-colors shadow-sm"
              title="Importar planilha VOTOS.xlsx"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Importar</span>
            </button>

            <button
              onClick={() => exportToExcel(votos, presidente)}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium rounded-lg border border-slate-700 transition-colors shadow-sm"
              title="Baixar VOTOS.xlsx atualizado"
            >
              <Download className="w-4 h-4 text-teal-400" />
              <span className="hidden sm:inline">Exportar .xlsx</span>
            </button>

            <button
              onClick={onOpenAiParser}
              className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs sm:text-sm font-medium rounded-lg border border-indigo-500/30 transition-colors shadow-sm"
              title="Importar Texto com IA"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="hidden lg:inline">IA Parser</span>
            </button>

            <button
              onClick={onOpenNewRecord}
              className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-medium rounded-lg shadow-lg shadow-emerald-600/20 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Registro</span>
            </button>

            <button
              onClick={onOpenAiChat}
              className="p-2 bg-gradient-to-tr from-emerald-500 to-teal-500 text-white rounded-lg shadow-lg shadow-emerald-500/30 hover:opacity-90 transition-opacity"
              title="Chat com UrnaAI"
            >
              <Bot className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="flex md:hidden py-2 border-t border-slate-800/80 space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400'
            }`}
          >
            Painel
          </button>
          <button
            onClick={() => setActiveTab('votos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'votos' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400'
            }`}
          >
            Votos ({votos.length})
          </button>
          <button
            onClick={() => setActiveTab('presidente')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'presidente' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400'
            }`}
          >
            Presidente ({presidente.length})
          </button>
          <button
            onClick={() => setActiveTab('candidatos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'candidatos' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400'
            }`}
          >
            Candidatos ({candidatosCount})
          </button>
          <button
            onClick={() => setActiveTab('secoes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'secoes' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400'
            }`}
          >
            Seções ({secoesCount})
          </button>
        </div>
      </div>
    </header>
  );
};
