export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  plan: 'gratis' | 'estudio' | 'profesional' | 'enterprise';
}

export interface Empresa {
  id: string;
  razon_social: string;
  cuit: string;
  actividad: string | null;
}

export interface Balance {
  id: string;
  empresa_id: string;
  ejercicio: number;
  estado_proceso: 'pendiente' | 'procesando' | 'listo' | 'error';
  error_detalle: string | null;
  fecha_carga: string;
}

export interface Variacion {
  nombre: string;
  rubro: string | null;
  importeA: number;
  importeB: number;
  variacionAbsoluta: number;
  variacionPorcentual: number | null;
  presenteSoloEn: 'A' | 'B' | null;
}

export interface Alerta {
  tipo: 'ERROR' | 'OBSERVACION';
  cuenta: string;
  mensaje: string;
}

export interface Ratios {
  solvencia: number | null;
  endeudamiento: number | null;
  participacionPasivoSobreActivo: number | null;
}

export interface Analisis {
  id: string;
  balance_a_id: string;
  balance_b_id: string;
  resultado_json: {
    variaciones: Variacion[];
    ratios: Ratios;
    alertas: Alerta[];
  };
  fecha: string;
}
