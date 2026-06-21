'use client';

import Link from 'next/link';
import { useEmpresas } from '@/hooks/useEmpresas';

export default function DashboardPage() {
  const { empresas, cargando } = useEmpresas();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Empresas</p>
          <p className="text-2xl font-semibold">{cargando ? '...' : empresas.length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Plan actual</p>
          <p className="text-2xl font-semibold">Gratis</p>
        </div>
        <div className="flex items-center rounded-lg border border-slate-200 bg-white p-4">
          <Link href="/balances/comparar" className="text-sm font-medium text-slate-900 underline">
            Comparar balances →
          </Link>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500">Empresas</h2>
        <ul className="space-y-2">
          {empresas.map((e) => (
            <li key={e.id} className="rounded-md border border-slate-200 bg-white p-3 text-sm">
              <Link href={`/empresas/${e.id}`}>
                {e.razon_social} — {e.cuit}
              </Link>
            </li>
          ))}
          {!cargando && empresas.length === 0 && (
            <li className="text-sm text-slate-400">No hay empresas cargadas todavía.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
