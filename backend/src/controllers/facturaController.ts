import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Factura from '../models/Factura_model';
import Evento from '../models/Evento_model';

// Obtener todas las facturas
export const getFacturas = async (req: Request, res: Response) => {
  try {
    const facturas = await Factura.findAll({
      include: [
        {
          model: Evento,
          attributes: ['id_evento',  'fecha_evento']
        }
      ],
      order: [['fecha_factura', 'DESC'], ['hora_factura', 'DESC']]
    });

    if (!facturas || facturas.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontraron facturas',
        mensaje: 'No hay facturas registradas'
      });
    }

    res.json(facturas);
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    res.status(500).json({ 
      error: 'Error al obtener las facturas',
      mensaje: 'Ocurrió un error al cargar las facturas'
    });
  }
};

// Obtener una factura por ID
export const getFacturaById = async (req: Request, res: Response) => {
  try {
    const { id_factura } = req.params;
    
    const factura = await Factura.findByPk(id_factura, {
      include: [
        {
          model: Evento,
          attributes: ['id_evento',  'fecha_evento']
        }
      ]
    });

    if (!factura) {
      return res.status(404).json({
        error: 'Factura no encontrada',
        mensaje: 'No se encontró la factura solicitada'
      });
    }

    res.json(factura);
  } catch (error) {
    console.error('Error al buscar factura:', error);
    res.status(500).json({
      error: 'Error al buscar factura',
      mensaje: 'Ocurrió un error al buscar la factura'
    });
  }
};

// Buscar facturas
export const searchFacturas = async (req: Request, res: Response) => {
  try {
    const { estado, fecha_inicio, fecha_fin, id_evento } = req.query;

    const whereClause: any = {};

    if (estado) {
      whereClause.estado_factura = estado;
    }

    if (fecha_inicio && fecha_fin) {
      whereClause.fecha_factura = {
        [Op.between]: [fecha_inicio, fecha_fin]
      };
    }

    if (id_evento) {
      whereClause.id_evento = id_evento;
    }

    const facturas = await Factura.findAll({
      where: whereClause,
      include: [
        {
          model: Evento,
          attributes: ['id_evento', 'fecha_evento']
        }
      ],
      order: [['fecha_factura', 'DESC'], ['hora_factura', 'DESC']]
    });

    if (!facturas || facturas.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontraron facturas',
        mensaje: 'No hay facturas que coincidan con los criterios de búsqueda'
      });
    }

    res.json(facturas);
  } catch (error) {
    console.error('Error al buscar facturas:', error);
    res.status(500).json({ 
      error: 'Error al buscar facturas',
      mensaje: 'Ocurrió un error al realizar la búsqueda'
    });
  }
};

// Crear una nueva factura
export const createFactura = async (req: Request, res: Response) => {
  try {
    const { id_evento, subtotal, itbis, total } = req.body;

    // Verificar que el evento existe
    const evento = await Evento.findByPk(id_evento);
    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    // Crear la factura
    const factura = await Factura.create({
      id_evento,
      subtotal: Number(subtotal),
      itbis: Number(itbis),
      total: Number(total),
      estado_factura: 'Pendiente'
    });

    // Obtener la factura con sus relaciones
    const facturaCompleta = await Factura.findByPk(factura.id_factura, {
      include: [
        {
          model: Evento,
          attributes: ['id_evento', 'fecha_evento']
        }
      ]
    });

    res.status(201).json(facturaCompleta);
  } catch (error) {
    console.error('Error al crear factura:', error);
    res.status(500).json({ 
      error: 'Error al crear factura',
      mensaje: 'Ocurrió un error al crear la factura'
    });
  }
};

// Editar una factura
export const editFactura = async (req: Request, res: Response) => {
  try {
    const { id_factura } = req.params;
    const { id_evento, subtotal, itbis, total, estado_factura } = req.body;

    const factura = await Factura.findByPk(id_factura);
    if (!factura) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    // Verificar que el evento existe si se proporciona
    if (id_evento) {
      const evento = await Evento.findByPk(id_evento);
      if (!evento) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }
    }

    // Validar estado si se proporciona
    if (estado_factura && !['Pendiente', 'Pagada', 'Anulada'].includes(estado_factura)) {
      return res.status(400).json({ error: 'Estado de factura inválido' });
    }

    // Actualizar la factura
    await factura.update({
      id_evento: id_evento || factura.id_evento,
      subtotal: subtotal ? Number(subtotal) : factura.subtotal,
      itbis: itbis ? Number(itbis) : factura.itbis,
      total: total ? Number(total) : factura.total,
      estado_factura: estado_factura || factura.estado_factura
    });

    // Obtener la factura actualizada con sus relaciones
    const facturaActualizada = await Factura.findByPk(id_factura, {
      include: [
        {
          model: Evento,
          attributes: ['id_evento',  'fecha_evento']
        }
      ]
    });

    res.json(facturaActualizada);
  } catch (error) {
    console.error('Error al editar factura:', error);
    res.status(500).json({ 
      error: 'Error al editar factura',
      mensaje: 'Ocurrió un error al actualizar la factura'
    });
  }
};

// Cambiar estado de una factura
export const cambiarEstadoFactura = async (req: Request, res: Response) => {
  try {
    const { id_factura } = req.params;
    const { estado_factura } = req.body;

    if (!['Pendiente', 'Pagada', 'Anulada'].includes(estado_factura)) {
      return res.status(400).json({ error: 'Estado de factura inválido' });
    }

    const factura = await Factura.findByPk(id_factura);
    if (!factura) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    await factura.update({ estado_factura });

    const facturaActualizada = await Factura.findByPk(id_factura, {
      include: [
        {
          model: Evento,
          attributes: ['id_evento', 'fecha_evento']
        }
      ]
    });

    res.json(facturaActualizada);
  } catch (error) {
    console.error('Error al cambiar estado de factura:', error);
    res.status(500).json({ 
      error: 'Error al cambiar estado de factura',
      mensaje: 'Ocurrió un error al actualizar el estado'
    });
  }
};

// Eliminar lógicamente una factura
export const deleteFactura = async (req: Request, res: Response) => {
  try {
    const { id_factura } = req.params;

    const factura = await Factura.findByPk(id_factura);
    if (!factura) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    // Verificar si la factura ya está eliminada
    if (factura.estado_factura === 'Anulada') {
      return res.status(400).json({ 
        error: 'Factura ya eliminada',
        mensaje: 'La factura ya ha sido eliminada anteriormente'
      });
    }

    // Actualizar el estado a 'Anulada'
    await factura.update({ estado_factura: 'Anulada' });

    const facturaActualizada = await Factura.findByPk(id_factura, {
      include: [
        {
          model: Evento,
          attributes: ['id_evento', 'fecha_evento']
        }
      ]
    });

    res.json({
      mensaje: 'Factura eliminada exitosamente',
      factura: facturaActualizada
    });
  } catch (error) {
    console.error('Error al eliminar factura:', error);
    res.status(500).json({ 
      error: 'Error al eliminar factura',
      mensaje: 'Ocurrió un error al eliminar la factura'
    });
  }
}; 