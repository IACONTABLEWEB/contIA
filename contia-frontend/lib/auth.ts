// Token guardado en cookie (no localStorage) para que el middleware de Next.js
// pueda leerlo en el servidor y proteger rutas antes de renderizar.
const TOKEN_KEY = 'contia_token';

export function guardarToken(token: string) {
  if (typeof window !== 'undefined') {
    document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
  }
}

export function obtenerToken(): string | null {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^| )${TOKEN_KEY}=([^;]+)`));
  return match ? match[2] : null;
}

export function borrarToken() {
  if (typeof window !== 'undefined') {
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`;
  }
}
