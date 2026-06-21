'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

interface Props {
  empresaId: string;
  ejercicio: number;
  onSubido: (balanceId: string) => void;
}

export function UploadBalance({ empresaId, ejercicio, onSubido }: Props) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubir() {
    if (!archivo) return;
    setSubiendo(true);
    setError(null);
    try {
      const { balance } = await api.balances.subir(empresaId, ejercicio, archivo);
      onSubido(balance.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir el balance');
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center">
      <p className="mb-2 text-sm text-slate-500">Balance ejercicio {ejercicio}</p>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setArchivo(e.target.files?.[0] || null)}
        className="mb-3 text-sm"
      />
      <button
        onClick={handleSubir}
        disabled={!archivo || subiendo}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {subiendo ? 'Subiendo...' : 'Subir PDF'}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
