import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import Usuario from '../../models/Usuario_model';
import Evento from '../../models/Evento_model';
import TipoEvento from '../../models/TipoEvento_model';
import EmpleadoEvento from '../../models/EmpleadoEvento_model';

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

    // Finalizar el documento
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

    let clienteInfo = null;
    let whereClause: any = {};
    let reportTitle = 'Reporte de Eventos';
    let headerLabels = ['#', 'Cliente', 'Asesor', 'Tipo Evento', 'Espacio', 'Fecha', 'Estado', 'Total'];
    let colWidths = [40, 120, 120, 120, 120, 120, 100, 100];
    let startX;
    let currentY = 0; 
    let totalGeneral = 0; 

    if (cedula_cliente !== 'todos') {
      clienteInfo = await Usuario.findOne({
        where: { cedula_usuario: cedula_cliente },
        attributes: ['nombre_usuario', 'apellido_usuario', 'cedula_usuario']
      });

      if (!clienteInfo) {
        return res.status(404).json({
          error: 'Cliente no encontrado',
          mensaje: 'No existe un cliente con la cédula proporcionada'
        });
      }
      whereClause.cedula_cliente = cedula_cliente;
      reportTitle = `Reporte de Eventos por Cliente`;

      headerLabels = ['#', 'Asesor', 'Tipo Evento', 'Espacio', 'Fecha', 'Estado', 'Total'];
      colWidths = [40, 120, 120, 120, 120, 100, 100]; 
    } else {
      reportTitle = 'Reporte General de Eventos por Cliente';
    }

    const eventos = await Evento.findAll({
      where: whereClause,
      attributes: [
        'id_evento', 'fecha_evento', 'hora_evento', 'espacio_evento', 'estado_evento', 'total_evento', 'cedula_cliente', 'cedula_asesor'
      ],
      include: [
        { model: Usuario, as: 'cliente', attributes: ['nombre_usuario', 'apellido_usuario', 'cedula_usuario'] },
        { model: Usuario, as: 'asesor', attributes: ['nombre_usuario', 'apellido_usuario', 'cedula_usuario'] },
        { model: TipoEvento, attributes: ['tipo_evento'] }
      ],
      order: [['fecha_evento', 'DESC']] 
    });

    if (!eventos || eventos.length === 0) {
      return res.status(404).json({
        error: 'No se encontraron eventos',
        mensaje: cedula_cliente === 'todos' ? 'No hay eventos registrados en general' : 'No hay eventos registrados para este cliente'
      });
    }

    const doc = new PDFDocument({
      size: 'A4', margin: 40, layout: 'landscape'
    });
    res.setHeader('Content-Disposition', 'inline; filename=reporte_eventos_cliente.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    doc.fontSize(18).text(reportTitle, { align: 'center' });
    doc.fontSize(10).text(`Generado el ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(1);
    currentY = doc.y; 

    if (clienteInfo) {
      doc.fontSize(12).text(`Cliente: ${clienteInfo.nombre_usuario} ${clienteInfo.apellido_usuario}`, { align: 'left' });
      doc.fontSize(12).text(`Cédula: ${clienteInfo.cedula_usuario}`, { align: 'left' });
      doc.moveDown(1);
      currentY = doc.y; 
    }

    startX = doc.page.margins.left; 

    const drawRow = (yPos: number, values: string[], bold = false) => {
      const font = bold ? 'Helvetica-Bold' : 'Helvetica';
      doc.font(font).fontSize(10);
      let x = startX;
      values.forEach((text, i) => {
        doc.text(text, x, yPos, { width: colWidths[i], align: 'left' });
        x += colWidths[i] + 10;
      });
    };

    let tableTop = clienteInfo ? currentY + 20 : currentY + 20; 

    let sortedEvents = eventos;
    if (cedula_cliente === 'todos') {
        sortedEvents.sort((a: any, b: any) => {
            const clientA = `${a.cliente?.nombre_usuario || ''} ${a.cliente?.apellido_usuario || ''}`;
            const clientB = `${b.cliente?.nombre_usuario || ''} ${b.cliente?.apellido_usuario || ''}`;
            return clientA.localeCompare(clientB);
        });
    }

    let currentClientCedula = '';
    let rowIndex = 0; 

    drawRow(tableTop, headerLabels, true);
    doc.moveTo(startX, tableTop + 15).lineTo(doc.page.width - doc.page.margins.right, tableTop + 15).stroke();
    currentY = tableTop + 35; 

    sortedEvents.forEach((evento: any) => {
      if (cedula_cliente === 'todos') {
        if (evento.cliente?.cedula_usuario && evento.cliente.cedula_usuario !== currentClientCedula) {
          if (rowIndex > 0) { 
            currentY += 20; 
          }
          doc.font('Helvetica-Bold').fontSize(12).text(`Cliente: ${evento.cliente.nombre_usuario} ${evento.cliente.apellido_usuario} (Cédula: ${evento.cliente.cedula_usuario})`, startX, currentY);
          doc.moveDown(0.5); 
          currentY = doc.y; 
          currentClientCedula = evento.cliente.cedula_usuario;
          rowIndex = 0; 
        }
      }

      rowIndex++; 
      const fechaEvento = new Date(evento.fecha_evento);
      const fechaFormateada = `${fechaEvento.toLocaleDateString()} ${evento.hora_evento}`;
      const eventoTotal = parseFloat(evento.total_evento?.toString() || '0');
      totalGeneral += eventoTotal;

      let content = [];
      if (cedula_cliente !== 'todos') {
        content = [
          rowIndex.toString(),
          `${evento.asesor?.nombre_usuario || ''} ${evento.asesor?.apellido_usuario || ''}`,
          evento.tipo_evento?.tipo_evento || 'No especificado',
          evento.espacio_evento || 'No especificado',
          fechaFormateada,
          evento.estado_evento,
          `RD$ ${eventoTotal.toFixed(2)}`
        ];
      } else {
        content = [
          rowIndex.toString(),
          `${evento.cliente?.nombre_usuario || ''} ${evento.cliente?.apellido_usuario || ''}`,
          `${evento.asesor?.nombre_usuario || ''} ${evento.asesor?.apellido_usuario || ''}`,
          evento.tipo_evento?.tipo_evento || 'No especificado',
          evento.espacio_evento || 'No especificado',
          fechaFormateada,
          evento.estado_evento,
          `RD$ ${eventoTotal.toFixed(2)}`
        ];
      }

      const contentHeight = Math.max(...content.map(text =>
        doc.heightOfString(text, { width: Math.max(...colWidths) })
      ));
      const spaceForCurrentRow = contentHeight + 20;

      if (currentY + spaceForCurrentRow > 520) { 
        doc.addPage({ layout: 'landscape' });
        currentY = 100; 
        drawRow(currentY, headerLabels, true); 
        currentY += 20; 
      }

      drawRow(currentY, content);
      doc.moveTo(startX, currentY + contentHeight + 5).lineTo(doc.page.width - doc.page.margins.right, currentY + contentHeight + 5).stroke();
      currentY += spaceForCurrentRow;
    });

    const totalGeneralTextHeight = doc.font('Helvetica-Bold').fontSize(12).heightOfString(`Total General: RD$ ${totalGeneral.toFixed(2)}`, { width: doc.page.width - doc.page.margins.left - doc.page.margins.right });
    const paddingBeforeTotal = 20;
    const potentialTotalY = currentY + paddingBeforeTotal;

    if (potentialTotalY + totalGeneralTextHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage({ layout: 'landscape' });
        doc.y = 100;
    } else {
        doc.y = potentialTotalY;
    }

    doc.font('Helvetica-Bold')
       .fontSize(12)
       .text(`Total General: RD$ ${totalGeneral.toFixed(2)}`, { align: 'right' });

    // Agregar pie de página
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).text(`Página ${i + 1} de ${pageCount}`, doc.page.width - doc.page.margins.right - 100, doc.page.height - doc.page.margins.bottom, { align: 'right' });
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

    let asesorInfo = null;
    let whereClause: any = {};
    let reportTitle = 'Reporte de Eventos';
    let headerLabels = ['#', 'Cliente', 'Asesor', 'Tipo Evento', 'Espacio', 'Fecha', 'Estado', 'Total'];
    let colWidths = [40, 120, 120, 120, 120, 120, 100, 100];
    let startX;
    let currentY = 0; 
    let totalGeneral = 0; 

    if (cedula_asesor !== 'todos') {
      asesorInfo = await Usuario.findOne({
        where: { cedula_usuario: cedula_asesor },
        attributes: ['nombre_usuario', 'apellido_usuario', 'cedula_usuario']
      });

      if (!asesorInfo) {
        return res.status(404).json({
          error: 'Asesor no encontrado',
          mensaje: 'No existe un asesor con la cédula proporcionada'
        });
      }
      whereClause.cedula_asesor = cedula_asesor;
      reportTitle = `Reporte de Eventos por Asesor`;

      headerLabels = ['#', 'Cliente', 'Tipo Evento', 'Espacio', 'Fecha', 'Estado', 'Total'];
      colWidths = [40, 120, 120, 120, 120, 100, 100]; 
    } else {
      reportTitle = 'Reporte General de Eventos por Asesor';
    }

    const eventos = await Evento.findAll({
      where: whereClause,
      attributes: [
        'id_evento', 'fecha_evento', 'hora_evento', 'espacio_evento', 'estado_evento', 'total_evento', 'cedula_cliente', 'cedula_asesor'
      ],
      include: [
        { model: Usuario, as: 'cliente', attributes: ['nombre_usuario', 'apellido_usuario', 'cedula_usuario'] },
        { model: Usuario, as: 'asesor', attributes: ['nombre_usuario', 'apellido_usuario', 'cedula_usuario'] },
        { model: TipoEvento, attributes: ['tipo_evento'] }
      ],
      order: [['fecha_evento', 'DESC']] 
    });

    if (!eventos || eventos.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontraron eventos',
        mensaje: cedula_asesor === 'todos' ? 'No hay eventos registrados en general' : 'No hay eventos registrados para este asesor'
      });
    }

    const doc = new PDFDocument({ 
      size: 'A4', margin: 40, layout: 'landscape'
    });
    res.setHeader('Content-Disposition', 'inline; filename=reporte_eventos_asesor.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    doc.fontSize(18).text(reportTitle, { align: 'center' });
    doc.fontSize(10).text(`Generado el ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(1);
    currentY = doc.y; 

    if (asesorInfo) {
      doc.fontSize(12).text(`Asesor: ${asesorInfo.nombre_usuario} ${asesorInfo.apellido_usuario}`, { align: 'left' });
      doc.fontSize(12).text(`Cédula: ${asesorInfo.cedula_usuario}`, { align: 'left' });
      doc.moveDown(1);
      currentY = doc.y; 
    }

    startX = doc.page.margins.left; 

    const drawRow = (yPos: number, values: string[], bold = false) => {
      const font = bold ? 'Helvetica-Bold' : 'Helvetica';
      doc.font(font).fontSize(10);
      let x = startX;
      values.forEach((text, i) => {
        doc.text(text, x, yPos, { width: colWidths[i], align: 'left' });
        x += colWidths[i] + 10;
      });
    };

    let tableTop = asesorInfo ? currentY + 20 : currentY + 20; 

    let sortedEvents = eventos;
    if (cedula_asesor === 'todos') {
        sortedEvents.sort((a: any, b: any) => {
            const asesorA = `${a.asesor?.nombre_usuario || ''} ${a.asesor?.apellido_usuario || ''}`;
            const asesorB = `${b.asesor?.nombre_usuario || ''} ${b.asesor?.apellido_usuario || ''}`;
            return asesorA.localeCompare(asesorB);
        });
    }

    let currentAsesorCedula = '';
    let rowIndex = 0; 

    drawRow(tableTop, headerLabels, true);
    doc.moveTo(startX, tableTop + 15).lineTo(doc.page.width - doc.page.margins.right, tableTop + 15).stroke();
    currentY = tableTop + 35; 

    sortedEvents.forEach((evento: any) => {
      if (cedula_asesor === 'todos') {
        if (evento.asesor?.cedula_usuario && evento.asesor.cedula_usuario !== currentAsesorCedula) {
          if (rowIndex > 0) { 
            currentY += 20; 
          }
          doc.font('Helvetica-Bold').fontSize(12).text(`Asesor: ${evento.asesor.nombre_usuario} ${evento.asesor.apellido_usuario} (Cédula: ${evento.asesor.cedula_usuario})`, startX, currentY);
          doc.moveDown(0.5); 
          currentY = doc.y; 
          currentAsesorCedula = evento.asesor.cedula_usuario;
          rowIndex = 0; 
        }
      }

      rowIndex++; 
      const fechaEvento = new Date(evento.fecha_evento);
      const fechaFormateada = `${fechaEvento.toLocaleDateString()} ${evento.hora_evento}`;
      const eventoTotal = parseFloat(evento.total_evento?.toString() || '0');
      totalGeneral += eventoTotal;

      let content = [];
      if (cedula_asesor !== 'todos') {
        content = [
          rowIndex.toString(),
          `${evento.cliente?.nombre_usuario || ''} ${evento.cliente?.apellido_usuario || ''}`,
          evento.tipo_evento?.tipo_evento || 'No especificado',
          evento.espacio_evento || 'No especificado',
          fechaFormateada,
          evento.estado_evento,
          `RD$ ${eventoTotal.toFixed(2)}`
        ];
      } else {
        content = [
          rowIndex.toString(),
          `${evento.cliente?.nombre_usuario || ''} ${evento.cliente?.apellido_usuario || ''}`,
          `${evento.asesor?.nombre_usuario || ''} ${evento.asesor?.apellido_usuario || ''}`,
          evento.tipo_evento?.tipo_evento || 'No especificado',
          evento.espacio_evento || 'No especificado',
          fechaFormateada,
          evento.estado_evento,
          `RD$ ${eventoTotal.toFixed(2)}`
        ];
      }

      const contentHeight = Math.max(...content.map(text =>
        doc.heightOfString(text, { width: Math.max(...colWidths) })
      ));
      const spaceForCurrentRow = contentHeight + 20;

      if (currentY + spaceForCurrentRow > 520) { 
        doc.addPage({ layout: 'landscape' });
        currentY = 100; 
        drawRow(currentY, headerLabels, true); 
        currentY += 20; 
      }

      drawRow(currentY, content);
      doc.moveTo(startX, currentY + contentHeight + 5).lineTo(doc.page.width - doc.page.margins.right, currentY + contentHeight + 5).stroke();
      currentY += spaceForCurrentRow;
    });

    const totalGeneralTextHeight = doc.font('Helvetica-Bold').fontSize(12).heightOfString(`Total General: RD$ ${totalGeneral.toFixed(2)}`, { width: doc.page.width - doc.page.margins.left - doc.page.margins.right });
    const paddingBeforeTotal = 20;
    const potentialTotalY = currentY + paddingBeforeTotal;

    if (potentialTotalY + totalGeneralTextHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage({ layout: 'landscape' });
        doc.y = 100;
    } else {
        doc.y = potentialTotalY;
    }

    doc.font('Helvetica-Bold')
       .fontSize(12)
       .text(`Total General: RD$ ${totalGeneral.toFixed(2)}`, { align: 'right' });

    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).text(`Página ${i + 1} de ${pageCount}`, doc.page.width - doc.page.margins.right - 100, doc.page.height - doc.page.margins.bottom, { align: 'right' });
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

    let personalInfo = null;
    let whereClause: any = {};
    let reportTitle = 'Reporte de Eventos';
    let headerLabels = ['#', 'Cliente', 'Asesor', 'Personal', 'Tipo Evento', 'Espacio', 'Fecha', 'Estado', 'Total'];
    let colWidths = [30, 100, 100, 100, 100, 120, 120, 100, 100];
    let startX;
    let currentY = 0; 
    let totalGeneral = 0; 

    if (id_personal !== 'todos') {
      personalInfo = await Usuario.findOne({
        where: { cedula_usuario: id_personal },
        attributes: ['nombre_usuario', 'apellido_usuario', 'cedula_usuario']
      });

      if (!personalInfo) {
        return res.status(404).json({
          error: 'Personal no encontrado',
          mensaje: 'No existe personal con la cédula proporcionada'
        });
      }
      whereClause.id_personal = id_personal;
      reportTitle = `Reporte de Eventos por Personal`;

      headerLabels = ['#', 'Cliente', 'Asesor', 'Tipo Evento', 'Espacio', 'Fecha', 'Estado', 'Total'];
      colWidths = [40, 120, 120, 120, 120, 100, 100, 100];
    } else {
      reportTitle = 'Reporte General de Eventos por Personal';
    }

    const eventos = await Evento.findAll({
      attributes: [
        'id_evento', 'fecha_evento', 'hora_evento', 'espacio_evento', 'estado_evento', 'total_evento', 'cedula_cliente', 'cedula_asesor'
      ],
      include: [
        { model: Usuario, as: 'cliente', attributes: ['nombre_usuario', 'apellido_usuario', 'cedula_usuario'] },
        { model: Usuario, as: 'asesor', attributes: ['nombre_usuario', 'apellido_usuario', 'cedula_usuario'] },
        { model: TipoEvento, attributes: ['tipo_evento'] },
        {
          model: EmpleadoEvento,
          as: 'empleados_evento', 
          attributes: ['empleado_evento', 'puesto_evento'],
          include: [{
            model: Usuario,
            as: 'empleado', 
            attributes: ['nombre_usuario', 'apellido_usuario', 'cedula_usuario']
          }],
          required: id_personal !== 'todos',
          where: id_personal !== 'todos' ? {
              empleado_evento: id_personal
          } : {}
        }
      ],
      order: [['fecha_evento', 'DESC']] 
    });

    if (!eventos || eventos.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontraron eventos',
        mensaje: id_personal === 'todos' ? 'No hay eventos registrados en general' : 'No hay eventos registrados para este personal'
      });
    }

    const doc = new PDFDocument({ 
      size: 'A4', margin: 40, layout: 'landscape'
    });
    res.setHeader('Content-Disposition', 'inline; filename=reporte_eventos_personal.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    doc.fontSize(18).text(reportTitle, { align: 'center' });
    doc.fontSize(10).text(`Generado el ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(1);
    currentY = doc.y; 

    if (personalInfo) {
      doc.fontSize(12).text(`Personal: ${personalInfo.nombre_usuario} ${personalInfo.apellido_usuario}`, { align: 'left' });
      doc.fontSize(12).text(`Cédula: ${personalInfo.cedula_usuario}`, { align: 'left' });
      doc.moveDown(1);
      currentY = doc.y; 
    }

    startX = doc.page.margins.left; 

    const drawRow = (yPos: number, values: string[], bold = false) => {
      const font = bold ? 'Helvetica-Bold' : 'Helvetica';
      doc.font(font).fontSize(10);
      let x = startX;
      values.forEach((text, i) => {
        doc.text(text, x, yPos, { width: colWidths[i], align: 'left' });
        x += colWidths[i] + 10;
      });
    };

    let tableTop = personalInfo ? currentY + 20 : currentY + 20; 

    let sortedEvents = eventos;
    if (id_personal === 'todos') {
        sortedEvents.sort((a: any, b: any) => {
            const personalA = `${a.personal?.nombre_usuario || ''} ${a.personal?.apellido_usuario || ''}`;
            const personalB = `${b.personal?.nombre_usuario || ''} ${b.personal?.apellido_usuario || ''}`;
            return personalA.localeCompare(personalB);
        });
    }

    let currentPersonalCedula = '';
    let rowIndex = 0; 

    drawRow(tableTop, headerLabels, true);
    doc.moveTo(startX, tableTop + 15).lineTo(doc.page.width - doc.page.margins.right, tableTop + 15).stroke();
    currentY = tableTop + 35; 

    sortedEvents.forEach((evento: any) => {
      if (id_personal === 'todos') {
        if (evento.personal?.cedula_usuario && evento.personal.cedula_usuario !== currentPersonalCedula) {
          if (rowIndex > 0) { 
            currentY += 20; 
          }
          doc.font('Helvetica-Bold').fontSize(12).text(`Personal: ${evento.personal.nombre_usuario} ${evento.personal.apellido_usuario} (Cédula: ${evento.personal.cedula_usuario})`, startX, currentY);
          doc.moveDown(0.5); 
          currentY = doc.y; 
          currentPersonalCedula = evento.personal.cedula_usuario;
          rowIndex = 0; 
        }
      }

      rowIndex++; 
      const fechaEvento = new Date(evento.fecha_evento);
      const fechaFormateada = `${fechaEvento.toLocaleDateString()} ${evento.hora_evento}`;
      const eventoTotal = parseFloat(evento.total_evento?.toString() || '0');
      totalGeneral += eventoTotal;

      let content = [];
      if (id_personal !== 'todos') {
        content = [
          rowIndex.toString(),
          `${evento.cliente?.nombre_usuario || ''} ${evento.cliente?.apellido_usuario || ''}`,
          `${evento.asesor?.nombre_usuario || ''} ${evento.asesor?.apellido_usuario || ''}`,
          evento.tipo_evento?.tipo_evento || 'No especificado',
          evento.espacio_evento || 'No especificado',
          fechaFormateada,
          evento.estado_evento,
          `RD$ ${eventoTotal.toFixed(2)}`
        ];
      } else {
        content = [
          rowIndex.toString(),
          `${evento.cliente?.nombre_usuario || ''} ${evento.cliente?.apellido_usuario || ''}`,
          `${evento.asesor?.nombre_usuario || ''} ${evento.asesor?.apellido_usuario || ''}`,
          `${evento.empleados_evento[0]?.empleado?.nombre_usuario || ''} ${evento.empleados_evento[0]?.empleado?.apellido_usuario || ''}`,
          evento.tipo_evento?.tipo_evento || 'No especificado',
          evento.espacio_evento || 'No especificado',
          fechaFormateada,
          evento.estado_evento,
          `RD$ ${eventoTotal.toFixed(2)}`
        ];
      }

      const contentHeight = Math.max(...content.map(text =>
        doc.heightOfString(text, { width: Math.max(...colWidths) })
      ));
      const spaceForCurrentRow = contentHeight + 20;

      if (currentY + spaceForCurrentRow > 520) { 
        doc.addPage({ layout: 'landscape' });
        currentY = 100; 
        drawRow(currentY, headerLabels, true); 
        currentY += 20; 
      }

      drawRow(currentY, content);
      doc.moveTo(startX, currentY + contentHeight + 5).lineTo(doc.page.width - doc.page.margins.right, currentY + contentHeight + 5).stroke();
      currentY += spaceForCurrentRow;
    });

    const totalGeneralTextHeight = doc.font('Helvetica-Bold').fontSize(12).heightOfString(`Total General: RD$ ${totalGeneral.toFixed(2)}`, { width: doc.page.width - doc.page.margins.left - doc.page.margins.right });
    const paddingBeforeTotal = 20;
    const potentialTotalY = currentY + paddingBeforeTotal;

    if (potentialTotalY + totalGeneralTextHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage({ layout: 'landscape' });
        doc.y = 100;
    } else {
        doc.y = potentialTotalY;
    }

    doc.font('Helvetica-Bold')
       .fontSize(12)
       .text(`Total General: RD$ ${totalGeneral.toFixed(2)}`, { align: 'right' });

    // Agregar pie de página
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).text(`Página ${i + 1} de ${pageCount}`, doc.page.width - doc.page.margins.right - 100, doc.page.height - doc.page.margins.bottom, { align: 'right' });
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