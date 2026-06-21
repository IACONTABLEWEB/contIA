import { obtenerToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = obtenerToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `Error ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  login: (email: string, password: string) =>
    request<{ usuario: any; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  registrar: (nombre: string, email: string, password: string) =>
    request<{ usuario: any; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ nombre, email, password }),
    }),

  empresas: {
    listar: () => request<{ empresas: any[] }>('/api/empresas'),
    crear: (data: { razonSocial: string; cuit: string; actividad?: string }) =>
      request('/api/empresas', { method: 'POST', body: JSON.stringify(data) }),
  },

  balances: {
    subir: (empresaId: string, ejercicio: number, archivo: File) => {
      const formData = new FormData();
      formData.append('empresaId', empresaId);
      formData.append('ejercicio', String(ejercicio));
      formData.append('archivo', archivo);
      return request<{ balance: any }>('/api/balances/upload', { method: 'POST', body: formData });
    },
    listarPorEmpresa: (empresaId: string) =>
      request<{ balances: any[] }>(`/api/balances?empresa_id=${empresaId}`),
    obtener: (id: string) => request<{ balance: any }>(`/api/balances/${id}`),
  },

  analisis: {
    crear: (balanceAId: string, balanceBId: string) =>
      request<{ analisis: any }>('/api/analisis', {
        method: 'POST',
        body: JSON.stringify({ balanceAId, balanceBId }),
      }),
    obtener: (id: string) => request<{ analisis: any }>(`/api/analisis/${id}`),
    status: (id: string) => request<{ listo: boolean }>(`/api/analisis/${id}/status`),
  },
};
