import type { Alerta } from '@/lib/types';

export function PanelAlertasIA({ alertas }: { alertas: Alerta[] }) {
  if (alertas.length === 0) {
    return <p className="text-sm text-slate-400">No se generaron alertas para esta comparación.</p>;
  }

  return (
    <div className="space-y-2">
      {alertas.map((a, i) => (
        <div
          key={i}
          className={`rounded-md border-l-4 p-3 text-sm ${
            a.tipo === 'ERROR' ? 'border-red-500 bg-red-50' : 'border-amber-400 bg-amber-50'
          }`}
        >
          <span className="font-medium">[{a.tipo}] {a.cuenta}</span>
          <p className="text-slate-600">{a.mensaje}</p>
        </div>
      ))}
    </div>
  );
}
