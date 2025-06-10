import PDFDocument from 'pdfkit';
import AlquilerServicio from '../models/AlquilerServicio_model';
import DetalleAlquiler from '../models/DetalleAlquiler_model';
import Evento from '../models/Evento_model';
import Elemento from '../models/Elemento_model';
import { Request, Response } from 'express';

export const ReporteAlquilerDetalle = async (req: Request, res: Response) => {
  const { id_alquiler } = req.params;

  try {
    const doc = new PDFDocument({ layout: 'landscape' });
    res.setHeader('Content-Type', 'application/pdf');

    const formatearMoneda = (monto: number) => {
      return new Intl.NumberFormat('es-DO', {
        style: 'currency',
        currency: 'DOP'
      }).format(monto || 0);
    };

    if (id_alquiler === 'todos') {
      res.setHeader('Content-Disposition', 'attachment; filename=reporte_alquileres_general.pdf');
      doc.pipe(res);

      doc.fontSize(20).text('Reporte General de Alquileres', { align: 'center' });
      doc.fontSize(10).text(`Reporte generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`, { align: 'center' });
      doc.moveDown(2);

      const alquileres = await AlquilerServicio.findAll({
        include: [
          { 
            model: Evento,
            attributes: ['fecha_evento', 'id_evento']
          }
        ],
        order: [['id_alquiler', 'ASC']]
      });

      if (!alquileres || alquileres.length === 0) {
        doc.fontSize(12).text('No se encontraron alquileres.', { align: 'center' });
        doc.end();
        return;
      }

      // Resumen general
      doc.fontSize(14).text('Resumen General', { align: 'center' });
      doc.moveDown(2);

      const totalAlquileres = alquileres.length;
      const totalIngresos = alquileres.reduce((sum, alq) => sum + (Number(alq.total_alquiler) || 0), 0);
      const alquileresActivos = alquileres.filter(alq => alq.estado_alquiler === 'Aceptado').length;
      const alquileresCompletados = alquileres.filter(alq => alq.estado_alquiler === 'Completado').length;
      const alquileresCancelados = alquileres.filter(alq => alq.estado_alquiler === 'Cancelado').length;

      doc.fontSize(12);
      doc.text(`Total de Alquileres: ${totalAlquileres}`);
      doc.text(`Total de Ingresos: ${formatearMoneda(totalIngresos)}`);
      doc.text(`Alquileres Activos: ${alquileresActivos}`);
      doc.text(`Alquileres Completados: ${alquileresCompletados}`);
      doc.text(`Alquileres Cancelados: ${alquileresCancelados}`);
      doc.moveDown(3);

      // Tabla de alquileres
      doc.fontSize(14).text('Detalle de Alquileres', { align: 'center' });
      doc.moveDown(2);

      const tableHeaders = [
        'ID\nAlquiler', 
        'ID\nEvento', 
        'Fecha\nEvento', 
        'Cantidad\nElementos', 
        'Precio\nNeto', 
        'ITBIS', 
        'Total', 
        'Estado'
      ];
      const tableRows = alquileres.map(alquiler => [
        (alquiler.id_alquiler || '').toString(),
        (alquiler.id_evento || '').toString(),
        alquiler.evento?.fecha_evento ? new Date(alquiler.evento.fecha_evento).toLocaleDateString() : 'N/A',
        (alquiler.cant_elementos_alquiler || 0).toString(),
        formatearMoneda(Number(alquiler.precioneto_alquiler)),
        formatearMoneda(Number(alquiler.itbis_alquiler)),
        formatearMoneda(Number(alquiler.total_alquiler)),
        alquiler.estado_alquiler || 'N/A'
      ]);

      const startX = 50;
      const rowHeight = 35;
      const colWidth = (doc.page.width - 2 * startX) / tableHeaders.length;
      const tableBottomMargin = 75;
      const tableTopMarginOnNewPage = 60;

      let initialTableY = doc.y + 20;

      const drawTableHeaders = (yPos: number) => {
        doc.font('Helvetica-Bold');
        tableHeaders.forEach((header, i) => {
          doc.text(header, startX + i * colWidth, yPos, { width: colWidth, align: 'center', lineBreak: true });
        });
        doc.font('Helvetica');
        doc.moveTo(startX, yPos + rowHeight - 5).lineTo(doc.page.width - startX, yPos + rowHeight - 5).stroke();
        doc.y = yPos + rowHeight + 10;
      };

      drawTableHeaders(initialTableY);

      tableRows.forEach((row, rowIndex) => {
        if (doc.y + rowHeight > doc.page.height - tableBottomMargin) {
          doc.addPage();
          drawTableHeaders(tableTopMarginOnNewPage);
        }

        const currentRowY = doc.y;
        row.forEach((cell, i) => {
          doc.text(cell, startX + i * colWidth, currentRowY, { width: colWidth, align: 'center' });
        });
        doc.moveTo(startX, currentRowY + rowHeight - 5).lineTo(doc.page.width - startX, currentRowY + rowHeight - 5).stroke();
        doc.y = currentRowY + rowHeight;
      });

    } else {
      res.setHeader('Content-Disposition', `attachment; filename=reporte_alquiler_${id_alquiler}.pdf`);
      doc.pipe(res);

      const alquiler = await AlquilerServicio.findByPk(id_alquiler, {
        include: [
          { model: Evento, attributes: ['fecha_evento'] },
          { model: DetalleAlquiler, include: [{ model: Elemento, attributes: ['nombre_elemento'] }] }
        ]
      });

      if (!alquiler) {
        doc.fontSize(12).text('Alquiler no encontrado.', { align: 'center' });
        doc.end();
        return;
      }

      doc.fontSize(20).text(`Reporte de Alquiler ID: ${alquiler.id_alquiler}`, { align: 'center' });
      doc.fontSize(10).text(`Reporte generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`, { align: 'center' });
      doc.moveDown(2);

      doc.fontSize(12);
      doc.text(`ID Evento: ${alquiler.id_evento || 'N/A'}`);
      doc.text(`Fecha del Evento: ${alquiler.evento?.fecha_evento ? new Date(alquiler.evento.fecha_evento).toLocaleDateString() : 'N/A'}`);
      doc.text(`Cantidad de Elementos: ${alquiler.cant_elementos_alquiler || 0}`);
      doc.text(`Precio Neto: ${formatearMoneda(Number(alquiler.precioneto_alquiler))}`);
      doc.text(`ITBIS: ${formatearMoneda(Number(alquiler.itbis_alquiler))}`);
      doc.text(`Total: ${formatearMoneda(Number(alquiler.total_alquiler))}`);
      doc.text(`Estado: ${alquiler.estado_alquiler || 'N/A'}`);
      doc.moveDown(3);

      if (alquiler.detalles && alquiler.detalles.length > 0) {
        doc.fontSize(14).text('Detalles del Alquiler', { align: 'center' });
        doc.moveDown(2);

        const detailTableHeaders = ['Elemento', 'Cantidad', 'Precio Unitario', 'Total'];
        const detailTableRows = alquiler.detalles.map(detalle => [
          detalle.elemento?.nombre_elemento || 'N/A',
          (detalle.cantidad_alquiler || 0).toString(),
          formatearMoneda(Number(detalle.precio_unitario)),
          formatearMoneda(Number(detalle.total_alquiler))
        ]);

        const detailStartX = 50;
        const detailStartY = doc.y + 20;
        const detailRowHeight = 30;
        const detailColWidth = (doc.page.width - 2 * detailStartX) / detailTableHeaders.length;

        doc.font('Helvetica-Bold');
        detailTableHeaders.forEach((header, i) => {
          doc.text(header, detailStartX + i * detailColWidth, detailStartY, { width: detailColWidth, align: 'center' });
        });
        doc.font('Helvetica');
        doc.moveTo(detailStartX, detailStartY + detailRowHeight - 10).lineTo(doc.page.width - detailStartX, detailStartY + detailRowHeight - 10).stroke();

        detailTableRows.forEach((row, rowIndex) => {
          const currentY = detailStartY + (rowIndex + 1) * detailRowHeight;
          row.forEach((cell, i) => {
            doc.text(cell, detailStartX + i * detailColWidth, currentY, { width: detailColWidth, align: 'center' });
          });
          doc.moveTo(detailStartX, currentY + detailRowHeight - 10).lineTo(doc.page.width - detailStartX, currentY + detailRowHeight - 10).stroke();
        });
      } else {
        doc.fontSize(12).text('No se encontraron detalles para este alquiler.', { align: 'center' });
      }
    }

    doc.end();

  } catch (error) {
    console.error('Error al generar el reporte de alquileres:', error);
    if (!res.headersSent) {
      res.status(500).send('Error al generar el reporte de alquileres');
    }
  }
};
