import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  TextRun,
} from 'docx';
import PDFDocument from 'pdfkit';

export async function generarInformeDocx({ empresa, balanceA, balanceB, variaciones, ratios, alertas }) {
  const encabezado = new TableRow({
    children: ['Cuenta', `Ejercicio ${balanceA.ejercicio}`, `Ejercicio ${balanceB.ejercicio}`, 'Var. absoluta', 'Var. %'].map(
      (texto) =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: texto, bold: true })] })],
        })
    ),
  });

  const filas = variaciones.slice(0, 50).map(
    (v) =>
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(v.nombre)] }),
          new TableCell({ children: [new Paragraph(String(v.importeA))] }),
          new TableCell({ children: [new Paragraph(String(v.importeB))] }),
          new TableCell({ children: [new Paragraph(String(v.variacionAbsoluta))] }),
          new TableCell({
            children: [
              new Paragraph(
                v.variacionPorcentual != null ? `${v.variacionPorcentual.toFixed(1)}%` : 's/d'
              ),
            ],
          }),
        ],
      })
  );

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: `Informe de comparación de balances — ${empresa.razon_social}`,
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: `Ejercicios comparados: ${balanceA.ejercicio} vs. ${balanceB.ejercicio}`,
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({ text: ' ' }),
          new Paragraph({ text: 'Variaciones principales', heading: HeadingLevel.HEADING_2 }),
          new Table({ rows: [encabezado, ...filas] }),
          new Paragraph({ text: ' ' }),
          new Paragraph({ text: 'Ratios financieros', heading: HeadingLevel.HEADING_2 }),
          new Paragraph(`Solvencia: ${ratios.solvencia?.toFixed(2) ?? 's/d'}`),
          new Paragraph(`Endeudamiento: ${ratios.endeudamiento?.toFixed(2) ?? 's/d'}`),
          new Paragraph({ text: ' ' }),
          new Paragraph({ text: 'Alertas IA', heading: HeadingLevel.HEADING_2 }),
          ...alertas.map((a) => new Paragraph(`[${a.tipo}] ${a.cuenta}: ${a.mensaje}`)),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}

export function generarInformePdf({ empresa, balanceA, balanceB, variaciones, ratios, alertas }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).text(`Informe de comparación — ${empresa.razon_social}`, { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Ejercicios: ${balanceA.ejercicio} vs. ${balanceB.ejercicio}`);
    doc.moveDown();

    doc.fontSize(14).text('Variaciones principales');
    doc.moveDown(0.5);
    variaciones.slice(0, 40).forEach((v) => {
      const signo = v.variacionAbsoluta >= 0 ? '+' : '';
      const pct = v.variacionPorcentual != null ? `${v.variacionPorcentual.toFixed(1)}%` : 's/d';
      doc.fontSize(10).text(`${v.nombre}: ${v.importeA} → ${v.importeB} (${signo}${v.variacionAbsoluta}, ${pct})`);
    });

    doc.moveDown();
    doc.fontSize(14).text('Ratios financieros');
    doc.fontSize(10).text(`Solvencia: ${ratios.solvencia?.toFixed(2) ?? 's/d'}`);
    doc.text(`Endeudamiento: ${ratios.endeudamiento?.toFixed(2) ?? 's/d'}`);

    doc.moveDown();
    doc.fontSize(14).text('Alertas IA');
    alertas.forEach((a) => {
      doc.fontSize(10).text(`[${a.tipo}] ${a.cuenta}: ${a.mensaje}`);
    });

    doc.end();
  });
}
