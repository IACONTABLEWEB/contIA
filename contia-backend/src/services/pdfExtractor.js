// Extracción de cuentas de un balance en PDF vía Claude Vision.
// Mismo patrón que ya probaste en control-rt54: render de cada página a PNG
// a escala 3.0 y envío como imágenes al modelo, sin pedirle cálculos propios.
//
// IMPORTANTE — desarrollo local en Windows:
// `pdfjs-dist` + `canvas` se importan de forma DINÁMICA (no al tope del archivo)
// para que el servidor pueda arrancar aunque `canvas` no esté compilado en tu
// máquina (problema típico en Windows sin GTK). Si en tu .env ponés
// PDF_EXTRACTION_MODE=mock, esta función devuelve cuentas de prueba sin tocar
// el PDF real, así podés probar todo el resto del flujo (login, empresas,
// comparación, informes) sin pelear con la instalación de `canvas`.
//
// En Render, el Dockerfile ya instala las librerías nativas que `canvas`
// necesita, así que ahí corre con PDF_EXTRACTION_MODE sin definir (modo real).
import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env.js';

const anthropic = new Anthropic({ apiKey: env.anthropicApiKey });

const MODO_MOCK = process.env.PDF_EXTRACTION_MODE === 'mock';

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
  // Imports dinámicos: si estos paquetes no están instalados/compilados,
  // el resto del servidor sigue funcionando igual.
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const { createCanvas } = await import('canvas');

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

function datosSimulados() {
  console.warn(
    '[pdfExtractor] PDF_EXTRACTION_MODE=mock activo: devolviendo cuentas de prueba, NO se leyó el PDF real.'
  );
  return {
    ejercicio: new Date().getFullYear(),
    cuentas: [
      { codigo: '1.1.01', nombre: 'Caja y Bancos', importe: 1500000, rubro: 'activo' },
      { codigo: '1.1.02', nombre: 'Créditos por Ventas', importe: 3200000, rubro: 'activo' },
      { codigo: '1.2.01', nombre: 'Bienes de Uso', importe: 4500000, rubro: 'activo' },
      { codigo: '2.1.01', nombre: 'Proveedores', importe: 1800000, rubro: 'pasivo' },
      { codigo: '2.1.02', nombre: 'Cargas Sociales a Pagar', importe: 600000, rubro: 'pasivo' },
      { codigo: '3.1.01', nombre: 'Capital Social', importe: 2000000, rubro: 'patrimonio_neto' },
      { codigo: '3.2.01', nombre: 'Resultados Acumulados', importe: 4800000, rubro: 'patrimonio_neto' },
      { codigo: '4.1.01', nombre: 'Ventas', importe: 9500000, rubro: 'resultados' },
      { codigo: '4.2.01', nombre: 'Costo de Ventas', importe: -5200000, rubro: 'resultados' },
    ],
  };
}

export async function extraerCuentasDeBalance(pdfBuffer) {
  if (MODO_MOCK) {
    return datosSimulados();
  }

  let paginas;
  try {
    paginas = await renderizarPaginasComoPNG(pdfBuffer);
  } catch (err) {
    throw new Error(
      `No se pudo renderizar el PDF (probablemente falta 'canvas' compilado en este entorno). ` +
        `Para desarrollo local sin esa dependencia, poné PDF_EXTRACTION_MODE=mock en tu .env. ` +
        `Error original: ${err.message}`
    );
  }

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
