'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Balance } from '@/lib/types';

export default function DetalleEmpresaPage() {
  const { id } = useParams<{ id: string }>();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.balances
      .listarPorEmpresa(id)
      .then(({ balances }) => setBalances(balances))
      .catch((err) => setError(err instanceof Error ? err.message : 'Error al cargar balances'))
      .finally(() => setCargando(false));
  }, [id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Balances de la empresa</h1>
        <Link href="/balances/comparar" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
          Comparar balances
        </Link>
      </div>

      {cargando && <p className="text-sm text-slate-500">Cargando...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2">Ejercicio</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Fecha de carga</th>
            </tr>
          </thead>
          <tbody>
            {balances.map((b) => (
              <tr key={b.id} className="border-t border-slate-100">
                <td className="px-4 py-2">{b.ejercicio}</td>
                <td className="px-4 py-2 capitalize">{b.estado_proceso}</td>
                <td className="px-4 py-2">{new Date(b.fecha_carga).toLocaleDateString('es-AR')}</td>
              </tr>
            ))}
            {!cargando && balances.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                  Todavía no se cargaron balances para esta empresa.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
