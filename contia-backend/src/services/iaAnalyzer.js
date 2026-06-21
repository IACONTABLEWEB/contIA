import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env.js';

const anthropic = new Anthropic({ apiKey: env.anthropicApiKey });

const PROMPT_ALERTAS = `Sos un contador senior revisando la comparación entre dos ejercicios de un balance.
Te paso la lista de variaciones (cuenta, importe ejercicio A, importe ejercicio B, variación absoluta y %).

Generá alertas relevantes, cada una clasificada como "ERROR" (algo que parece un problema real:
inconsistencia, variación extrema sin justificación aparente, cuenta que desaparece sin explicación)
u "OBSERVACION" (algo a tener en cuenta pero no necesariamente un problema: crecimiento/caída
significativa pero plausible, cambio de composición).

No hagas cálculos aritméticos propios, basate solo en los datos que te paso.

Devolvé EXCLUSIVAMENTE un JSON, sin texto adicional:
{
  "alertas": [
    { "tipo": "ERROR|OBSERVACION", "cuenta": "<nombre>", "mensaje": "<explicación breve, 1-2 oraciones>" }
  ]
}`;

export async function generarAlertas(variaciones) {
  const response = await anthropic.messages.create({
    model: env.anthropicModel,
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: `${PROMPT_ALERTAS}\n\nVariaciones:\n${JSON.stringify(variaciones, null, 2)}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock) return { alertas: [] };

  const limpio = textBlock.text.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(limpio);
  } catch {
    return { alertas: [] };
  }
}
