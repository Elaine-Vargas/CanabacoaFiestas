import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import Proveedor from '../models/Proveedor_model';
import Direccion from '../models/Direccion_model';

export const ReporteProveedoresPorTipoYEstado = async (req: Request, res: Response) => {
  try {
    const { tipo_proveedor, estado_proveedor } = req.params;

    const whereClause: any = { };

    // Solo aplicar filtros si se proporcionan en la ruta específica
    if (tipo_proveedor && tipo_proveedor !== 'todos') {
      whereClause.tipo_proveedor = tipo_proveedor;
    }

    if (estado_proveedor && estado_proveedor !== 'todos') {
      whereClause.estado_proveedor = estado_proveedor;
    }

    const proveedores = await Proveedor.findAll({
      where: whereClause,
      include: [Direccion],
      order: [['nombre_proveedor', 'ASC']]
    });

    if (!proveedores || proveedores.length === 0) {
      return res.status(404).json({
        error: 'No se encontraron proveedores',
        mensaje: `No se encontraron proveedores${tipo_proveedor ? ` de tipo ${tipo_proveedor}` : ''}${estado_proveedor ? ` y estado ${estado_proveedor}` : ''}`
      });
    }

    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 40,
      layout: 'landscape'
    });

    res.setHeader('Content-Disposition', 'inline; filename=reporte_proveedores.pdf');
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    // Título
    const tituloTipo = tipo_proveedor && tipo_proveedor !== 'todos' ? ` - Tipo: ${tipo_proveedor}` : '';
    const tituloEstado = estado_proveedor && estado_proveedor !== 'todos' ? ` - Estado: ${estado_proveedor}` : '';
    doc.font('Helvetica').fontSize(18).text(`Reporte de Proveedores${tituloTipo}${tituloEstado}`, { align: 'center' });
    doc.moveDown(1);

    // Encabezado de tabla
    const tableTop = 100;
    const colWidths = [30, 100, 140, 100, 160, 160, 60, 120];
    const startX = doc.page.margins.left;
    const endX = doc.page.width - doc.page.margins.right;

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
    drawRow(tableTop, ['#', 'Tipo', 'Nombre', 'Teléfono', 'Correo', 'Dirección', 'Estado'], true);
    
    // Línea horizontal después del encabezado
    doc.moveTo(startX, tableTop + 15)
       .lineTo(endX, tableTop + 15)
       .stroke();

    // Dibujar filas
    let y = tableTop + 20;
    proveedores.forEach((proveedor, i) => {
      if (y > 520) {
        doc.addPage({ layout: 'landscape' });
        y = 100;
        drawRow(y, ['#', 'Tipo', 'Nombre', 'Teléfono', 'Correo', 'Dirección', 'Estado'], true);
        y += 20;
      }

      const direccionCompleta = proveedor.direccion 
        ? `${proveedor.direccion.calle}, ${proveedor.direccion.sector}`
        : 'No disponible';

      const content = [
        (i + 1).toString(),
        proveedor.tipo_proveedor,
        proveedor.nombre_proveedor,
        proveedor.tel_proveedor,
        proveedor.correo_proveedor,
        direccionCompleta,
        proveedor.estado_proveedor
      ];

      // Calcular la altura máxima necesaria para cada columna
      const rowHeights = content.map((text, index) => {
        const lines = doc.heightOfString(text, { width: colWidths[index] });
        return lines;
      });
      const maxHeight = Math.max(...rowHeights);

      // Dibujar el contenido con la altura calculada
      drawRow(y, content);

      // Dibujar línea horizontal después de la fila
      doc.moveTo(startX, y + maxHeight + 5)
         .lineTo(endX, y + maxHeight + 5)
         .stroke();

      // Actualizar la posición Y para la siguiente fila
      y += maxHeight + 20;
    });

    doc.end();
  } catch (error) {
    console.error('Error al generar reporte de proveedores:', error);
    res.status(500).json({ 
      error: 'Error al generar reporte de proveedores',
      mensaje: 'Ocurrió un error al generar el reporte'
    });
  }
};
