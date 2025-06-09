import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import Elemento from '../models/Elemento_model';
import SubcategoriaElemento from '../models/SubcategoriaElemento_model';
import ColorElemento from '../models/ColorElemento_model';
import MaterialElemento from '../models/MaterialElemento_model';
import DetalleAlquiler from '../models/DetalleAlquiler_model';
import Evento from '../models/Evento_model';
import { Op } from 'sequelize';

export const generarReporteCatalogo = async (req: Request, res: Response) => {
  try {
    const { subcategoria, color, material, agrupar_por } = req.query;
    
    let whereClause: any = {};

    // Aplicar filtros si están presentes
    if (subcategoria && subcategoria !== 'todos') {
      whereClause.id_subcategoria = subcategoria;
    }

    if (color && color !== 'todos') {
      whereClause.id_color = color;
    }

    if (material && material !== 'todos') {
      whereClause.id_material = material;
    }

    const elementos = await Elemento.findAll({
      where: whereClause,
      include: [
        { 
          model: SubcategoriaElemento,
          attributes: ['nombre_subcategoria']
        },
        {
          model: ColorElemento,
          attributes: ['nombre_color']
        },
        {
          model: MaterialElemento,
          attributes: ['nombre_material']
        }
      ],
      order: [['nombre_elemento', 'ASC']]
    });

    if (!elementos || elementos.length === 0) {
      let mensaje = 'No hay elementos registrados';
      
      if (subcategoria && subcategoria !== 'todos') {
        const subcategoriaInfo = await SubcategoriaElemento.findByPk(Number(subcategoria));
        mensaje += ` en la subcategoría "${subcategoriaInfo?.nombre_subcategoria || subcategoria}"`;
      }
      
      if (color && color !== 'todos') {
        const colorInfo = await ColorElemento.findByPk(Number(color));
        mensaje += ` del color "${colorInfo?.nombre_color || color}"`;
      }
      
      if (material && material !== 'todos') {
        const materialInfo = await MaterialElemento.findByPk(Number(material));
        mensaje += ` del material "${materialInfo?.nombre_material || material}"`;
      }
      
      return res.status(404).json({ 
        error: 'No se encontraron elementos',
        mensaje: mensaje
      });
    }

    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 40,
      layout: 'landscape'
    });

    res.setHeader('Content-Disposition', 'inline; filename=reporte_elementos.pdf');
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    // Título y fecha del reporte
    doc.fontSize(18).text('Reporte de Elementos', { align: 'center' });
    doc.fontSize(10).text(`Generado el ${new Date().toLocaleDateString()}`, { align: 'center' });
    
    // Agregar información de filtros aplicados
    if (subcategoria && subcategoria !== 'todos') {
      const subcategoriaInfo = await SubcategoriaElemento.findByPk(Number(subcategoria));
      doc.fontSize(10).text(`Subcategoría: ${subcategoriaInfo?.nombre_subcategoria || subcategoria}`, { align: 'center' });
    }
    
    if (color && color !== 'todos') {
      const colorInfo = await ColorElemento.findByPk(Number(color));
      doc.fontSize(10).text(`Color: ${colorInfo?.nombre_color || color}`, { align: 'center' });
    }
    
    if (material && material !== 'todos') {
      const materialInfo = await MaterialElemento.findByPk(Number(material));
      doc.fontSize(10).text(`Material: ${materialInfo?.nombre_material || material}`, { align: 'center' });
    }
    
    doc.moveDown(1);

    // Encabezado de tabla
    const tableTop = 120;
    const colWidths = [40, 150, 100, 100, 100, 100, 100, 100];
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
    drawRow(tableTop, ['#', 'Elemento', 'Subcategoría', 'Color', 'Material', 'Cantidad Total', 'Disponibles', 'Estado'], true);
    
    // Línea horizontal después del encabezado
    doc.moveTo(startX, tableTop + 15)
       .lineTo(endX, tableTop + 15)
       .stroke();

    // Dibujar filas
    let y = tableTop + 35;
    let totalElementos = 0;
    let totalDisponibles = 0;

    // Agrupar elementos si se especifica
    let elementosAgrupados = elementos;
    if (agrupar_por) {
      const agruparPorStr = String(agrupar_por);
      switch (agruparPorStr) {
        case 'subcategoria':
          elementosAgrupados.sort((a: any, b: any) => 
            (a.subcategoria?.nombre_subcategoria || '').localeCompare(b.subcategoria?.nombre_subcategoria || '')
          );
          break;
        case 'color':
          elementosAgrupados.sort((a: any, b: any) => 
            (a.color?.nombre_color || '').localeCompare(b.color?.nombre_color || '')
          );
          break;
        case 'material':
          elementosAgrupados.sort((a: any, b: any) => 
            (a.material?.nombre_material || '').localeCompare(b.material?.nombre_material || '')
          );
          break;
      }
    }

    let currentGroup = '';
    let rowIndex = 0;

    for (const elemento of elementosAgrupados) {
      if (agrupar_por) {
        const agruparPorStr = String(agrupar_por);
        let groupValue = '';
        switch (agruparPorStr) {
          case 'subcategoria':
            groupValue = elemento.subcategoria?.nombre_subcategoria || 'Sin subcategoría';
            break;
          case 'color':
            groupValue = elemento.color?.nombre_color || 'Sin color';
            break;
          case 'material':
            groupValue = elemento.material?.nombre_material || 'Sin material';
            break;
        }

        if (groupValue !== currentGroup) {
          if (rowIndex > 0) {
            y += 20;
          }
          doc.font('Helvetica-Bold').fontSize(12)
             .text(`${agruparPorStr.charAt(0).toUpperCase() + agruparPorStr.slice(1)}: ${groupValue}`, startX, y);
          y += 20;
          currentGroup = groupValue;
          rowIndex = 0;
        }
      }

      rowIndex++;
      totalElementos += elemento.cantidad_total;
      totalDisponibles += elemento.cantidad_disponible;

      const content = [
        rowIndex.toString(),
        elemento.nombre_elemento,
        elemento.subcategoria?.nombre_subcategoria || 'No especificado',
        elemento.color?.nombre_color || 'No especificado',
        elemento.material?.nombre_material || 'No especificado',
        elemento.cantidad_total.toString(),
        elemento.cantidad_disponible.toString(),
        elemento.estado_elemento
      ];

      const contentHeight = Math.max(...content.map(text => 
        doc.heightOfString(text, { width: Math.max(...colWidths) })
      ));

      if (y + contentHeight + 20 > 520) {
        doc.addPage({ layout: 'landscape' });
        y = 100;
        drawRow(y, ['#', 'Elemento', 'Subcategoría', 'Color', 'Material', 'Cantidad Total', 'Disponibles', 'Estado'], true);
        y += 35;
      }

      drawRow(y, content);
      doc.moveTo(startX, y + contentHeight + 5)
         .lineTo(endX, y + contentHeight + 5)
         .stroke();

      y += contentHeight + 20;
    }

    // Agregar totales
    doc.moveDown(2);
    doc.font('Helvetica-Bold')
       .fontSize(12)
       .text(`Total de Elementos: ${totalElementos}`, { align: 'right' });
    doc.font('Helvetica-Bold')
       .fontSize(12)
       .text(`Total Disponibles: ${totalDisponibles}`, { align: 'right' });

    doc.end();
  } catch (error) {
    console.error('Error al generar reporte de elementos:', error);
    res.status(500).json({ 
      error: 'Error al generar el reporte',
      mensaje: 'Ocurrió un error al generar el reporte de elementos'
    });
  }
};

