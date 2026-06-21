'use client';

import { useParams } from 'next/navigation';
import { useAnalisis } from '@/hooks/useAnalisis';
import { TablaComparativa } from '@/components/balances/TablaComparativa';
import { PanelAlertasIA } from '@/components/balances/PanelAlertasIA';

export default function ResultadoPage() {
  const { analisisId } = useParams<{ analisisId: string }>();
  const { analisis, listo, error } = useAnalisis(analisisId);

  if (error) return <p className="text-sm text-red-600">{error}</p>;

  if (!listo || !analisis) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-sm text-slate-500">Generando el análisis y los informes...</p>
      </div>
    );
  }

  const { variaciones, ratios, alertas } = analisis.resultado_json;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Resultado de la comparación</h1>
        <div className="space-x-2">
          <a
            href={`${apiUrl}/api/analisis/${analisis.id}/export/docx`}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
          >
            Descargar Word
          </a>
          <a
            href={`${apiUrl}/api/analisis/${analisis.id}/export/pdf`}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
          >
            Descargar PDF
          </a>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500">Ratios financieros</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">Solvencia</p>
            <p className="text-lg font-semibold">{ratios.solvencia?.toFixed(2) ?? 's/d'}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">Endeudamiento</p>
            <p className="text-lg font-semibold">{ratios.endeudamiento?.toFixed(2) ?? 's/d'}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">Pasivo / Activo</p>
            <p className="text-lg font-semibold">{ratios.participacionPasivoSobreActivo?.toFixed(2) ?? 's/d'}</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500">Alertas IA</h2>
        <PanelAlertasIA alertas={alertas} />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500">Variaciones</h2>
        <TablaComparativa variaciones={variaciones} />
      </section>
    </div>
  );
}
