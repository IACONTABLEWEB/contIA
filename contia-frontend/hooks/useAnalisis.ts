'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Analisis } from '@/lib/types';

export function useAnalisis(analisisId: string | null) {
  const [analisis, setAnalisis] = useState<Analisis | null>(null);
  const [listo, setListo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!analisisId) return;

    let activo = true;
    let intervalo: ReturnType<typeof setInterval>;

    async function verificarEstado() {
      try {
        const { listo: estaListo } = await api.analisis.status(analisisId!);
        if (!activo) return;
        if (estaListo) {
          const { analisis } = await api.analisis.obtener(analisisId!);
          setAnalisis(analisis);
          setListo(true);
          clearInterval(intervalo);
        }
      } catch (err) {
        if (activo) setError(err instanceof Error ? err.message : 'Error al consultar el análisis');
      }
    }

    verificarEstado();
    intervalo = setInterval(verificarEstado, 3000);

    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, [analisisId]);

  return { analisis, listo, error };
}
