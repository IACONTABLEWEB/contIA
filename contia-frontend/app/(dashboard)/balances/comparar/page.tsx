'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEmpresas } from '@/hooks/useEmpresas';
import { UploadBalance } from '@/components/balances/UploadBalance';
import { api } from '@/lib/api';

export default function CompararPage() {
  const router = useRouter();
  const { empresas } = useEmpresas();
  const [empresaId, setEmpresaId] = useState('');
  const [balanceAId, setBalanceAId] = useState<string | null>(null);
  const [balanceBId, setBalanceBId] = useState<string | null>(null);
  const [ejercicioA] = useState(new Date().getFullYear() - 1);
  const [ejercicioB] = useState(new Date().getFullYear());
  const [ambosListos, setAmbosListos] = useState(false);
  const [comparando, setComparando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!balanceAId || !balanceBId) return;

    let activo = true;
    const intervalo = setInterval(async () => {
      try {
        const [a, b] = await Promise.all([
          api.balances.obtener(balanceAId),
          api.balances.obtener(balanceBId),
        ]);
        if (!activo) return;
        if (a.balance.estado_proceso === 'listo' && b.balance.estado_proceso === 'listo') {
          setAmbosListos(true);
          clearInterval(intervalo);
        }
        if (a.balance.estado_proceso === 'error' || b.balance.estado_proceso === 'error') {
          setError('Hubo un error al procesar alguno de los balances. Probá subirlo de nuevo.');
          clearInterval(intervalo);
        }
      } catch {
        // se reintenta en el próximo ciclo de polling
      }
    }, 3000);

    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, [balanceAId, balanceBId]);

  async function handleComparar() {
    if (!balanceAId || !balanceBId) return;
    setComparando(true);
    setError(null);
    try {
      const { analisis } = await api.analisis.crear(balanceAId, balanceBId);
      router.push(`/resultado/${analisis.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar la comparación');
      setComparando(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-xl font-semibold">Comparar balances</h1>

      <div>
        <label className="mb-1 block text-sm font-medium">Empresa</label>
        <select
          value={empresaId}
          onChange={(e) => setEmpresaId(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Seleccioná una empresa</option>
          {empresas.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.razon_social}
            </option>
          ))}
        </select>
      </div>

      {empresaId && (
        <div className="grid grid-cols-2 gap-4">
          <UploadBalance empresaId={empresaId} ejercicio={ejercicioA} onSubido={setBalanceAId} />
          <UploadBalance empresaId={empresaId} ejercicio={ejercicioB} onSubido={setBalanceBId} />
        </div>
      )}

      {balanceAId && balanceBId && !ambosListos && !error && (
        <p className="text-sm text-slate-500">Procesando ambos balances con IA, puede tardar un minuto...</p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {ambosListos && (
        <button
          onClick={handleComparar}
          disabled={comparando}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {comparando ? 'Generando comparación...' : 'Comparar'}
        </button>
      )}
    </div>
  );
}
