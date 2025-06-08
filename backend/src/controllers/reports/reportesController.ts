import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import Usuario from '../../models/Usuario_model';
import Evento from '../../models/Evento_model';
import TipoEvento from '../../models/TipoEvento_model';

export const generarReporteEventos = async (_req: Request, res: Response) => {
  try {
    const eventos = await Evento.findAll({
      attributes: [
        'id_evento',
        'fecha_evento',
        'hora_evento',
        'espacio_evento',
        'estado_evento',
        'total_evento'
      ],
      include: [
        { 
          model: Usuario, 
          as: 'cliente',
          attributes: ['nombre_usuario', 'apellido_usuario']
        },
        { 
          model: Usuario, 
          as: 'asesor',
          attributes: ['nombre_usuario', 'apellido_usuario']
        },
        { 
          model: TipoEvento,
          attributes: ['tipo_evento']
        }
      ],
      order: [['fecha_evento', 'DESC']]
    });

    if (!eventos || eventos.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontraron eventos',
        mensaje: 'No hay eventos registrados para generar el reporte'
      });
    }

    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 40,
      layout: 'landscape'
    });

    res.setHeader('Content-Disposition', 'inline; filename=reporte_eventos.pdf');
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    // Título y fecha del reporte
    doc.fontSize(18).text('Reporte de Eventos', { align: 'center' });
    doc.fontSize(10).text(`Generado el ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(1);

    // Encabezado de tabla
    const tableTop = 120;
    const colWidths = [40, 120, 120, 120, 120, 120, 100, 100];
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
    let totalGeneral = 0;

    eventos.forEach((evento, i) => {
      if (y > 500) {
        doc.addPage();
        y = 100;
        drawRow(y, ['#', 'Cliente', 'Asesor', 'Tipo Evento', 'Espacio', 'Fecha', 'Estado', 'Total'], true);
        y += 35;
      }

      const fechaEvento = new Date(evento.fecha_evento);
      const fechaFormateada = `${fechaEvento.toLocaleDateString()} ${evento.hora_evento}`;
      totalGeneral += parseFloat(evento.total_evento.toString());

      const content = [
        (i + 1).toString(),
        `${evento.cliente?.nombre_usuario || ''} ${evento.cliente?.apellido_usuario || ''}`,
        `${evento.asesor?.nombre_usuario || ''} ${evento.asesor?.apellido_usuario || ''}`,
        evento.tipo_evento?.tipo_evento || 'No especificado',
        evento.espacio_evento || 'No especificado',
        fechaFormateada,
        evento.estado_evento,
        `RD$ ${parseFloat(evento.total_evento.toString()).toFixed(2)}`
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

    // Agregar total general
    doc.moveDown(2);
    doc.font('Helvetica-Bold')
       .fontSize(12)
       .text(`Total General: RD$ ${totalGeneral.toFixed(2)}`, { align: 'right' });

    // Agregar pie de página
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8)
         .text(
           `Página ${i + 1} de ${pageCount}`,
           doc.page.width - doc.page.margins.right - 100,
           doc.page.height - doc.page.margins.bottom,
           { align: 'right' }
         );
    }

    doc.end();
  } catch (error) {
    console.error('Error al generar reporte de eventos:', error);
    res.status(500).json({ 
      error: 'Error al generar el reporte',
      mensaje: 'Ocurrió un error al generar el reporte de eventos'
    });
  }
};
