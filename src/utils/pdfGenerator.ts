import { jsPDF } from 'jspdf';
import { Baja } from '../types';

export function generarActaBajaPDF(baja: Baja): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // Header Box UNELLEZ Navy (#003366)
  doc.setFillColor(0, 51, 102);
  doc.rect(margin, 12, contentWidth, 23, 'F');

  // Accent Line UNELLEZ Gold (#D49B16)
  doc.setFillColor(212, 155, 22);
  doc.rect(margin, 35, contentWidth, 2, 'F');

  // --- LOGO 1: UNELLEZ (Left side emblem) ---
  const logo1X = margin + 11;
  const logo1Y = 23.5;
  // White circular base
  doc.setFillColor(255, 255, 255);
  doc.circle(logo1X, logo1Y, 9, 'F');
  // Orange outer ring
  doc.setDrawColor(230, 81, 0);
  doc.setLineWidth(0.7);
  doc.circle(logo1X, logo1Y, 9, 'D');

  // Stylized UNELLEZ orange geometric steps
  doc.setFillColor(230, 81, 0);
  doc.rect(logo1X - 4.5, logo1Y - 4.5, 4, 1.2, 'F');
  doc.rect(logo1X - 3.5, logo1Y - 2.8, 4, 1.2, 'F');
  doc.rect(logo1X - 2.5, logo1Y - 1.1, 4, 1.2, 'F');
  doc.rect(logo1X - 1.5, logo1Y + 0.6, 4, 1.2, 'F');
  doc.rect(logo1X - 0.5, logo1Y + 2.3, 4, 1.2, 'F');

  // "UNELLEZ" text
  doc.setTextColor(216, 67, 21);
  doc.setFont('times', 'bold');
  doc.setFontSize(5);
  doc.text('UNELLEZ', logo1X, logo1Y + 5.5, { align: 'center' });
  doc.setFont('times', 'italic');
  doc.setFontSize(3.2);
  doc.setTextColor(50, 50, 50);
  doc.text('La Univ. que Siembra', logo1X, logo1Y + 7.5, { align: 'center' });

  // --- LOGO 2: SIGART (Right side emblem) ---
  const logo2X = pageWidth - margin - 11;
  const logo2Y = 23.5;
  // White shield base
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(logo2X - 9, logo2Y - 9, 18, 18, 2.5, 2.5, 'F');

  // Shield borders: Left navy, right gold
  doc.setDrawColor(12, 53, 94);
  doc.setLineWidth(0.7);
  doc.roundedRect(logo2X - 8.5, logo2Y - 8.5, 17, 17, 2, 2, 'D');
  doc.setDrawColor(196, 154, 69);
  doc.setLineWidth(0.4);
  doc.line(logo2X, logo2Y - 8.5, logo2X + 8.5, logo2Y);
  doc.line(logo2X + 8.5, logo2Y, logo2X, logo2Y + 8.5);

  // Laptop body
  doc.setFillColor(12, 53, 94);
  // Screen
  doc.rect(logo2X - 4.5, logo2Y - 5.5, 9, 6, 'F');
  doc.setFillColor(226, 232, 240);
  doc.rect(logo2X - 3.8, logo2Y - 4.8, 7.6, 4.6, 'F');
  // Keyboard base
  doc.setFillColor(12, 53, 94);
  doc.rect(logo2X - 5.8, logo2Y + 0.8, 11.6, 1.8, 'F');

  // Circuit trace dots
  doc.setFillColor(196, 154, 69);
  doc.circle(logo2X + 2, logo2Y - 3, 0.4, 'F');
  doc.circle(logo2X - 1, logo2Y - 2, 0.4, 'F');

  // "SIGART" text
  doc.setTextColor(12, 53, 94);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(4.8);
  doc.text('SIGART', logo2X, logo2Y + 6.5, { align: 'center' });

  // Institution title (Center text between logos)
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('UNIVERSIDAD NACIONAL EXPERIMENTAL DE LOS LLANOS OCCIDENTALES', pageWidth / 2, 18.5, { align: 'center' });
  doc.setFontSize(9.5);
  doc.text('“EZEQUIEL ZAMORA” (UNELLEZ)', pageWidth / 2, 23.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('DIRECCIÓN GENERAL DE BIENES NACIONALES Y SUMINISTROS', pageWidth / 2, 28, { align: 'center' });
  doc.setFontSize(6.8);
  doc.setTextColor(244, 180, 26);
  doc.text('SISTEMA DE GESTIÓN DE ACTIVOS Y REPORTES TECNOLÓGICOS (SIGART)', pageWidth / 2, 32.5, { align: 'center' });

  // Document Title
  doc.setTextColor(0, 51, 102);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('ACTA OFICIAL DE DESINCORPORACIÓN Y BAJA DE ACTIVO', pageWidth / 2, 44, { align: 'center' });
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('Folio de Certificación Patrimonial e Institucional', pageWidth / 2, 48.5, { align: 'center' });

  // Folio Banner
  let y = 53;
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentWidth, 12, 1, 1, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 51, 102);
  doc.text('N° de Control Folio:', margin + 4, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(20, 20, 20);
  doc.text(`ACTA-BAJA-${String(baja.id).padStart(5, '0')}`, margin + 35, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 51, 102);
  doc.text('Fecha y Hora:', margin + 95, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(20, 20, 20);
  doc.text(baja.fecha_baja, margin + 120, y + 5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 51, 102);
  doc.text('Código Activo (ID):', margin + 4, y + 10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(20, 20, 20);
  doc.text(`ID #${baja.activo_id}`, margin + 35, y + 10);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 51, 102);
  doc.text('Categoría:', margin + 95, y + 10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(20, 20, 20);
  doc.text(baja.categoria || 'Bienes Muebles y Tecnológicos', margin + 120, y + 10);

  // Section 1: Especificación del Bien
  y += 16;
  doc.setFillColor(0, 51, 102);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('1. ESPECIFICACIÓN DEL ACTIVO DESINCORPORADO', margin + 3, y + 4.2);

  y += 9;
  doc.setFontSize(8.5);
  doc.setTextColor(40, 40, 40);

  const drawRow = (label: string, value: string, currentY: number) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 51, 102);
    doc.text(label, margin + 3, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    const splitVal = doc.splitTextToSize(value, contentWidth - 52);
    doc.text(splitVal, margin + 48, currentY);
    return currentY + Math.max(splitVal.length * 4, 5.5);
  };

  y = drawRow('Descripción / Equipo:', baja.nombre, y);
  y = drawRow('Unidad de Asignación Previa:', baja.asignado_a, y);
  y = drawRow('Régimen de Mantenimiento:', baja.mantenimiento, y);
  y = drawRow('Último Mantenimiento:', baja.fecha_ultimo_mant || 'N/A', y);
  if (baja.desc_mant) {
    y = drawRow('Detalle del Mantenimiento:', baja.desc_mant, y);
  }

  // Section 2: Motivo y Justificación
  y += 2;
  doc.setFillColor(0, 51, 102);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('2. DICTAMEN TÉCNICO Y JUSTIFICACIÓN DE LA DESINCORPORACIÓN', margin + 3, y + 4.2);

  y += 8;
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'normal');
  const motivoLines = doc.splitTextToSize(baja.motivo_baja, contentWidth - 6);
  doc.text(motivoLines, margin + 3, y);
  y += motivoLines.length * 4.2 + 3;

  // Legal note
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(90, 90, 90);
  const legalText = 'Certificación institucional: En concordancia con el reglamento de Bienes Públicos y normas patrimoniales de la UNELLEZ, se efectúa la desincorporación física del bien descrito. La firma y sello húmedo asentados a mano en el presente instrumento dan fe pública y validez legal al acto de retiro y resguardo administrativo.';
  const legalLines = doc.splitTextToSize(legalText, contentWidth - 6);
  doc.text(legalLines, margin + 3, y);
  y += legalLines.length * 3.5 + 4;

  // Section 3: Firmas a mano y Sello Húmedo (NO COLOCAR NOMBRE DIGITAL)
  doc.setFillColor(0, 51, 102);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('3. CONSIGNACIÓN, FIRMAS A MANO Y SELLO HÚMEDO', margin + 3, y + 4.2);

  y += 9;
  const colWidth = (contentWidth - 6) / 2;
  const col1X = margin;
  const col2X = margin + colWidth + 6;
  const boxHeight = 46;

  // Box 1: Custodio (Entrega)
  doc.setDrawColor(180, 180, 180);
  doc.setFillColor(252, 253, 255);
  doc.roundedRect(col1X, y, colWidth, boxHeight, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(0, 51, 102);
  doc.text('ENTREGADO POR (CUSTODIO / RESPONSABLE):', col1X + 3, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(60, 60, 60);

  // Manual handwriting lines
  doc.text('Firma a mano: ________________________________', col1X + 3, y + 12);
  doc.text('Nombre y Apellido: ___________________________', col1X + 3, y + 18);
  doc.text('Cédula de Identidad: _________________________', col1X + 3, y + 24);
  doc.text('Cargo / Dependencia: ________________________', col1X + 3, y + 30);

  // Box for Sello Húmedo
  doc.setDrawColor(160, 160, 160);
  doc.setLineDashPattern([1.5, 1], 0);
  doc.roundedRect(col1X + colWidth - 28, y + 8, 25, 25, 1, 1, 'D');
  doc.setLineDashPattern([], 0);
  doc.setFontSize(6);
  doc.setTextColor(120, 120, 120);
  doc.text('ESPACIO PARA', col1X + colWidth - 15.5, y + 19, { align: 'center' });
  doc.text('SELLO HÚMEDO', col1X + colWidth - 15.5, y + 23, { align: 'center' });

  // Box 2: Bienes y Suministros (Recepción)
  doc.setDrawColor(180, 180, 180);
  doc.setFillColor(252, 253, 255);
  doc.roundedRect(col2X, y, colWidth, boxHeight, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(0, 51, 102);
  doc.text('CONFORMADO POR (BIENES Y SUMINISTROS):', col2X + 3, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(60, 60, 60);

  // Manual handwriting lines
  doc.text('Firma Autorizada: ____________________________', col2X + 3, y + 12);
  doc.text('Nombre y Apellido: ___________________________', col2X + 3, y + 18);
  doc.text('Cédula de Identidad: _________________________', col2X + 3, y + 24);
  doc.text('Fecha de Conformidad: _____ / _____ / 202____', col2X + 3, y + 30);

  // Box for Sello Húmedo Institucional
  doc.setDrawColor(160, 160, 160);
  doc.setLineDashPattern([1.5, 1], 0);
  doc.roundedRect(col2X + colWidth - 28, y + 8, 25, 25, 1, 1, 'D');
  doc.setLineDashPattern([], 0);
  doc.setFontSize(6);
  doc.setTextColor(120, 120, 120);
  doc.text('ESPACIO PARA', col2X + colWidth - 15.5, y + 18, { align: 'center' });
  doc.text('SELLO HÚMEDO', col2X + colWidth - 15.5, y + 22, { align: 'center' });
  doc.text('UNELLEZ', col2X + colWidth - 15.5, y + 26, { align: 'center' });

  // Bottom Footer
  doc.setFontSize(7);
  doc.setTextColor(110, 110, 110);
  doc.text('Documento oficial generado por el Sistema de Gestión de Activos y Reportes Tecnológicos (SIGART) — Servidor Local UNELLEZ', pageWidth / 2, 266, { align: 'center' });
  doc.text(`Identificador de control: ACTA-${baja.id}-${baja.activo_id} • Proceso de baja registrado en base de datos local SQLite`, pageWidth / 2, 270, { align: 'center' });

  return doc;
}

export function descargarActaBajaPDF(baja: Baja) {
  const doc = generarActaBajaPDF(baja);
  doc.save(`Acta_Desincorporacion_ID_${baja.activo_id}.pdf`);
}
