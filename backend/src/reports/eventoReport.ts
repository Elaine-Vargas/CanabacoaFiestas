import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import Usuario from '../models/Usuario_model';
import Evento from '../models/Evento_model';
import TipoEvento from '../models/TipoEvento_model';
import EmpleadoEvento from '../models/EmpleadoEvento_model';
import { Op } from 'sequelize';

export const generarReporteEventos = async (req: Request, res: Response) => {
  try {
    const { tipo_evento, fecha_inicio, fecha_fin } = req.query;
    
    let whereClause: any = {};

    // Aplicar filtro de tipo de evento si está presente
    if (tipo_evento && tipo_evento !== 'todos' && tipo_evento !== '') {
      const tipoEventoId = parseInt(String(tipo_evento), 10);
      if (!isNaN(tipoEventoId)) {
        whereClause.id_tipo_evento = tipoEventoId;
      }
    }

    // Aplicar filtro de rango de fechas si está presente
    if (fecha_inicio && fecha_fin) {
      whereClause.fecha_evento = {
        [Op.between]: [String(fecha_inicio), String(fecha_fin)]
      };
    }

    const eventos = await Evento.findAll({
      where: whereClause,
      attributes: [
        'id_evento',
        'fecha_evento',
        'hora_evento',
        'espacio_evento',
        'estado_solicitud',
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
      let mensaje = 'No hay eventos registrados';
      
      if (tipo_evento && tipo_evento !== 'todos' && tipo_evento !== '') {
        const tipoEventoInfo = await TipoEvento.findByPk(Number(tipo_evento));
        mensaje += ` del tipo "${tipoEventoInfo?.tipo_evento || tipo_evento}"`;
      }
      
      if (fecha_inicio && fecha_fin && fecha_inicio !== '' && fecha_fin !== '') {
        mensaje += ` en el período del ${fecha_inicio} al ${fecha_fin}`;
      }
      
      return res.status(404).json({ 
        error: 'No se encontraron eventos',
        mensaje: mensaje
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
    
    // Agregar información de filtros aplicados
    if (tipo_evento && tipo_evento !== 'todos') {
      const tipoEventoInfo = await TipoEvento.findByPk(Number(tipo_evento));
      doc.fontSize(10).text(`Tipo de Evento: ${tipoEventoInfo?.tipo_evento || tipo_evento}`, { align: 'center' });
    }
    
    if (fecha_inicio && fecha_fin) {
      doc.fontSize(10).text(`Período: ${fecha_inicio} al ${fecha_fin}`, { align: 'center' });
    }
    
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
        evento.estado_solicitud,
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
    const { tipo_evento, fecha_inicio, fecha_fin } = req.query;

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

    // Aplicar filtro de tipo de evento si está presente
    if (tipo_evento && tipo_evento !== 'todos' && tipo_evento !== '') {
      const tipoEventoId = parseInt(String(tipo_evento), 10);
      if (!isNaN(tipoEventoId)) {
        whereClause.id_tipo_evento = tipoEventoId;
      }
    }

    // Aplicar filtro de rango de fechas si está presente
    if (fecha_inicio && fecha_fin) {
      whereClause.fecha_evento = {
        [Op.between]: [String(fecha_inicio), String(fecha_fin)]
      };
    }

    const eventos = await Evento.findAll({
      where: whereClause,
      attributes: [
        'id_evento', 'fecha_evento', 'hora_evento', 'espacio_evento', 'estado_solicitud', 'total_evento', 'cedula_cliente', 'cedula_asesor', 'id_tipo_evento'
      ],
      include: [
        { model: Usuario, as: 'cliente', attributes: ['nombre_usuario', 'apellido_usuario', 'cedula_usuario'] },
        { model: Usuario, as: 'asesor', attributes: ['nombre_usuario', 'apellido_usuario', 'cedula_usuario'] },
        { model: TipoEvento, attributes: ['tipo_evento'] }
      ],
      order: [['fecha_evento', 'DESC']] 
    });

    if (!eventos || eventos.length === 0) {
      let mensaje = cedula_cliente === 'todos' ? 'No hay eventos registrados en general' : 'No hay eventos registrados para este cliente';
      
      if (tipo_evento && tipo_evento !== 'todos' && tipo_evento !== '') {
        const tipoEventoInfo = await TipoEvento.findByPk(Number(tipo_evento));
        mensaje += ` del tipo "${tipoEventoInfo?.tipo_evento || tipo_evento}"`;
      }
      
      if (fecha_inicio && fecha_fin && fecha_inicio !== '' && fecha_fin !== '') {
        mensaje += ` en el período del ${fecha_inicio} al ${fecha_fin}`;
      }
      
      return res.status(404).json({
        error: 'No se encontraron eventos',
        mensaje: mensaje
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
          evento.estado_solicitud,
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
          evento.estado_solicitud,
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

    // Agregar información de filtros aplicados
    if (tipo_evento && tipo_evento !== 'todos') {
      const tipoEventoInfo = await TipoEvento.findByPk(Number(tipo_evento));
      doc.fontSize(10).text(`Tipo de Evento: ${tipoEventoInfo?.tipo_evento || tipo_evento}`, { align: 'center' });
    }
    
    if (fecha_inicio && fecha_fin) {
      doc.fontSize(10).text(`Período: ${fecha_inicio} al ${fecha_fin}`, { align: 'center' });
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
    const { tipo_evento, fecha_inicio, fecha_fin } = req.query;

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

    // Aplicar filtro de tipo de evento si está presente
    if (tipo_evento && tipo_evento !== 'todos' && tipo_evento !== '') {
      const tipoEventoId = parseInt(String(tipo_evento), 10);
      if (!isNaN(tipoEventoId)) {
        whereClause.id_tipo_evento = tipoEventoId;
      }
    }

    // Aplicar filtro de rango de fechas si está presente
    if (fecha_inicio && fecha_fin) {
      whereClause.fecha_evento = {
        [Op.between]: [String(fecha_inicio), String(fecha_fin)]
      };
    }

    const eventos = await Evento.findAll({
      where: whereClause,
      attributes: [
        'id_evento', 'fecha_evento', 'hora_evento', 'espacio_evento', 'estado_solicitud', 'total_evento', 'cedula_cliente', 'cedula_asesor', 'id_tipo_evento'
      ],
      include: [
        { model: Usuario, as: 'cliente', attributes: ['nombre_usuario', 'apellido_usuario', 'cedula_usuario'] },
        { model: Usuario, as: 'asesor', attributes: ['nombre_usuario', 'apellido_usuario', 'cedula_usuario'] },
        { model: TipoEvento, attributes: ['tipo_evento'] }
      ],
      order: [['fecha_evento', 'DESC']] 
    });

    if (!eventos || eventos.length === 0) {
      let mensaje = cedula_asesor === 'todos' ? 'No hay eventos registrados en general' : 'No hay eventos registrados para este asesor';
      
      if (tipo_evento && tipo_evento !== 'todos' && tipo_evento !== '') {
        const tipoEventoInfo = await TipoEvento.findByPk(Number(tipo_evento));
        mensaje += ` del tipo "${tipoEventoInfo?.tipo_evento || tipo_evento}"`;
      }
      
      if (fecha_inicio && fecha_fin && fecha_inicio !== '' && fecha_fin !== '') {
        mensaje += ` en el período del ${fecha_inicio} al ${fecha_fin}`;
      }
      
      return res.status(404).json({ 
        error: 'No se encontraron eventos',
        mensaje: mensaje
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
          evento.estado_solicitud,
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
          evento.estado_solicitud,
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

    // Agregar información de filtros aplicados
    if (tipo_evento && tipo_evento !== 'todos') {
      const tipoEventoInfo = await TipoEvento.findByPk(Number(tipo_evento));
      doc.fontSize(10).text(`Tipo de Evento: ${tipoEventoInfo?.tipo_evento || tipo_evento}`, { align: 'center' });
    }
    
    if (fecha_inicio && fecha_fin) {
      doc.fontSize(10).text(`Período: ${fecha_inicio} al ${fecha_fin}`, { align: 'center' });
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
    const { tipo_evento, fecha_inicio, fecha_fin } = req.query;

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

    // Aplicar filtro de tipo de evento si está presente
    if (tipo_evento && tipo_evento !== 'todos' && tipo_evento !== '') {
      const tipoEventoId = parseInt(String(tipo_evento), 10);
      if (!isNaN(tipoEventoId)) {
        whereClause.id_tipo_evento = tipoEventoId;
      }
    }

    // Aplicar filtro de rango de fechas si está presente
    if (fecha_inicio && fecha_fin) {
      whereClause.fecha_evento = {
        [Op.between]: [String(fecha_inicio), String(fecha_fin)]
      };
    }

    const eventos = await Evento.findAll({
      attributes: [
        'id_evento', 'fecha_evento', 'hora_evento', 'espacio_evento', 'estado_solicitud', 'total_evento', 'cedula_cliente', 'cedula_asesor', 'id_tipo_evento'
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
      where: whereClause,
      order: [['fecha_evento', 'DESC']] 
    });

    if (!eventos || eventos.length === 0) {
      let mensaje = id_personal === 'todos' ? 'No hay eventos registrados en general' : 'No hay eventos registrados para este personal';
      
      if (tipo_evento && tipo_evento !== 'todos' && tipo_evento !== '') {
        const tipoEventoInfo = await TipoEvento.findByPk(Number(tipo_evento));
        mensaje += ` del tipo "${tipoEventoInfo?.tipo_evento || tipo_evento}"`;
      }
      
      if (fecha_inicio && fecha_fin && fecha_inicio !== '' && fecha_fin !== '') {
        mensaje += ` en el período del ${fecha_inicio} al ${fecha_fin}`;
      }
      
      return res.status(404).json({ 
        error: 'No se encontraron eventos',
        mensaje: mensaje
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
          evento.estado_solicitud,
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
          evento.estado_solicitud,
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

    // Agregar información de filtros aplicados
    if (tipo_evento && tipo_evento !== 'todos') {
      const tipoEventoInfo = await TipoEvento.findByPk(Number(tipo_evento));
      doc.fontSize(10).text(`Tipo de Evento: ${tipoEventoInfo?.tipo_evento || tipo_evento}`, { align: 'center' });
    }
    
    if (fecha_inicio && fecha_fin) {
      doc.fontSize(10).text(`Período: ${fecha_inicio} al ${fecha_fin}`, { align: 'center' });
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

export const generarReporteEquipos = async (req: Request, res: Response) => {
  try {
    const { evento_id, empleado_id, puesto } = req.query;

    const whereClause: any = {};
    const conditions: any[] = [];

    if (evento_id && evento_id !== 'todos') {
      conditions.push({ id_evento: evento_id });
    }

    if (empleado_id && empleado_id !== 'todos') {
      conditions.push({ empleado_evento: empleado_id });
    }

    if (puesto && puesto !== 'todos') {
      conditions.push({ puesto_evento: puesto });
    }

    if (conditions.length > 0) {
      whereClause[Op.and] = conditions;
    }

    console.log('Filtros aplicados:', whereClause);

    // Obtener los empleados con sus eventos
    const empleadosEventos = await EmpleadoEvento.findAll({
      where: whereClause,
      include: [
        {
          model: Evento,
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
            }
          ],
          // Si se especifica un evento, asegurarse de que solo se incluya ese evento
          ...(evento_id && evento_id !== 'todos' ? {
            where: {
              id_evento: evento_id
            }
          } : {})
        },
        {
          model: Usuario,
          as: 'empleado',
          attributes: ['nombre_usuario', 'apellido_usuario', 'cedula_usuario'],
          where: {
            id_rol: 3, // Solo incluir usuarios con rol de empleado (id_rol = 3)
            ...(empleado_id && empleado_id !== 'todos' ? { cedula_usuario: empleado_id } : {})
          },
          required: true
        }
      ],
      order: [
        ['id_evento', 'ASC'],
        ['puesto_evento', 'ASC']
      ]
    });

    if (!empleadosEventos || empleadosEventos.length === 0) {
      let mensaje = 'No se encontraron registros de equipos para los criterios especificados.';
      
      if (evento_id && evento_id !== 'todos') {
        mensaje = `No se encontraron empleados asignados al evento ${evento_id}`;
      }
      if (empleado_id && empleado_id !== 'todos') {
        if (puesto && puesto !== 'todos') {
          mensaje = `No se encontró el empleado con ID ${empleado_id} en el puesto ${puesto} para los eventos.`;
        } else {
          mensaje = `No se encontraron eventos asignados al empleado ${empleado_id}`;
        }
      }
      if (puesto && puesto !== 'todos' && !empleado_id) {
        mensaje = `No se encontraron empleados con el puesto ${puesto}`;
      }
      
      return res.status(404).json({ 
        mensaje: mensaje
      });
    }

    // Crear el documento PDF en formato horizontal
    const doc = new PDFDocument({ 
      size: 'A4', 
      layout: 'landscape',
      margin: 50
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_equipos.pdf');
    doc.pipe(res);

    // Título del reporte
    doc.fontSize(20).text('Reporte de Equipos', { align: 'center' });
    doc.moveDown();

    // Fecha de generación
    doc.fontSize(12).text(`Fecha de generación: ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.moveDown();

    // Información específica del evento si se seleccionó uno
    if (evento_id && evento_id !== 'todos' && empleadosEventos.length > 0) {
      const evento = empleadosEventos[0].evento;
      if (evento) {
        doc.fontSize(14).text('Información del Evento:', { underline: true });
        doc.fontSize(12);
        doc.text(`ID del Evento: ${evento.id_evento}`);
        doc.text(`Fecha: ${new Date(evento.fecha_evento).toLocaleDateString()}`);
        doc.text(`Cliente: ${evento.cliente?.nombre_usuario} ${evento.cliente?.apellido_usuario}`);
        doc.text(`Asesor: ${evento.asesor?.nombre_usuario} ${evento.asesor?.apellido_usuario}`);
        doc.moveDown();
      }
    }

    // Información específica del empleado si se seleccionó uno
    if (empleado_id && empleado_id !== 'todos' && empleadosEventos.length > 0) {
      const empleado = empleadosEventos[0].empleado;
      if (empleado) {
        doc.fontSize(14).text('Información del Empleado:', { underline: true });
        doc.fontSize(12);
        doc.text(`Nombre: ${empleado.nombre_usuario} ${empleado.apellido_usuario}`);
        doc.text(`Cédula: ${empleado.cedula_usuario}`);
        doc.moveDown();
      }
    }

    // Filtros aplicados (solo si hay filtros adicionales)
    const hasFilters = (puesto && puesto !== 'todos');

    if (hasFilters) {
      doc.fontSize(12).text('Filtros aplicados:', { underline: true });
      if (puesto && puesto !== 'todos') {
        doc.text(`Puesto: ${puesto}`);
      }
      doc.moveDown();
    }

    // Tabla de empleados
    const tableTop = doc.y + 20;
    const tableLeft = 50;
    const rowHeight = 30;
    
    // Determinar las columnas basadas en los filtros
    let headers: string[] = [];
    let colWidths: number[] = [];
    
    if (evento_id && evento_id !== 'todos') {
      // Si hay un evento específico, solo mostrar empleado y puesto
      headers = ['Empleado', 'Puesto'];
      colWidths = [300, 300];
    } else if (empleado_id && empleado_id !== 'todos') {
      // Si hay un empleado específico, mostrar evento y puesto
      headers = ['Evento', 'Fecha', 'Puesto'];
      colWidths = [200, 150, 250];
    } else {
      // Si no hay filtros específicos, mostrar todas las columnas
      headers = ['ID Evento', 'Fecha Evento', 'Cliente', 'Asesor', 'Empleado', 'Puesto'];
      colWidths = [80, 120, 120, 120, 120, 120];
    }

    let currentY = tableTop;

    // Encabezados de la tabla
    doc.fontSize(12);
    headers.forEach((header, i) => {
      doc.text(header, tableLeft + colWidths.slice(0, i).reduce((a, b) => a + b, 0), currentY);
    });
    currentY += rowHeight;

    // Línea separadora
    doc.moveTo(tableLeft, currentY).lineTo(tableLeft + colWidths.reduce((a, b) => a + b, 0), currentY).stroke();
    currentY += 10;

    // Datos de la tabla
    doc.fontSize(10);
    empleadosEventos.forEach((empleadoEvento) => {
      // Verificar si necesitamos una nueva página
      if (currentY > 500) {
        doc.addPage({ layout: 'landscape' });
        currentY = 50;
      }

      const evento = empleadoEvento.evento;
      const empleado = empleadoEvento.empleado;
      const cliente = evento?.cliente;
      const asesor = evento?.asesor;

      let rowData: string[] = [];
      
      if (evento_id && evento_id !== 'todos') {
        // Si hay un evento específico
        rowData = [
          empleado ? `${empleado.nombre_usuario} ${empleado.apellido_usuario}` : '',
          empleadoEvento.puesto_evento
        ];
      } else if (empleado_id && empleado_id !== 'todos') {
        // Si hay un empleado específico
        rowData = [
          evento ? `Evento #${evento.id_evento}` : '',
          evento?.fecha_evento ? new Date(evento.fecha_evento).toLocaleDateString() : '',
          empleadoEvento.puesto_evento
        ];
      } else {
        // Si no hay filtros específicos
        rowData = [
          evento?.id_evento.toString() || '',
          evento?.fecha_evento ? new Date(evento.fecha_evento).toLocaleDateString() : '',
          cliente ? `${cliente.nombre_usuario} ${cliente.apellido_usuario}` : '',
          asesor ? `${asesor.nombre_usuario} ${asesor.apellido_usuario}` : '',
          empleado ? `${empleado.nombre_usuario} ${empleado.apellido_usuario}` : '',
          empleadoEvento.puesto_evento
        ];
      }

      rowData.forEach((text, i) => {
        doc.text(text, tableLeft + colWidths.slice(0, i).reduce((a, b) => a + b, 0), currentY);
      });

      currentY += rowHeight;
    });

    // Finalizar el documento
    doc.end();
  } catch (error) {
    console.error('Error al generar el reporte de equipos:', error);
    res.status(500).json({ mensaje: 'Error al generar el reporte de equipos' });
  }
}; 