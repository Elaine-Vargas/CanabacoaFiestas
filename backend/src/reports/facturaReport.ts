import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import Factura from '../models/Factura_model';
import Evento from '../models/Evento_model';
import DecoracionServicio from '../models/DecoracionServicio_model';
import AlquilerServicio from '../models/AlquilerServicio_model';
import CateringServicio from '../models/CateringServicio_model';
import TransporteServicio from '../models/TransporteServicio_model';
import CostoAgregadoEvento from '../models/CostoAgregadoEvento_model';
import Usuario from '../models/Usuario_model';
import DetalleDecoracion from '../models/DetalleDecoracion_model';
import DetalleAlquiler from '../models/DetalleAlquiler_model';
import Elemento from '../models/Elemento_model';
import Pago from '../models/Pago_model';
import TipoEvento from '../models/TipoEvento_model';

export const ReporteFacturaEvento = async (req: Request, res: Response) => {
  try {
    const { id_evento } = req.params;

    // Obtener el evento con la información del cliente y tipo de evento
    const evento = await Evento.findByPk(id_evento, {
      include: [
        {
          model: Usuario,
          as: 'cliente',
          attributes: ['nombre_usuario', 'apellido_usuario', 'cedula_usuario']
        },
        {
          model: TipoEvento,
          as: 'tipo_evento',
          attributes: ['tipo_evento']
        }
      ]
    });

    if (!evento) {
      return res.status(404).json({ mensaje: 'Evento no encontrado' });
    }

    if (!evento.cliente) {
      return res.status(404).json({ mensaje: 'Información del cliente no encontrada' });
    }

    // Obtener todos los servicios relacionados con sus detalles
    const decoracion = await DecoracionServicio.findOne({
      where: { id_evento: id_evento }
    });

    const detallesDecoracion = decoracion ? await DetalleDecoracion.findAll({
      where: { id_decoracion: decoracion.id_decoracion }
    }) : [];

    const alquiler = await AlquilerServicio.findOne({
      where: { id_evento: id_evento },
      include: [{
        model: DetalleAlquiler,
        include: [{
          model: Elemento,
          attributes: ['nombre_elemento']
        }]
      }]
    });

    // Buscar el transporte relacionado al alquiler encontrado
    let transporte = null;
    if (alquiler) {
      transporte = await TransporteServicio.findOne({
        where: { id_alquiler: alquiler.id_alquiler }
      });
    }

    const catering = await CateringServicio.findOne({
      where: { id_evento: id_evento }
    });

    const costosAdicionales = await CostoAgregadoEvento.findAll({
      where: { id_evento: id_evento }
    });

    // PAGOS DEL EVENTO
    const pagos = await Pago.findAll({
      where: { id_evento: id_evento }
    });

    // Calcular subtotales y totales para cada servicio
    const subtotalDecoracion = decoracion ? Number(decoracion.precioneto_decoracion) : 0;
    const itbisDecoracion = decoracion ? Number(decoracion.itbis_decoracion) : 0;
    const totalDecoracion = subtotalDecoracion + itbisDecoracion;

    const subtotalAlquiler = alquiler ? Number(alquiler.subtotal_alquiler) : 0;
    const itbisAlquiler = alquiler ? Number(alquiler.itbis_alquiler) : 0;
    const totalAlquiler = subtotalAlquiler + itbisAlquiler;

    const subtotalCatering = catering ? Number(catering.precioneto_catering) : 0;
    const itbisCatering = catering ? Number(catering.itbis_catering) : 0;
    const totalCatering = subtotalCatering + itbisCatering;

    const subtotalTransporte = transporte ? Number(transporte.precioneto_transporte) : 0;
    const itbisTransporte = transporte ? Number(transporte.itbis_transporte) : 0;
    const totalTransporte = subtotalTransporte + itbisTransporte;

    // Calcular totales de costos adicionales
    const subtotalCostosAdicionales = costosAdicionales.reduce((sum, costo) => sum + Number(costo.monto), 0);
    const itbisCostosAdicionales = subtotalCostosAdicionales * 0.18;
    const totalCostosAdicionales = subtotalCostosAdicionales + itbisCostosAdicionales;

    // Calcular totales generales
    const subtotalGeneral = subtotalDecoracion + subtotalAlquiler + subtotalCatering + subtotalTransporte + subtotalCostosAdicionales;
    const itbisGeneral = itbisDecoracion + itbisAlquiler + itbisCatering + itbisTransporte + itbisCostosAdicionales;
    const totalGeneral = totalDecoracion + totalAlquiler + totalCatering + totalTransporte + totalCostosAdicionales;

    // Calcular pagos recibidos y pendiente
    const pagosRecibidos = pagos.filter(p => p.estado_pago === 'Recibido');
    const sumaPagosRecibidos = pagosRecibidos.reduce((sum, p) => sum + Number(p.monto), 0);
    const pagoPendiente = totalGeneral - sumaPagosRecibidos;

    // Crear el PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=factura_evento_${id_evento}.pdf`);

    doc.pipe(res);

    // Encabezado
    doc.fontSize(20).text('Factura de Evento', { align: 'center' });
    doc.moveDown();

    // Información del cliente y evento
    doc.fontSize(12);
    doc.text(`Cliente: ${evento.cliente?.nombre_usuario} ${evento.cliente?.apellido_usuario}`);
    doc.text(`Cédula: ${evento.cliente?.cedula_usuario}`);
    doc.text(`Fecha del Evento: ${new Date(evento.fecha_evento).toLocaleDateString()}`);
    doc.text(`Tipo de Evento: ${evento.tipo_evento?.tipo_evento || 'No especificado'}`);
    doc.moveDown();

    // Tabla de servicios
    doc.fontSize(14).text('Detalle de Servicios', { align: 'center' });
    doc.moveDown();

    // Función para formatear moneda
    const formatearMoneda = (monto: number) => {
      return new Intl.NumberFormat('es-DO', {
        style: 'currency',
        currency: 'DOP'
      }).format(monto);
    };

    // Decoración con detalles
    if (decoracion) {
      doc.fontSize(12).text('Decoración:');
      doc.text(`Tema: ${decoracion.tema_decoracion}`);
      doc.text(`Colores: ${decoracion.colores_decoracion}`);
      
      if (detallesDecoracion.length > 0) {
        doc.text('Elementos decorativos:');
        detallesDecoracion.forEach(detalle => {
          doc.text(`- ${detalle.elemento_decoracion}: ${formatearMoneda(Number(detalle.precio_elemento))} x ${detalle.cantelemento_decoracion} = ${formatearMoneda(Number(detalle.precio_decoracion))}`);
        });
      }
      doc.text(`Subtotal: ${formatearMoneda(subtotalDecoracion)}`);
      doc.text(`ITBIS (18%): ${formatearMoneda(itbisDecoracion)}`);
      doc.text(`Total: ${formatearMoneda(totalDecoracion)}`);
      doc.moveDown();
    }

    // Alquiler con detalles
    if (alquiler) {
      doc.text('Alquiler:');
      if (alquiler.detalles && alquiler.detalles.length > 0) {
        doc.text('Elementos alquilados:');
        alquiler.detalles.forEach(detalle => {
          doc.text(`- ${detalle.elemento?.nombre_elemento || 'Elemento no especificado'}: ${formatearMoneda(Number(detalle.precio_unitario))} x ${detalle.cantidad_alquiler} = ${formatearMoneda(Number(detalle.total_alquiler))}`);
        });
      }
      doc.text(`Subtotal: ${formatearMoneda(subtotalAlquiler)}`);
      doc.text(`ITBIS (18%): ${formatearMoneda(itbisAlquiler)}`);
      doc.text(`Total: ${formatearMoneda(totalAlquiler)}`);
      doc.moveDown();
    }

    // Catering
    if (catering) {
      doc.text('Catering:');
      doc.text(`Subtotal: ${formatearMoneda(subtotalCatering)}`);
      doc.text(`ITBIS (18%): ${formatearMoneda(itbisCatering)}`);
      doc.text(`Total: ${formatearMoneda(totalCatering)}`);
      doc.moveDown();
    }

    // Transporte
    if (transporte) {
      doc.text('Transporte:');
      doc.text(`Subtotal: ${formatearMoneda(subtotalTransporte)}`);
      doc.text(`ITBIS (18%): ${formatearMoneda(itbisTransporte)}`);
      doc.text(`Total: ${formatearMoneda(totalTransporte)}`);
      doc.moveDown();
    }

    // Costos Adicionales
    if (costosAdicionales.length > 0) {
      doc.text('Costos Adicionales:');
      costosAdicionales.forEach(costo => {
        doc.text(`- ${costo.desc_costo}: ${formatearMoneda(Number(costo.monto))}`);
      });
      doc.text(`Subtotal: ${formatearMoneda(subtotalCostosAdicionales)}`);
      doc.text(`ITBIS (18%): ${formatearMoneda(itbisCostosAdicionales)}`);
      doc.text(`Total: ${formatearMoneda(totalCostosAdicionales)}`);
      doc.moveDown();
    }

    // Totales Generales
    doc.fontSize(14).text('Totales Generales', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Subtotal General: ${formatearMoneda(subtotalGeneral)}`);
    doc.text(`ITBIS General (18%): ${formatearMoneda(itbisGeneral)}`);
    doc.text(`Total General: ${formatearMoneda(totalGeneral)}`);
    doc.moveDown();

    // PAGOS REALIZADOS
    doc.fontSize(14).text('Pagos Realizados', { align: 'center' });
    doc.moveDown(0.5);
    if (pagos.length > 0) {
      pagos.forEach(pago => {
        doc.fontSize(12).text(`- ${pago.tipo_pago}: ${formatearMoneda(Number(pago.monto))} | Fecha: ${new Date(pago.fecha_pago).toLocaleDateString()} | Estado: ${pago.estado_pago}`);
      });
    } else {
      doc.fontSize(12).text('No se registran pagos para este evento.');
    }
    doc.moveDown();

    // PAGO PENDIENTE
    doc.fontSize(14).text('Pago Pendiente', { align: 'center' });
    doc.fontSize(12).text(`Monto pendiente por pagar: ${formatearMoneda(pagoPendiente > 0 ? pagoPendiente : 0)}`);

    // Pie de página
    doc.moveDown(2);
    doc.fontSize(10).text('Gracias por su preferencia', { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Error al generar reporte de factura:', error);
    res.status(500).json({ 
      error: 'Error al generar reporte de factura',
      mensaje: 'Ocurrió un error al generar el reporte'
    });
  }
};