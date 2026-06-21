import {
  listarEmpresas,
  obtenerEmpresa,
  crearEmpresa,
  actualizarEmpresa,
  eliminarEmpresa,
} from '../db/queries/empresas.queries.js';

export async function listar(req, res, next) {
  try {
    const empresas = await listarEmpresas(req.user.id);
    res.json({ empresas });
  } catch (err) {
    next(err);
  }
}

export async function obtener(req, res, next) {
  try {
    const empresa = await obtenerEmpresa(req.params.id, req.user.id);
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });
    res.json({ empresa });
  } catch (err) {
    next(err);
  }
}

export async function crear(req, res, next) {
  try {
    const { razonSocial, cuit, actividad } = req.body;
    if (!razonSocial || !cuit) {
      return res.status(400).json({ error: 'Razón social y CUIT son obligatorios' });
    }
    const empresa = await crearEmpresa({ usuarioId: req.user.id, razonSocial, cuit, actividad });
    res.status(201).json({ empresa });
  } catch (err) {
    next(err);
  }
}

export async function actualizar(req, res, next) {
  try {
    const { razonSocial, cuit, actividad } = req.body;
    const empresa = await actualizarEmpresa(req.params.id, req.user.id, { razonSocial, cuit, actividad });
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });
    res.json({ empresa });
  } catch (err) {
    next(err);
  }
}

export async function eliminar(req, res, next) {
  try {
    const eliminada = await eliminarEmpresa(req.params.id, req.user.id);
    if (!eliminada) return res.status(404).json({ error: 'Empresa no encontrada' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
