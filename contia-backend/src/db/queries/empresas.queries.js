import { query } from '../../config/db.js';

export async function listarEmpresas(usuarioId) {
  const { rows } = await query(
    'SELECT * FROM empresas WHERE usuario_id = $1 ORDER BY razon_social',
    [usuarioId]
  );
  return rows;
}

export async function obtenerEmpresa(id, usuarioId) {
  const { rows } = await query(
    'SELECT * FROM empresas WHERE id = $1 AND usuario_id = $2',
    [id, usuarioId]
  );
  return rows[0] || null;
}

// Variante sin filtro de usuario, para uso interno (ej: generar informes en background).
// No exponer directamente en un endpoint sin validar pertenencia.
export async function obtenerEmpresaPorId(id) {
  const { rows } = await query('SELECT * FROM empresas WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function crearEmpresa({ usuarioId, razonSocial, cuit, actividad }) {
  const { rows } = await query(
    `INSERT INTO empresas (usuario_id, razon_social, cuit, actividad)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [usuarioId, razonSocial, cuit, actividad || null]
  );
  return rows[0];
}

export async function actualizarEmpresa(id, usuarioId, { razonSocial, cuit, actividad }) {
  const { rows } = await query(
    `UPDATE empresas SET razon_social = $1, cuit = $2, actividad = $3
     WHERE id = $4 AND usuario_id = $5
     RETURNING *`,
    [razonSocial, cuit, actividad || null, id, usuarioId]
  );
  return rows[0] || null;
}

export async function eliminarEmpresa(id, usuarioId) {
  const { rowCount } = await query(
    'DELETE FROM empresas WHERE id = $1 AND usuario_id = $2',
    [id, usuarioId]
  );
  return rowCount > 0;
}
