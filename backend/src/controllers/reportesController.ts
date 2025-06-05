import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import Usuario from '../models/Usuario_model';
import Rol from '../models/Rol_model';
import Evento from '../models/Evento_model';
import TipoEvento from '../models/TipoEvento_model';
import Espacio from '../models/Espacio_model';

export const generarReporteUsuarios = async (_req: Request, res: Response) => {
  const usuarios = await Usuario.findAll({ include: [Rol] });

  const doc = new PDFDocument({ size: 'A4', margin: 40 });

  res.setHeader('Content-Disposition', 'inline; filename=reporte_usuarios.pdf');
  res.setHeader('Content-Type', 'application/pdf');

  doc.pipe(res);

  // Título
  doc.fontSize(18).text('Reporte de Usuarios', { align: 'center' });
  doc.moveDown(1);

  // Encabezado de tabla
  const tableTop = 100;
  const colWidths = [30, 100, 100, 100, 150, 80]; // suma aprox. 570
  const startX = doc.page.margins.left;

  const drawRow = (y: number, values: string[], bold = false) => {
    const font = bold ? 'Helvetica-Bold' : 'Helvetica';
    doc.font(font).fontSize(10);
    let x = startX;
    values.forEach((text, i) => {
      doc.text(text, x, y, { width: colWidths[i], align: 'left' });
      x += colWidths[i];
    });
  };

  // Dibujar encabezado
  drawRow(tableTop, ['#', 'Cédula', 'Nombre', 'Rol', 'Correo', 'Estado'], true);

  // Dibujar filas
  let y = tableTop + 20;
  usuarios.forEach((usuario, i) => {
    if (y > 720) { // Salto de página
      doc.addPage();
      y = 100;
      drawRow(y, ['#', 'Cédula', 'Nombre', 'Rol', 'Correo', 'Estado'], true);
      y += 20;
    }

    drawRow(y, [
      (i + 1).toString(),
      usuario.cedula_usuario,
      `${usuario.nombre_usuario} ${usuario.apellido_usuario}`,
      usuario.rol?.nombre_rol,
      usuario.correo_usuario,
      usuario.estado_usuario
    ]);
    y += 20;
  });

  doc.end();
};

export const generarReporteEventos = async (_req: Request, res: Response) => {
  const eventos = await Evento.findAll({
    include: [
      { model: Usuario, as: 'cliente' },
      { model: Usuario, as: 'asesor' },
      { model: TipoEvento },
      { model: Espacio }
    ]
  });

  const doc = new PDFDocument({ 
    size: 'A4', 
    margin: 40,
    layout: 'landscape' // Cambiar a orientación horizontal
  });

  res.setHeader('Content-Disposition', 'inline; filename=reporte_eventos.pdf');
  res.setHeader('Content-Type', 'application/pdf');

  doc.pipe(res);

  // Título
  doc.fontSize(18).text('Reporte de Eventos', { align: 'center' });
  doc.moveDown(1);

  // Encabezado de tabla
  const tableTop = 100;
  const colWidths = [40, 120, 120, 120, 120, 120, 100, 100]; // Añadido ancho para asesor
  const startX = doc.page.margins.left;
  const endX = doc.page.width - doc.page.margins.right;

  const drawRow = (y: number, values: string[], bold = false) => {
    const font = bold ? 'Helvetica-Bold' : 'Helvetica';
    doc.font(font).fontSize(10);
    let x = startX;
    values.forEach((text, i) => {
      doc.text(text, x, y, { width: colWidths[i], align: 'left' });
      x += colWidths[i] + 10;
    });
  };

  // Dibujar encabezado
  drawRow(tableTop, ['#', 'Cliente', 'Asesor', 'Tipo Evento', 'Espacio', 'Fecha', 'Estado', 'Total'], true);
  
  // Línea horizontal después del encabezado
  doc.moveTo(startX, tableTop + 15)
     .lineTo(endX, tableTop + 15)
     .stroke();

  // Dibujar filas
  let y = tableTop + 35;
  eventos.forEach((evento, i) => {
    if (y > 500) { // Ajustado para orientación horizontal
      doc.addPage();
      y = 100;
      drawRow(y, ['#', 'Cliente', 'Asesor', 'Tipo Evento', 'Espacio', 'Fecha', 'Estado', 'Total'], true);
      y += 35;
    }

    const content = [
      (i + 1).toString(),
      `${evento.cliente?.nombre_usuario} ${evento.cliente?.apellido_usuario}`,
      `${evento.asesor?.nombre_usuario} ${evento.asesor?.apellido_usuario}`,
      evento.tipo_evento?.tipo_evento || '',
      evento.espacio?.nombre_espacio || '',
      evento.fecha_evento.toString(),
      evento.estado_evento,
      `RD$ ${evento.total_evento}`
    ];

    drawRow(y, content);

    const lineHeight = 15;
    const contentHeight = Math.max(...content.map(text => 
      doc.heightOfString(text, { width: Math.max(...colWidths) })
    ));

    doc.moveTo(startX, y + contentHeight + 5)
       .lineTo(endX, y + contentHeight + 5)
       .stroke();

    y += contentHeight + 20;
  });

  doc.end();
};