export const generarReporteDetalleAlquiler = async (req: Request, res: Response) => {
  try {
    const { id_elemento } = req.params;
    const { fecha_inicio, fecha_fin } = req.query;

    let whereClause: any = {};

    if (id_elemento !== 'todos') {
      whereClause.id_elemento = id_elemento;
    }

    if (fecha_inicio && fecha_fin) {
      whereClause.fecha_alquiler = {
        [Op.between]: [String(fecha_inicio), String(fecha_fin)]
      };
    }

    const detallesAlquiler = await DetalleAlquiler.findAll({
      where: whereClause,
      include: [
        {
          model: Elemento,
          attributes: ['nombre_elemento'],
          include: [
            {
              model: SubcategoriaElemento,
              attributes: ['nombre_subcategoria']
            },
            {
              model: ColorElemento,
              attributes: ['nombre_color']
            },
            {
              model: MaterialElemento,
              attributes: ['nombre_material']
            }
          ]
        },
        {
          model: Evento,
          attributes: ['fecha_evento', 'hora_evento', 'espacio_evento']
        }
      ],
      order: [['fecha_alquiler', 'DESC']]
    });

    if (!detallesAlquiler || detallesAlquiler.length === 0) {
      let mensaje = 'No hay detalles de alquiler registrados';
      
      if (id_elemento !== 'todos') {
        const elementoInfo = await Elemento.findByPk(Number(id_elemento));
        mensaje += ` para el elemento "${elementoInfo?.nombre_elemento || id_elemento}"`;
      }
      
      if (fecha_inicio && fecha_fin) {
        mensaje += ` en el período del ${fecha_inicio} al ${fecha_fin}`;
      }
      
      return res.status(404).json({ 
        error: 'No se encontraron detalles de alquiler',
        mensaje: mensaje
      });
    }

    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 40,
      layout: 'landscape'
    });

    res.setHeader('Content-Disposition', 'inline; filename=reporte_detalle_alquiler.pdf');
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    // Título y fecha del reporte
    doc.fontSize(18).text('Reporte de Detalles de Alquiler', { align: 'center' });
    doc.fontSize(10).text(`Generado el ${new Date().toLocaleDateString()}`, { align: 'center' });
    
    // Agregar información de filtros aplicados
    if (id_elemento !== 'todos') {
      const elementoInfo = await Elemento.findByPk(Number(id_elemento));
      doc.fontSize(10).text(`Elemento: ${elementoInfo?.nombre_elemento || id_elemento}`, { align: 'center' });
    }
    
    if (fecha_inicio && fecha_fin) {
      doc.fontSize(10).text(`Período: ${fecha_inicio} al ${fecha_fin}`, { align: 'center' });
    }
    
    doc.moveDown(1);

    // Encabezado de tabla
    const tableTop = 120;
    const colWidths = [40, 150, 100, 100, 100, 100, 100, 100];
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
    drawRow(tableTop, ['#', 'Elemento', 'Subcategoría', 'Color', 'Material', 'Cantidad', 'Fecha Evento', 'Espacio'], true);
    
    // Línea horizontal después del encabezado
    doc.moveTo(startX, tableTop + 15)
       .lineTo(endX, tableTop + 15)
       .stroke();

    // Dibujar filas
    let y = tableTop + 35;
    let totalCantidad = 0;

    detallesAlquiler.forEach((detalle: any, i: number) => {
      if (y > 500) {
        doc.addPage({ layout: 'landscape' });
        y = 100;
        drawRow(y, ['#', 'Elemento', 'Subcategoría', 'Color', 'Material', 'Cantidad', 'Fecha Evento', 'Espacio'], true);
        y += 35;
      }

      const fechaEvento = new Date(detalle.evento.fecha_evento);
      const fechaFormateada = `${fechaEvento.toLocaleDateString()} ${detalle.evento.hora_evento}`;
      totalCantidad += detalle.cantidad_alquiler;

      const content = [
        (i + 1).toString(),
        detalle.elemento.nombre_elemento,
        detalle.elemento.subcategoria?.nombre_subcategoria || 'No especificado',
        detalle.elemento.color?.nombre_color || 'No especificado',
        detalle.elemento.material?.nombre_material || 'No especificado',
        detalle.cantidad_alquiler.toString(),
        fechaFormateada,
        detalle.evento.espacio_evento || 'No especificado'
      ];

      const contentHeight = Math.max(...content.map(text => 
        doc.heightOfString(text, { width: Math.max(...colWidths) })
      ));

      drawRow(y, content);
      doc.moveTo(startX, y + contentHeight + 5)
         .lineTo(endX, y + contentHeight + 5)
         .stroke();

      y += contentHeight + 20;
    });

    // Agregar total
    doc.moveDown(2);
    doc.font('Helvetica-Bold')
       .fontSize(12)
       .text(`Total de Elementos Alquilados: ${totalCantidad}`, { align: 'right' });

    doc.end();
  } catch (error) {
    console.error('Error al generar reporte de detalles de alquiler:', error);
    res.status(500).json({ 
      error: 'Error al generar el reporte',
      mensaje: 'Ocurrió un error al generar el reporte de detalles de alquiler'
    });
  }
};
