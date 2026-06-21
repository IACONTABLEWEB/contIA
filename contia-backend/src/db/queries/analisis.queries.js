import { query } from '../../config/db.js';

export async function crearAnalisis({ balanceAId, balanceBId, resultadoJson }) {
  const { rows } = await query(
    `INSERT INTO analisis (balance_a_id, balance_b_id, resultado_json)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [balanceAId, balanceBId, resultadoJson]
  );
  return rows[0];
}

export async function obtenerAnalisis(id) {
  const { rows } = await query('SELECT * FROM analisis WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function actualizarInformes(id, { informeDocx, informePdf }) {
  const { rows } = await query(
    'UPDATE analisis SET informe_docx = $1, informe_pdf = $2 WHERE id = $3 RETURNING *',
    [informeDocx, informePdf, id]
  );
  return rows[0];
}

export async function listarAnalisisPorEmpresa(empresaId) {
  const { rows } = await query(
    `SELECT a.* FROM analisis a
     JOIN balances b ON b.id = a.balance_a_id
     WHERE b.empresa_id = $1
     ORDER BY a.fecha DESC`,
    [empresaId]
  );
  return rows;
}
