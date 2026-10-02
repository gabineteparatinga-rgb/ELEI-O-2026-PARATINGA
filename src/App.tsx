/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveTab, VotoRecord, PresidenteRecord, CandidatoRecord, SecaoRecord } from './types';
import { initialVotosData, initialPresidenteData, initialSecoesData } from './utils/excel';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { TableView } from './components/TableView';
import { CandidatosView } from './components/CandidatosView';
import { SecoesView } from './components/SecoesView';
import { CandidateManagerModal } from './components/CandidateManagerModal';
import { AiParserModal } from './components/AiParserModal';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  
  // Database persistence via localStorage with fallback to initial data
  const [votos, setVotos] = useState<VotoRecord[]>(() => {
    try {
      const saved = localStorage.getItem('urna_votos');
      return saved ? JSON.parse(saved) : initialVotosData;
    } catch {
      return initialVotosData;
    }
  });

  const [presidente, setPresidente] = useState<PresidenteRecord[]>(() => {
    try {
      const saved = localStorage.getItem('urna_presidente');
      return saved ? JSON.parse(saved) : initialPresidenteData;
    } catch {
      return initialPresidenteData;
    }
  });

  const [candidatos, setCandidatos] = useState<CandidatoRecord[]>(() => {
    try {
      const saved = localStorage.getItem('urna_candidatos');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [secoes, setSecoes] = useState<SecaoRecord[]>(() => {
    try {
      const saved = localStorage.getItem('urna_secoes');
      return saved ? JSON.parse(saved) : initialSecoesData;
    } catch {
      return initialSecoesData;
    }
  });

  // Save changes to localStorage (database persistence)
  useEffect(() => {
    localStorage.setItem('urna_votos', JSON.stringify(votos));
  }, [votos]);

  useEffect(() => {
    localStorage.setItem('urna_presidente', JSON.stringify(presidente));
  }, [presidente]);

  useEffect(() => {
    localStorage.setItem('urna_candidatos', JSON.stringify(candidatos));
  }, [candidatos]);

  useEffect(() => {
    localStorage.setItem('urna_secoes', JSON.stringify(secoes));
  }, [secoes]);

  // Modals state
  const [isNewRecordOpen, setIsNewRecordOpen] = useState(false);
  const [isAiParserOpen, setIsAiParserOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  const handleDataLoaded = (newVotos: VotoRecord[], newPresidente: PresidenteRecord[]) => {
    if (newVotos.length > 0) setVotos(newVotos);
    if (newPresidente.length > 0) setPresidente(newPresidente);
  };

  return (
    <div className="min-h-full bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        votos={votos}
        presidente={presidente}
        candidatosCount={candidatos.length}
        secoesCount={secoes.length}
        onDataLoaded={handleDataLoaded}
        onOpenNewRecord={() => setIsNewRecordOpen(true)}
        onOpenAiParser={() => setIsAiParserOpen(true)}
        onOpenAiChat={() => setIsAiChatOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardView votos={votos} presidente={presidente} />
        )}

        {activeTab === 'votos' && (
          <TableView
            type="votos"
            votos={votos}
            presidente={presidente}
            onUpdateVotos={setVotos}
            onUpdatePresidente={setPresidente}
            onOpenNewRecord={() => setIsNewRecordOpen(true)}
          />
        )}

        {activeTab === 'presidente' && (
          <TableView
            type="presidente"
            votos={votos}
            presidente={presidente}
            onUpdateVotos={setVotos}
            onUpdatePresidente={setPresidente}
            onOpenNewRecord={() => setIsNewRecordOpen(true)}
          />
        )}

        {activeTab === 'candidatos' && (
          <CandidatosView
            candidatos={candidatos}
            onUpdateCandidatos={setCandidatos}
          />
        )}

        {activeTab === 'secoes' && (
          <SecoesView
            secoes={secoes}
            onUpdateSecoes={setSecoes}
          />
        )}
      </main>

      {/* Modals & Drawers */}
      <CandidateManagerModal
        isOpen={isNewRecordOpen}
        onClose={() => setIsNewRecordOpen(false)}
        votos={votos}
        presidente={presidente}
        secoes={secoes}
        candidatos={candidatos}
        onUpdateVotos={setVotos}
        onUpdatePresidente={setPresidente}
      />

      <AiParserModal
        isOpen={isAiParserOpen}
        onClose={() => setIsAiParserOpen(false)}
        votos={votos}
        presidente={presidente}
        onUpdateVotos={setVotos}
        onUpdatePresidente={setPresidente}
      />

      <AiAssistantDrawer
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        votos={votos}
        presidente={presidente}
      />
    </div>
  );
}
