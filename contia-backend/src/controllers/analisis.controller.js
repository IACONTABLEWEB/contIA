import { v4 as uuidv4 } from 'uuid';
import { obtenerBalance, listarCuentasPorBalance } from '../db/queries/balances.queries.js';
import { crearAnalisis, obtenerAnalisis, actualizarInformes } from '../db/queries/analisis.queries.js';
import { obtenerEmpresaPorId } from '../db/queries/empresas.queries.js';
import { compararCuentas, calcularRatios } from '../services/comparador.js';
import { generarAlertas } from '../services/iaAnalyzer.js';
import { generarInformeDocx, generarInformePdf } from '../services/exportService.js';
import { subirArchivo, urlFirmada } from '../services/objectStorage.js';

export async function crear(req, res, next) {
  try {
    const { balanceAId, balanceBId } = req.body;
    if (!balanceAId || !balanceBId) {
      return res.status(400).json({ error: 'balanceAId y balanceBId son obligatorios' });
    }

    const [balanceA, balanceB] = await Promise.all([
      obtenerBalance(balanceAId),
      obtenerBalance(balanceBId),
    ]);
    if (!balanceA || !balanceB) {
      return res.status(404).json({ error: 'Alguno de los balances no existe' });
    }
    if (balanceA.estado_proceso !== 'listo' || balanceB.estado_proceso !== 'listo') {
      return res.status(409).json({ error: 'Ambos balances deben estar procesados antes de comparar' });
    }

    const [cuentasA, cuentasB] = await Promise.all([
      listarCuentasPorBalance(balanceAId),
      listarCuentasPorBalance(balanceBId),
    ]);

    const variaciones = compararCuentas(cuentasA, cuentasB);
    const ratios = calcularRatios(cuentasB);
    const { alertas } = await generarAlertas(variaciones);

    const resultadoJson = { variaciones, ratios, alertas };
    const analisis = await crearAnalisis({ balanceAId, balanceBId, resultadoJson });

    res.status(201).json({ analisis });

    // Los informes se generan en background; el frontend los espera vía /status
    generarYGuardarInformes(analisis.id, { balanceA, balanceB, variaciones, ratios, alertas }).catch((err) => {
      console.error(`Error generando informes para análisis ${analisis.id}`, err);
    });
  } catch (err) {
    next(err);
  }
}

async function generarYGuardarInformes(analisisId, { balanceA, balanceB, variaciones, ratios, alertas }) {
  const empresa = await obtenerEmpresaPorId(balanceA.empresa_id);
  const datos = { empresa: empresa || { razon_social: 's/d' }, balanceA, balanceB, variaciones, ratios, alertas };

  const [docxBuffer, pdfBuffer] = await Promise.all([
    generarInformeDocx(datos),
    generarInformePdf(datos),
  ]);

  const keyDocx = `informes/${analisisId}-${uuidv4()}.docx`;
  const keyPdf = `informes/${analisisId}-${uuidv4()}.pdf`;

  await Promise.all([
    subirArchivo(docxBuffer, keyDocx, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
    subirArchivo(pdfBuffer, keyPdf, 'application/pdf'),
  ]);

  await actualizarInformes(analisisId, { informeDocx: keyDocx, informePdf: keyPdf });
}

export async function obtener(req, res, next) {
  try {
    const analisis = await obtenerAnalisis(req.params.id);
    if (!analisis) return res.status(404).json({ error: 'Análisis no encontrado' });
    res.json({ analisis });
  } catch (err) {
    next(err);
  }
}

export async function status(req, res, next) {
  try {
    const analisis = await obtenerAnalisis(req.params.id);
    if (!analisis) return res.status(404).json({ error: 'Análisis no encontrado' });
    res.json({ listo: Boolean(analisis.informe_docx && analisis.informe_pdf) });
  } catch (err) {
    next(err);
  }
}

export async function exportarDocx(req, res, next) {
  try {
    const analisis = await obtenerAnalisis(req.params.id);
    if (!analisis?.informe_docx) return res.status(404).json({ error: 'Informe no disponible aún' });
    const url = await urlFirmada(analisis.informe_docx);
    res.redirect(url);
  } catch (err) {
    next(err);
  }
}

export async function exportarPdf(req, res, next) {
  try {
    const analisis = await obtenerAnalisis(req.params.id);
    if (!analisis?.informe_pdf) return res.status(404).json({ error: 'Informe no disponible aún' });
    const url = await urlFirmada(analisis.informe_pdf);
    res.redirect(url);
  } catch (err) {
    next(err);
  }
}
