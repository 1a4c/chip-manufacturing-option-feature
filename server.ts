import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health API
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Gemini AI Diagnostic endpoint for Semiconductor Wafer Chamber
  app.post('/api/gemini/diagnose', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        return res.status(400).json({
          error: 'GEMINI_API_KEY is missing or invalid in environment variables.',
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const { telemetry, promptOverride, language = 'zh-TW' } = req.body;

      const langPrompt =
        language === 'zh-TW'
          ? 'Provide response in Traditional Chinese (繁體中文).'
          : 'Provide response in English.';

      const systemInstruction = `
You are a Lead Semiconductor Equipment Diagnostics AI Specialist specializing in Advanced Lithography, Tube Chamber Process Control, and Wafer Fabrication Machinery.

You are analyzing real-time machine telemetry parameters:
- Gamma Settle Tube Rotation (RPM, Settle Angle, Strapped[::2] mode, Tube Tilt)
- Valve Health & Fuel System (Tri-Ports Lux Projected: Port 1, Port 2, Port 3; Topple Sensor; Tube Plate Suppression)
- Beta Lens Event Queue (Limb Queue, Lens Picked Events, Focal Offset)
- Star Projected Anchored Pattern Matrix (Matrix Dies, Gamma Set Attributes, Isolation Zones)

Analyze the provided telemetry data and issue a comprehensive engineering diagnostic report in JSON format:
{
  "summary": "Brief executive summary of machine status",
  "overallHealthStatus": "Optimal" | "Caution" | "Action Required",
  "findings": [
    {
      "component": "Component name (e.g., Tri-Port Lux 2, Gamma Tube Bearing)",
      "issue": "Identified anomaly or risk",
      "recommendation": "Step-by-step engineering fix or parameter tweak",
      "severity": "low" | "medium" | "high"
    }
  ],
  "suggestedRecipeTweaks": {
    "rpmTweak": number (+ or - relative offset),
    "luxPort1Tweak": number (+ or - offset),
    "luxPort2Tweak": number (+ or - offset),
    "luxPort3Tweak": number (+ or - offset)
  },
  "language": "${language}"
}

${langPrompt}
Return ONLY valid raw JSON matching the schema above without markdown formatting wrappers if possible, or standard JSON inside triple backticks.
`;

      const userContent = promptOverride
        ? `User custom query: ${promptOverride}\nTelemetry context: ${JSON.stringify(
            telemetry
          )}`
        : `Analyze this live wafer chamber telemetry stream: ${JSON.stringify(
            telemetry
          )}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userContent,
        config: {
          systemInstruction,
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '{}';
      let jsonResult;
      try {
        jsonResult = JSON.parse(responseText);
      } catch {
        jsonResult = {
          summary: responseText,
          overallHealthStatus: 'Caution',
          findings: [],
          suggestedRecipeTweaks: {
            rpmTweak: 0,
            luxPort1Tweak: 0,
            luxPort2Tweak: 0,
            luxPort3Tweak: 0,
          },
          language,
        };
      }

      res.json(jsonResult);
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      res.status(500).json({ error: err?.message || 'Error executing Gemini diagnosis' });
    }
  });

  // Vite middleware setup
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
    console.log(`Wafer Chamber App Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
