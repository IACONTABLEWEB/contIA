import { query } from '../../config/db.js';

export async function findUsuarioPorEmail(email) {
  const { rows } = await query('SELECT * FROM usuarios WHERE email = $1', [email]);
  return rows[0] || null;
}

export async function findUsuarioPorId(id) {
  const { rows } = await query(
    'SELECT id, nombre, email, plan, created_at FROM usuarios WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

export async function crearUsuario({ nombre, email, passwordHash }) {
  const { rows } = await query(
    `INSERT INTO usuarios (nombre, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, nombre, email, plan, created_at`,
    [nombre, email, passwordHash]
  );
  return rows[0];
}
