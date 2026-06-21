'use client';

import Link from 'next/link';
import { useEmpresas } from '@/hooks/useEmpresas';

export default function EmpresasPage() {
  const { empresas, cargando, error } = useEmpresas();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Empresas</h1>
        <Link href="/empresas/nueva" className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
          Nueva empresa
        </Link>
      </div>

      {cargando && <p className="text-sm text-slate-500">Cargando...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-2">Razón social</th>
              <th className="px-4 py-2">CUIT</th>
              <th className="px-4 py-2">Actividad</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {empresas.map((empresa) => (
              <tr key={empresa.id} className="border-t border-slate-100">
                <td className="px-4 py-2">{empresa.razon_social}</td>
                <td className="px-4 py-2">{empresa.cuit}</td>
                <td className="px-4 py-2">{empresa.actividad || '-'}</td>
                <td className="px-4 py-2 text-right">
                  <Link href={`/empresas/${empresa.id}`} className="text-slate-600 hover:underline">
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
            {!cargando && empresas.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  No hay empresas cargadas todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
