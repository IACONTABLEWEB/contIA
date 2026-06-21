import type { Variacion } from '@/lib/types';

function formatear(n: number) {
  return n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function TablaComparativa({ variaciones }: { variaciones: Variacion[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr>
            <th className="px-4 py-2">Cuenta</th>
            <th className="px-4 py-2 text-right">Ejercicio A</th>
            <th className="px-4 py-2 text-right">Ejercicio B</th>
            <th className="px-4 py-2 text-right">Var. absoluta</th>
            <th className="px-4 py-2 text-right">Var. %</th>
          </tr>
        </thead>
        <tbody>
          {variaciones.map((v, i) => (
            <tr key={i} className="border-t border-slate-100">
              <td className="px-4 py-2">{v.nombre}</td>
              <td className="px-4 py-2 text-right">{formatear(v.importeA)}</td>
              <td className="px-4 py-2 text-right">{formatear(v.importeB)}</td>
              <td className={`px-4 py-2 text-right ${v.variacionAbsoluta < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {formatear(v.variacionAbsoluta)}
              </td>
              <td className="px-4 py-2 text-right">
                {v.variacionPorcentual != null ? `${v.variacionPorcentual.toFixed(1)}%` : 's/d'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
