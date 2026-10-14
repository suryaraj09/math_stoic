import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for base64 images
  app.use(express.json({ limit: '50mb' }));

  app.post('/api/chat', async (req, res) => {
    try {
      const { history, message, imageBase64, mimeType } = req.body;

      const systemInstruction = `You are a compassionate, Socratic AI math tutor. Your goal is to guide the student to the answer themselves, never just giving them the solution directly. 
When the user uploads a photo of a complex calculus or algebra problem:
1. Walk them through ONLY the first step. Wait for their response.
2. If they get stuck or ask "Why did we do that?", explain JUST that specific concept in a patient, encouraging way before moving on.
3. Keep your tone supportive and conversational, like sitting with a patient teacher, not a calculator.
4. Format math formulas cleanly.
5. If the user successfully completes a step, praise them and prompt the next step.`;

      const contents = [];
      
      if (history && history.length > 0) {
        for (const msg of history) {
          contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }],
          });
        }
      }
      
      const currentParts: any[] = [];
      if (imageBase64 && mimeType) {
        currentParts.push({
          inlineData: {
            data: imageBase64,
            mimeType: mimeType,
          },
        });
      }
      currentParts.push({ text: message || '' });
      
      contents.push({
        role: 'user',
        parts: currentParts,
      });

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: contents,
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          },
        });

        res.json({ text: response.text });
      } catch (error: any) {
        console.error('Gemini API Error (Pro):', error);
        
        // Check if it's a 429 Quota/Rate Limit Error
        const isQuotaError = error.status === 429 || (error.message && error.message.includes('429'));
        
        if (isQuotaError) {
          console.log('Falling back to gemini-3.5-flash due to rate limit...');
          try {
            const fallbackResponse = await ai.models.generateContent({
              model: 'gemini-3.5-flash',
              contents: contents,
              config: {
                systemInstruction,
              },
            });
            res.json({ text: fallbackResponse.text });
            return;
          } catch (fallbackError: any) {
            console.error('Gemini API Error (Fallback):', fallbackError);
            res.status(429).json({ error: 'Rate limit exceeded for all models. Please try again later.' });
            return;
          }
        }
        
        throw error;
      }
    } catch (error: any) {
      console.error('Server Error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate response' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
