function normalizar(cuentas) {
  const mapa = new Map();
  for (const c of cuentas) {
    const clave = c.nombre.trim().toLowerCase();
    mapa.set(clave, { nombre: c.nombre, importe: Number(c.importe), rubro: c.rubro });
  }
  return mapa;
}

export function compararCuentas(cuentasA, cuentasB) {
  const mapaA = normalizar(cuentasA);
  const mapaB = normalizar(cuentasB);
  const claves = new Set([...mapaA.keys(), ...mapaB.keys()]);

  const variaciones = [];

  for (const clave of claves) {
    const a = mapaA.get(clave);
    const b = mapaB.get(clave);
    const importeA = a?.importe ?? 0;
    const importeB = b?.importe ?? 0;
    const variacionAbsoluta = importeB - importeA;
    const variacionPorcentual =
      importeA !== 0 ? (variacionAbsoluta / Math.abs(importeA)) * 100 : null;

    variaciones.push({
      nombre: a?.nombre || b?.nombre,
      rubro: a?.rubro || b?.rubro || null,
      importeA,
      importeB,
      variacionAbsoluta,
      variacionPorcentual,
      presenteSoloEn: !a ? 'B' : !b ? 'A' : null,
    });
  }

  return variaciones.sort(
    (x, y) => Math.abs(y.variacionAbsoluta) - Math.abs(x.variacionAbsoluta)
  );
}

function sumaPorRubro(cuentas, rubro) {
  return cuentas
    .filter((c) => c.rubro === rubro)
    .reduce((acc, c) => acc + Number(c.importe), 0);
}

// Ratios heurísticos para el MVP. Para un ratio de liquidez correcto
// (activo corriente / pasivo corriente) hay que pedirle a la IA que distinga
// corriente/no corriente en la extracción — queda para la siguiente iteración
// del prompt de pdfExtractor.js.
export function calcularRatios(cuentas) {
  const activo = sumaPorRubro(cuentas, 'activo');
  const pasivo = sumaPorRubro(cuentas, 'pasivo');
  const patrimonioNeto = sumaPorRubro(cuentas, 'patrimonio_neto');

  return {
    solvencia: pasivo !== 0 ? activo / pasivo : null,
    endeudamiento: patrimonioNeto !== 0 ? pasivo / patrimonioNeto : null,
    participacionPasivoSobreActivo: activo !== 0 ? pasivo / activo : null,
  };
}
