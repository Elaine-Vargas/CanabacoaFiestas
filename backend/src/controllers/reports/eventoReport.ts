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
          attributes: ['nombre_usuario', 'apellido_usuario', 'cedula_usuario']
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

    res.setHeader('Content-Disposition', 'inline; filename=reporte_eventos_general.pdf');
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    // Título y fecha del reporte
    doc.fontSize(18).text('Reporte General de Eventos', { align: 'center' });
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

    eventos.forEach((evento: any, i: number) => {
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
    console.error('Error al generar reporte general de eventos:', error);
    res.status(500).json({ 
      error: 'Error al generar el reporte',
      mensaje: 'Ocurrió un error al generar el reporte general de eventos'
    });
  }
};

export const generarReporteEventosCliente = async (req: Request, res: Response) => {
  try {
    const { cedula_cliente } = req.params;

    if (!cedula_cliente) {
      return res.status(400).json({
        error: 'Parámetro requerido',
        mensaje: 'La cédula del cliente es requerida'
      });
    }

    // Primero verificar si el cliente existe
    const cliente = await Usuario.findOne({
      where: { cedula_usuario: cedula_cliente },
      attributes: ['nombre_usuario', 'apellido_usuario', 'cedula_usuario']
    });

    if (!cliente) {
      return res.status(404).json({
        error: 'Cliente no encontrado',
        mensaje: 'No existe un cliente con la cédula proporcionada'
      });
    }

    const eventos = await Evento.findAll({
      where: { cedula_cliente },
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
          attributes: ['nombre_usuario', 'apellido_usuario', 'cedula_usuario']
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
        mensaje: 'No hay eventos registrados para este cliente'
      });
    }

    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 40,
      layout: 'landscape'
    });

    res.setHeader('Content-Disposition', 'inline; filename=reporte_eventos_cliente.pdf');
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    // Título y fecha del reporte
    doc.fontSize(18).text('Reporte de Eventos por Cliente', { align: 'center' });
    doc.fontSize(10).text(`Generado el ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(1);

    // Información del cliente
    doc.fontSize(12).text(`Cliente: ${cliente.nombre_usuario} ${cliente.apellido_usuario}`, { align: 'left' });
    doc.fontSize(12).text(`Cédula: ${cliente.cedula_usuario}`, { align: 'left' });
    doc.moveDown(1);

    // Encabezado de tabla
    const tableTop = 180;
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

    eventos.forEach((evento: any, i: number) => {
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
    console.error('Error al generar reporte de eventos por cliente:', error);
    res.status(500).json({ 
      error: 'Error al generar el reporte',
      mensaje: 'Ocurrió un error al generar el reporte de eventos por cliente'
    });
  }
};

export const generarReporteEventosAsesor = async (req: Request, res: Response) => {
  try {
    const { cedula_asesor } = req.params;

    const eventos = await Evento.findAll({
      where: { cedula_asesor },
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
        mensaje: 'No hay eventos registrados para este asesor'
      });
    }

    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 40,
      layout: 'landscape'
    });

    res.setHeader('Content-Disposition', 'inline; filename=reporte_eventos_asesor.pdf');
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    // Título y fecha del reporte
    doc.fontSize(18).text('Reporte de Eventos por Asesor', { align: 'center' });
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

    eventos.forEach((evento: any, i: number) => {
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
    console.error('Error al generar reporte de eventos por asesor:', error);
    res.status(500).json({ 
      error: 'Error al generar el reporte',
      mensaje: 'Ocurrió un error al generar el reporte de eventos por asesor'
    });
  }
};

export const generarReporteEventosPersonal = async (req: Request, res: Response) => {
  try {
    const { id_personal } = req.params;

    const eventos = await Evento.findAll({
      where: { id_personal },
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
        mensaje: 'No hay eventos registrados para este personal'
      });
    }

    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 40,
      layout: 'landscape'
    });

    res.setHeader('Content-Disposition', 'inline; filename=reporte_eventos_personal.pdf');
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    // Título y fecha del reporte
    doc.fontSize(18).text('Reporte de Eventos por Personal', { align: 'center' });
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

    eventos.forEach((evento: any, i: number) => {
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
    console.error('Error al generar reporte de eventos por personal:', error);
    res.status(500).json({ 
      error: 'Error al generar el reporte',
      mensaje: 'Ocurrió un error al generar el reporte de eventos por personal'
    });
  }
}; 