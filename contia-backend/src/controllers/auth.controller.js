import { hashPassword, verifyPassword } from '../utils/hash.js';
import { signToken } from '../utils/jwt.js';
import { crearUsuario, findUsuarioPorEmail, findUsuarioPorId } from '../db/queries/usuarios.queries.js';

export async function registrar(req, res, next) {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const existente = await findUsuarioPorEmail(email);
    if (existente) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });
    }

    const passwordHash = await hashPassword(password);
    const usuario = await crearUsuario({ nombre, email, passwordHash });
    const token = signToken({ sub: usuario.id, email: usuario.email });
    res.status(201).json({ usuario, token });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const usuario = await findUsuarioPorEmail(email);
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const valido = await verifyPassword(password, usuario.password_hash);
    if (!valido) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const token = signToken({ sub: usuario.id, email: usuario.email });
    const { password_hash, ...usuarioSinHash } = usuario;
    res.json({ usuario: usuarioSinHash, token });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const usuario = await findUsuarioPorId(req.user.id);
    res.json({ usuario });
  } catch (err) {
    next(err);
  }
}
