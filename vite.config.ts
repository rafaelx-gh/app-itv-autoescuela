import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

function itvApiPlugin(): Plugin {
  return {
    name: 'itv-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/scan-itv', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json');
          try {
            const data = JSON.parse(body || '{}');
            const { image, mimeType } = data;

            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
              res.statusCode = 200;
              res.end(JSON.stringify({
                simulated: true,
                message: 'No GEMINI_API_KEY found in environment; using local smart OCR engine.'
              }));
              return;
            }

            // Extract base64 payload if data URL is provided
            let base64Data = image;
            let actualMime = mimeType || 'image/jpeg';
            if (typeof image === 'string' && image.includes('base64,')) {
              const parts = image.split('base64,');
              base64Data = parts[1];
              const match = parts[0].match(/:(.*?);/);
              if (match) actualMime = match[1];
            }

            const ai = new GoogleGenAI({ apiKey });
            const prompt = `Eres un perito experto en documentación vehicular oficial de España (Ficha Técnica de ITV y Tarjeta de Inspección Técnica de la DGT para vehículos de autoescuela / enseñanza de la conducción).
Analiza con máxima precisión la imagen de este documento de inspección técnica o permiso.
Extrae los siguientes datos y responde ÚNICAMENTE con un JSON válido con este formato exacto:
{
  "matricula": "string (ej: 4582 LKP)",
  "tipo": "coche" o "moto",
  "marca": "string (ej: SEAT, YAMAHA, RENAULT, PEUGEOT)",
  "modelo": "string (ej: IBIZA 1.0 TSI, MT-07, CLIO)",
  "fechaCaducidadITV": "YYYY-MM-DD (fecha límite de validez de la próxima ITV)",
  "fechaMatriculacion": "YYYY-MM-DD o vacio",
  "bastidor": "string (VIN o número de bastidor si aparece)",
  "combustible": "Gasolina" | "Diésel" | "Híbrido" | "Eléctrico",
  "dobleMando": boolean (true si detectas reforma de doble mando, pedales dobles, autoescuela o enseñanza)",
  "observaciones": "string (breve resumen de inspección favorable o notas)"
}`;

            const response = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      inlineData: {
                        mimeType: actualMime,
                        data: base64Data
                      }
                    },
                    {
                      text: prompt
                    }
                  ]
                }
              ]
            });

            const text = response.text || '';
            // Clean markdown code blocks if any
            const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned);

            res.statusCode = 200;
            res.end(JSON.stringify({
              success: true,
              data: parsed,
              source: 'gemini-3.8-flash'
            }));
          } catch (err: any) {
            console.error('Error in /api/scan-itv:', err?.message || err);
            res.statusCode = 200;
            res.end(JSON.stringify({
              simulated: true,
              error: err?.message || 'Error processing image with Gemini',
              message: 'Falling back to local smart OCR simulation'
            }));
          }
        });
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), itvApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
