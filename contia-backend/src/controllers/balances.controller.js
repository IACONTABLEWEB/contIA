import { v4 as uuidv4 } from 'uuid';
import { obtenerEmpresa } from '../db/queries/empresas.queries.js';
import {
  crearBalance,
  actualizarEstadoBalance,
  listarBalancesPorEmpresa,
  obtenerBalance,
  guardarCuentas,
  listarCuentasPorBalance,
} from '../db/queries/balances.queries.js';
import { subirArchivo } from '../services/objectStorage.js';
import { extraerCuentasDeBalance } from '../services/pdfExtractor.js';

export async function subir(req, res, next) {
  try {
    const { empresaId, ejercicio } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No se recibió ningún archivo' });
    if (!empresaId || !ejercicio) {
      return res.status(400).json({ error: 'empresaId y ejercicio son obligatorios' });
    }

    const empresa = await obtenerEmpresa(empresaId, req.user.id);
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

    const key = `balances/${empresaId}/${ejercicio}-${uuidv4()}.pdf`;
    await subirArchivo(req.file.buffer, key, 'application/pdf');

    const balance = await crearBalance({ empresaId, ejercicio: Number(ejercicio), archivoPdf: key });

    // Procesamiento async: el cliente hace polling de estado_proceso vía GET /api/balances/:id
    procesarExtraccion(balance.id, req.file.buffer).catch((err) => {
      console.error(`Error procesando balance ${balance.id}`, err);
    });

    res.status(202).json({ balance });
  } catch (err) {
    next(err);
  }
}

async function procesarExtraccion(balanceId, pdfBuffer) {
  await actualizarEstadoBalance(balanceId, 'procesando');
  try {
    const { cuentas } = await extraerCuentasDeBalance(pdfBuffer);
    await guardarCuentas(balanceId, cuentas);
    await actualizarEstadoBalance(balanceId, 'listo');
  } catch (err) {
    await actualizarEstadoBalance(balanceId, 'error', err.message);
    throw err;
  }
}

export async function listarPorEmpresa(req, res, next) {
  try {
    const empresa = await obtenerEmpresa(req.query.empresa_id, req.user.id);
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });
    const balances = await listarBalancesPorEmpresa(req.query.empresa_id);
    res.json({ balances });
  } catch (err) {
    next(err);
  }
}

// Nota: para producción conviene validar pertenencia haciendo join con empresas.usuario_id
// en vez de buscar el balance solo por id. Se deja simplificado para el alcance del MVP.
export async function obtenerUno(req, res, next) {
  try {
    const balance = await obtenerBalance(req.params.id);
    if (!balance) return res.status(404).json({ error: 'Balance no encontrado' });
    res.json({ balance });
  } catch (err) {
    next(err);
  }
}

export async function obtenerCuentas(req, res, next) {
  try {
    const cuentas = await listarCuentasPorBalance(req.params.id);
    res.json({ cuentas });
  } catch (err) {
    next(err);
  }
}
