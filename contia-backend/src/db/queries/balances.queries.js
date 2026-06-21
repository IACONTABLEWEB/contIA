import { query } from '../../config/db.js';

export async function crearBalance({ empresaId, ejercicio, archivoPdf }) {
  const { rows } = await query(
    `INSERT INTO balances (empresa_id, ejercicio, archivo_pdf, estado_proceso)
     VALUES ($1, $2, $3, 'pendiente')
     RETURNING *`,
    [empresaId, ejercicio, archivoPdf]
  );
  return rows[0];
}

export async function actualizarEstadoBalance(id, estado, errorDetalle = null) {
  const { rows } = await query(
    `UPDATE balances SET estado_proceso = $1, error_detalle = $2 WHERE id = $3 RETURNING *`,
    [estado, errorDetalle, id]
  );
  return rows[0];
}

export async function listarBalancesPorEmpresa(empresaId) {
  const { rows } = await query(
    'SELECT * FROM balances WHERE empresa_id = $1 ORDER BY ejercicio DESC',
    [empresaId]
  );
  return rows;
}

export async function obtenerBalance(id) {
  const { rows } = await query('SELECT * FROM balances WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function guardarCuentas(balanceId, cuentas) {
  if (cuentas.length === 0) return [];

  const values = [];
  const placeholders = cuentas
    .map((c, i) => {
      const offset = i * 5;
      values.push(balanceId, c.codigo || null, c.nombre, c.importe, c.rubro || null);
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`;
    })
    .join(', ');

  const { rows } = await query(
    `INSERT INTO cuentas_balance (balance_id, codigo, nombre, importe, rubro)
     VALUES ${placeholders}
     RETURNING *`,
    values
  );
  return rows;
}

export async function listarCuentasPorBalance(balanceId) {
  const { rows } = await query(
    'SELECT * FROM cuentas_balance WHERE balance_id = $1 ORDER BY orden NULLS LAST, nombre',
    [balanceId]
  );
  return rows;
}
