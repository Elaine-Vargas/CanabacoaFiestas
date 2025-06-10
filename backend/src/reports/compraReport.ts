import PDFDocument from 'pdfkit';
import Compra from '../models/Compra_model';
import DetalleCompra from '../models/DetalleCompra_model';
import Proveedor from '../models/Proveedor_model';
import Elemento from '../models/Elemento_model';
import { Request, Response } from 'express';

export const ReporteCompraDetalle = async (req: Request, res: Response) => {
  const { id_compra } = req.params;

  try {
    const doc = new PDFDocument({ layout: 'landscape' });
    res.setHeader('Content-Type', 'application/pdf');

    const formatearMoneda = (monto: number) => {
      return new Intl.NumberFormat('es-DO', {
        style: 'currency',
        currency: 'DOP'
      }).format(monto);
    };

    if (id_compra === 'todos') {
      res.setHeader('Content-Disposition', 'attachment; filename=reporte_compras_general.pdf');
      doc.pipe(res);

      doc.fontSize(20).text('Reporte General de Compras', { align: 'center' });
      doc.moveDown();

      const compras = await Compra.findAll({
        include: [{ model: Proveedor, attributes: ['nombre_proveedor'] }]
      });

      if (compras.length === 0) {
        doc.fontSize(12).text('No se encontraron compras.', { align: 'center' });
        doc.end();
        return;
      }

      const tableHeaders = ['ID Compra', 'Fecha', 'Proveedor', 'Costo', 'Estado'];
      const tableRows = compras.map(compra => [
        compra.id_compra.toString(),
        new Date(compra.fecha_compra).toLocaleDateString(),
        compra.proveedor?.nombre_proveedor || 'N/A',
        formatearMoneda(Number(compra.costo_compra)),
        compra.estado_compra
      ]);

      const startX = 50;
      const startY = doc.y + 20;
      const rowHeight = 30;
      const colWidth = (doc.page.width - 2 * startX) / tableHeaders.length;

      doc.font('Helvetica-Bold');
      tableHeaders.forEach((header, i) => {
        doc.text(header, startX + i * colWidth, startY, { width: colWidth, align: 'center' });
      });
      doc.font('Helvetica');
      doc.moveTo(startX, startY + rowHeight - 10).lineTo(doc.page.width - startX, startY + rowHeight - 10).stroke();

      tableRows.forEach((row, rowIndex) => {
        const currentY = startY + (rowIndex + 1) * rowHeight;
        row.forEach((cell, i) => {
          doc.text(cell, startX + i * colWidth, currentY, { width: colWidth, align: 'center' });
        });
        doc.moveTo(startX, currentY + rowHeight - 10).lineTo(doc.page.width - startX, currentY + rowHeight - 10).stroke();
      });

    } else {
      res.setHeader('Content-Disposition', `attachment; filename=reporte_compra_${id_compra}.pdf`);
      doc.pipe(res);

      const compra = await Compra.findByPk(id_compra, {
        include: [
          { model: Proveedor, attributes: ['nombre_proveedor'] },
          { model: DetalleCompra, include: [{ model: Elemento, attributes: ['nombre_elemento'] }] }
        ]
      });

      if (!compra) {
        doc.fontSize(12).text('Compra no encontrada.', { align: 'center' });
        doc.end();
        return;
      }

      doc.fontSize(20).text(`Reporte de Compra ID: ${compra.id_compra}`, { align: 'center' });
      doc.moveDown();

      doc.fontSize(12).text(`Fecha de Compra: ${new Date(compra.fecha_compra).toLocaleDateString()}`);
      doc.text(`Hora de Compra: ${compra.hora_compra}`);
      doc.text(`Proveedor: ${compra.proveedor?.nombre_proveedor || 'N/A'}`);
      doc.text(`Costo Total: ${formatearMoneda(Number(compra.costo_compra))}`);
      doc.text(`Estado: ${compra.estado_compra}`);
      doc.moveDown();

      doc.fontSize(14).text('Detalles de la Compra', { align: 'center' });
      doc.moveDown();

      if (compra.detalles && compra.detalles.length > 0) {
        const detailTableHeaders = ['Elemento', 'Cantidad', 'Precio Unitario', 'Precio Total'];
        const detailTableRows = compra.detalles.map(detalle => [
          detalle.elemento?.nombre_elemento || 'N/A',
          detalle.cantidad_compra.toString(),
          formatearMoneda(Number(detalle.precio_unitario)),
          formatearMoneda(Number(detalle.precio_total))
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
        doc.fontSize(12).text('No se encontraron detalles para esta compra.', { align: 'center' });
      }
    }

    doc.end();

  } catch (error) {
    console.error('Error al generar el reporte de compras:', error);
    res.status(500).send('Error al generar el reporte de compras');
  }
};
