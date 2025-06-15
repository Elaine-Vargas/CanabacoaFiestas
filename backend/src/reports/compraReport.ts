import PDFDocument from 'pdfkit';
import Compra from '../models/Compra_model';
import DetalleCompra from '../models/DetalleCompra_model';
import Proveedor from '../models/Proveedor_model';
import Elemento from '../models/Elemento_model';
import { Request, Response } from 'express';
import { Op } from 'sequelize';

export const ReporteCompraDetalle = async (req: Request, res: Response) => {
  const { id_compra } = req.params;
  const { estado, fecha_inicio, fecha_fin, id_proveedor } = req.query;

  try {
    const doc = new PDFDocument({ layout: 'landscape' });
    res.setHeader('Content-Type', 'application/pdf');

    const formatearMoneda = (monto: number) => {
      return new Intl.NumberFormat('es-DO', {
        style: 'currency',
        currency: 'DOP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(monto || 0);
    };

    const formatearFecha = (fecha: Date | string | null) => {
      if (!fecha) return 'N/A';
      return new Date(fecha).toLocaleDateString('es-DO');
    };

    const formatearHora = (hora: string | null) => {
      if (!hora) return 'N/A';
      return hora;
    };

    // Construir condiciones de filtro
    const whereConditions: any = {};
    
    if (estado && estado !== 'todos') {
      whereConditions.estado_compra = estado;
    }
    
    if (fecha_inicio && fecha_fin) {
      whereConditions.fecha_compra = {
        [Op.between]: [fecha_inicio, fecha_fin]
      };
    }
    
    if (id_proveedor && id_proveedor !== 'todos') {
      whereConditions.id_proveedor = id_proveedor;
    }

    if (id_compra === 'todos') {
      res.setHeader('Content-Disposition', 'attachment; filename=reporte_compras_general.pdf');
      doc.pipe(res);

      doc.fontSize(20).text('Reporte General de Compras', { align: 'center' });
      doc.fontSize(10).text(`Reporte generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`, { align: 'center' });
      doc.moveDown(2);

      // Aplicar filtros si existen
      const compras = await Compra.findAll({
        where: {
          ...whereConditions,
          '$proveedor.tipo_proveedor$': 'Elementos'
        },
        include: [{ 
          model: Proveedor, 
          attributes: ['nombre_proveedor', 'tipo_proveedor'],
          required: true
        }],
        order: [['id_compra', 'ASC']]
      });

      if (!compras || compras.length === 0) {
        doc.fontSize(12).text('No se encontraron compras con los filtros seleccionados.', { align: 'center' });
        doc.end();
        return;
      }

      // Resumen general
      doc.fontSize(14).text('Resumen General', { align: 'center' });
      doc.moveDown(2);

      const totalCompras = compras.length;
      const totalGastos = compras.reduce((sum, comp) => sum + (Number(comp.costo_compra) || 0), 0);
      const comprasCompletadas = compras.filter(comp => comp.estado_compra === 'Completada').length;
      const comprasCanceladas = compras.filter(comp => comp.estado_compra === 'Cancelada').length;

      doc.fontSize(12);
      doc.text(`Total de Compras: ${totalCompras}`);
      doc.text(`Total de Gastos: ${formatearMoneda(totalGastos)}`);
      doc.text(`Compras Completadas: ${comprasCompletadas}`);
      doc.text(`Compras Canceladas: ${comprasCanceladas}`);
      doc.moveDown(3);

      // Tabla de compras
      doc.fontSize(14).text('Detalle de Compras', { align: 'center' });
      doc.moveDown(2);

      const tableHeaders = ['ID\nCompra', 'Fecha', 'Hora', 'Proveedor', 'Costo', 'Estado'];
      const tableRows = compras.map(compra => [
        (compra.id_compra || '').toString(),
        formatearFecha(compra.fecha_compra),
        formatearHora(compra.hora_compra),
        compra.proveedor?.nombre_proveedor || 'N/A',
        formatearMoneda(Number(compra.costo_compra)),
        compra.estado_compra || 'N/A'
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
      res.setHeader('Content-Disposition', `attachment; filename=reporte_compra_${id_compra}.pdf`);
      doc.pipe(res);

      const compra = await Compra.findByPk(id_compra, {
        include: [
          { 
            model: Proveedor, 
            attributes: ['nombre_proveedor', 'tipo_proveedor'],
            required: true,
            where: {
              tipo_proveedor: 'Elementos'
            }
          },
          { model: DetalleCompra, include: [{ model: Elemento, attributes: ['nombre_elemento'] }] }
        ]
      });

      if (!compra) {
        doc.fontSize(12).text('Compra no encontrada.', { align: 'center' });
        doc.end();
        return;
      }

      doc.fontSize(20).text(`Reporte de Compra ID: ${compra.id_compra}`, { align: 'center' });
      doc.fontSize(10).text(`Reporte generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`, { align: 'center' });
      doc.moveDown(2);

      doc.fontSize(12);
      doc.text(`Fecha de Compra: ${formatearFecha(compra.fecha_compra)}`);
      doc.text(`Hora de Compra: ${formatearHora(compra.hora_compra)}`);
      doc.text(`Proveedor: ${compra.proveedor?.nombre_proveedor || 'N/A'}`);
      doc.text(`Costo Total: ${formatearMoneda(Number(compra.costo_compra))}`);
      doc.text(`Estado: ${compra.estado_compra || 'N/A'}`);
      doc.moveDown(3);

      if (compra.detalles && compra.detalles.length > 0) {
        doc.fontSize(14).text('Detalles de la Compra', { align: 'center' });
        doc.moveDown(2);

        const detailTableHeaders = ['Elemento', 'Cantidad', 'Precio Unitario', 'Precio Total'];
        const detailTableRows = compra.detalles.map(detalle => [
          detalle.elemento?.nombre_elemento || 'N/A',
          (detalle.cantidad_compra || 0).toString(),
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
    if (!res.headersSent) {
      res.status(500).send('Error al generar el reporte de compras');
    }
  }
};
