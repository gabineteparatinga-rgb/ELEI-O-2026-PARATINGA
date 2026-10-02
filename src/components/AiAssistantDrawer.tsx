import React, { useState, useRef, useEffect } from 'react';
import { VotoRecord, PresidenteRecord } from '../types';
import { Bot, X, Send, Sparkles, User, Loader2 } from 'lucide-react';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  votos: VotoRecord[];
  presidente: PresidenteRecord[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  votos,
  presidente,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou o **UrnaAI**, seu consultor especialista em dados eleitorais e na planilha `VOTOS.xlsx`. Como posso ajudar na análise da apuração, verificação de seções ou estratégias de campanha?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const dataContext = {
        totalVotosVotosTab: votos.reduce((acc, c) => acc + Number(c.VOTOS || 0), 0),
        totalSecoes: new Set(votos.map(v => v.SEÇÃO)).size,
        votosRegistros: votos.slice(0, 30), // summary sample
        presidenteRegistros: presidente,
      };

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, dataContext })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro na resposta da IA');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Desculpe, ocorreu um erro ao consultar a IA: ${err.message || 'Erro desconhecido'}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center">
                UrnaAI Expert
                <Sparkles className="w-3.5 h-3.5 ml-1.5 text-emerald-400" />
              </h2>
              <p className="text-xs text-slate-400">Consultor Eleitoral com IA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${
                msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 border border-slate-700 text-emerald-400'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-3.5 rounded-2xl text-sm max-w-[80%] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-800/90 border border-slate-700/80 text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 text-sm flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>UrnaAI está analisando os dados...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompt Pills */}
        <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-900/50 flex space-x-2 overflow-x-auto">
          <button
            onClick={() => setInput('Quais foram os candidatos mais votados na aba Votos?')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 whitespace-nowrap border border-slate-700"
          >
            📊 Top Candidatos
          </button>
          <button
            onClick={() => setInput('Faça uma análise crítica da distribuição por seção.')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 whitespace-nowrap border border-slate-700"
          >
            🔍 Auditoria de Seções
          </button>
          <button
            onClick={() => setInput('Que estratégias de campanha devo focar com base nestes números?')}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 whitespace-nowrap border border-slate-700"
          >
            🎯 Estratégia
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Digite sua dúvida sobre a eleição..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
