// Extracción de cuentas de un balance en PDF vía Claude Vision.
// Mismo patrón que ya probaste en control-rt54: render de cada página a PNG
// a escala 3.0 y envío como imágenes al modelo, sin pedirle cálculos propios.
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from 'canvas';
import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env.js';

const anthropic = new Anthropic({ apiKey: env.anthropicApiKey });

const PROMPT_EXTRACCION = `Sos un asistente contable experto en normas contables argentinas (RT y CPCE).
Te voy a pasar imágenes de un balance en PDF. Extraé TODAS las cuentas del Estado de Situación Patrimonial
y del Estado de Resultados, con su importe exacto tal como figura en el documento.

Devolvé EXCLUSIVAMENTE un JSON con este formato, sin texto adicional ni markdown:
{
  "ejercicio": <año del ejercicio, número>,
  "cuentas": [
    { "codigo": "<código o null>", "nombre": "<nombre de la cuenta>", "importe": <número, sin separadores de miles>, "rubro": "activo|pasivo|patrimonio_neto|resultados" }
  ]
}

Reglas:
- No inventes cuentas ni importes. Si un valor no es legible, omitilo.
- Los importes van en negativo si están entre paréntesis o tienen signo negativo en el original.
- No hagas ningún cálculo aritmético, solo transcribí lo que figura en el documento.`;

async function renderizarPaginasComoPNG(pdfBuffer) {
  const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
  const imagenes = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 3.0 });
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');
    await page.render({ canvasContext: context, viewport }).promise;
    imagenes.push(canvas.toBuffer('image/png'));
  }

  return imagenes;
}

export async function extraerCuentasDeBalance(pdfBuffer) {
  const paginas = await renderizarPaginasComoPNG(pdfBuffer);

  const content = [
    { type: 'text', text: PROMPT_EXTRACCION },
    ...paginas.map((png) => ({
      type: 'image',
      source: { type: 'base64', media_type: 'image/png', data: png.toString('base64') },
    })),
  ];

  const response = await anthropic.messages.create({
    model: env.anthropicModel,
    max_tokens: 8000,
    messages: [{ role: 'user', content }],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock) {
    throw new Error('La IA no devolvió texto en la respuesta de extracción');
  }

  const limpio = textBlock.text.replace(/```json|```/g, '').trim();
  return JSON.parse(limpio);
}
