import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI client if API key is present
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

  // AI endpoint to parse raw text into structured vote/candidate records
  app.post('/api/ai/parse-text', async (req, res) => {
    try {
      const { text, sheetName } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Texto não fornecido.' });
      }

      if (!ai) {
        return res.status(500).json({ error: 'Chave da API Gemini (GEMINI_API_KEY) não configurada.' });
      }

      const prompt = `Você é um especialista em processamento de dados eleitorais brasileiros. 
O usuário forneceu o seguinte texto bruto contendo dados para a aba "${sheetName || 'Votos'}":
---
${text}
---

Extraia e estruture esses dados em formato JSON estrito (um array de objetos).
Para a aba "Votos", cada objeto deve conter:
- "SEÇÃO": número da seção eleitoral (número ou string)
- "VOTOS": quantidade de votos (número inteiro)
- "NUMCANDIDATO": número do candidato (número ou string)
- "CANDIDATO": nome do candidato
- "Unnamed: 4": Cargo ou Categoria (ex: Prefeito, Vereador, Deputado Federal, etc.)

Para a aba "Presidente", cada objeto deve conter:
- "SEÇÃO": número da seção
- "VOTOS": quantidade de votos
- "CANDIDATO": nome do candidato

Retorne APENAS um JSON válido contendo o array de registros extraídos, sem markdown de bloco de código adicional ou texto explicativo, exatamente assim:
[
  { "SEÇÃO": 101, "VOTOS": 145, "NUMCANDIDATO": 15, "CANDIDATO": "MDB - COLIGAÇÃO", "Unnamed: 4": "Vereador" }
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const rawText = response.text || '[]';
      // Clean up markdown code blocks if any
      const cleanedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const records = JSON.parse(cleanedJson);

      res.json({ success: true, records });
    } catch (err: any) {
      console.error('Erro ao processar texto com IA:', err);
      res.status(500).json({ error: err.message || 'Erro ao processar com IA' });
    }
  });

  // AI Chat endpoint for electoral consultation & insights
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, dataContext } = req.body;
      if (!ai) {
        return res.status(500).json({ error: 'Chave da API Gemini não configurada.' });
      }

      const systemInstruction = `Você é o UrnaAI, um assistente especialista em gerenciamento de dados eleitorais, apuração de votos, auditoria de planilhas VOTOS.xlsx e estratégias de campanha política no Brasil.
Você tem acesso aos dados atuais da eleição:
${JSON.stringify(dataContext || {}, null, 2)}

Responda de forma profissional, objetiva, analítica e em português do Brasil. Ajude o usuário a analisar os votos por seção, identificar os candidatos mais votados, verificar divergências ou inconsistências, e sugerir estratégias.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemInstruction}\n\nPergunta do usuário: ${message}` }] }
        ]
      });

      res.json({ success: true, reply: response.text });
    } catch (err: any) {
      console.error('Erro no chat da IA:', err);
      res.status(500).json({ error: err.message || 'Erro no chat' });
    }
  });

  // Vite middleware setup for development
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

startServer();
