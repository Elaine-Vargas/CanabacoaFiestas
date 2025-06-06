import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Pago from '../models/Pago_model';
import Evento from '../models/Evento_model';
import Tarjeta from '../models/Tarjeta_model';

// Obtener todos los pagos
export const getPagos = async (req: Request, res: Response) => {
  try {
    const pagos = await Pago.findAll({
      include: [
        {
          model: Evento,
          attributes: ['id_evento','fecha_evento']
        },
        {
          model: Tarjeta,
          attributes: ['id_tarjeta', 'num_tarjeta', 'tipo_tarjeta']
        }
      ],
      order: [['fecha_pago', 'DESC'], ['hora_pago', 'DESC']]
    });

    if (!pagos || pagos.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontraron pagos',
        mensaje: 'No hay pagos registrados'
      });
    }

    res.json(pagos);
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({ 
      error: 'Error al obtener los pagos',
      mensaje: 'Ocurrió un error al cargar los pagos'
    });
  }
};

// Obtener un pago por ID
export const getPagoById = async (req: Request, res: Response) => {
  try {
    const { id_pago } = req.params;
    
    const pago = await Pago.findByPk(id_pago, {
      include: [
        {
          model: Evento,
          attributes: ['id_evento', 'fecha_evento']
        },
        {
          model: Tarjeta,
          attributes: ['id_tarjeta', 'num_tarjeta', 'tipo_tarjeta']
        }
      ]
    });

    if (!pago) {
      return res.status(404).json({
        error: 'Pago no encontrado',
        mensaje: 'No se encontró el pago solicitado'
      });
    }

    res.json(pago);
  } catch (error) {
    console.error('Error al buscar pago:', error);
    res.status(500).json({
      error: 'Error al buscar pago',
      mensaje: 'Ocurrió un error al buscar el pago'
    });
  }
};

// Buscar pagos
export const searchPagos = async (req: Request, res: Response) => {
  try {
    const { estado, tipo, fecha_inicio, fecha_fin, id_evento, id_tarjeta, modo_pago } = req.query;

    const whereClause: any = {};

    if (estado) {
      whereClause.estado_pago = estado;
    }

    if (tipo) {
      whereClause.tipo_pago = tipo;
    }

    if (modo_pago) {
      whereClause.modo_pago = modo_pago;
    }

    if (fecha_inicio && fecha_fin) {
      whereClause.fecha_pago = {
        [Op.between]: [fecha_inicio, fecha_fin]
      };
    }

    if (id_evento) {
      whereClause.id_evento = id_evento;
    }

    if (id_tarjeta) {
      whereClause.id_tarjeta = id_tarjeta;
    }

    const pagos = await Pago.findAll({
      where: whereClause,
      include: [
        {
          model: Evento,
          attributes: ['id_evento', 'fecha_evento']
        },
        {
          model: Tarjeta,
          attributes: ['id_tarjeta', 'num_tarjeta', 'tipo_tarjeta']
        }
      ],
      order: [['fecha_pago', 'DESC'], ['hora_pago', 'DESC']]
    });

    if (!pagos || pagos.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontraron pagos',
        mensaje: 'No hay pagos que coincidan con los criterios de búsqueda'
      });
    }

    res.json(pagos);
  } catch (error) {
    console.error('Error al buscar pagos:', error);
    res.status(500).json({ 
      error: 'Error al buscar pagos',
      mensaje: 'Ocurrió un error al realizar la búsqueda'
    });
  }
};

// Crear un nuevo pago
export const createPago = async (req: Request, res: Response) => {
  try {
    const { id_evento, id_tarjeta, monto, tipo_pago, modo_pago } = req.body;

    // Verificar que el evento existe
    const evento = await Evento.findByPk(id_evento);
    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    // Verificar que la tarjeta existe si el modo de pago es Tarjeta
    if (modo_pago === 'Tarjeta') {
      if (!id_tarjeta) {
        return res.status(400).json({ error: 'Se requiere una tarjeta para pagos con tarjeta' });
      }
      const tarjeta = await Tarjeta.findByPk(id_tarjeta);
      if (!tarjeta) {
        return res.status(404).json({ error: 'Tarjeta no encontrada' });
      }
    }

    // Validar tipo de pago
    if (!['Inicial', 'Final', 'Adicional'].includes(tipo_pago)) {
      return res.status(400).json({ error: 'Tipo de pago inválido' });
    }

    // Validar modo de pago
    if (!['Efectivo', 'Tarjeta'].includes(modo_pago)) {
      return res.status(400).json({ error: 'Modo de pago inválido' });
    }

    // Crear el pago
    const pago = await Pago.create({
      id_evento,
      id_tarjeta: modo_pago === 'Tarjeta' ? id_tarjeta : null,
      monto: Number(monto),
      tipo_pago,
      modo_pago,
      estado_pago: 'Pendiente'
    });

    // Obtener el pago con sus relaciones
    const pagoCompleto = await Pago.findByPk(pago.id_pago, {
      include: [
        {
          model: Evento,
          attributes: ['id_evento', 'fecha_evento']
        },
        {
          model: Tarjeta,
          attributes: ['id_tarjeta', 'num_tarjeta', 'tipo_tarjeta']
        }
      ]
    });

    res.status(201).json(pagoCompleto);
  } catch (error) {
    console.error('Error al crear pago:', error);
    res.status(500).json({ 
      error: 'Error al crear pago',
      mensaje: 'Ocurrió un error al crear el pago'
    });
  }
};

// Editar un pago
export const editPago = async (req: Request, res: Response) => {
  try {
    const { id_pago } = req.params;
    const { id_evento, id_tarjeta, monto, tipo_pago, estado_pago, modo_pago } = req.body;

    const pago = await Pago.findByPk(id_pago);
    if (!pago) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    // Verificar que el evento existe si se proporciona
    if (id_evento) {
      const evento = await Evento.findByPk(id_evento);
      if (!evento) {
        return res.status(404).json({ error: 'Evento no encontrado' });
      }
    }

    // Verificar que la tarjeta existe si se proporciona y el modo es Tarjeta
    if (modo_pago === 'Tarjeta' || (pago.modo_pago === 'Tarjeta' && id_tarjeta)) {
      if (!id_tarjeta) {
        return res.status(400).json({ error: 'Se requiere una tarjeta para pagos con tarjeta' });
      }
      const tarjeta = await Tarjeta.findByPk(id_tarjeta);
      if (!tarjeta) {
        return res.status(404).json({ error: 'Tarjeta no encontrada' });
      }
    }

    // Validar tipo de pago si se proporciona
    if (tipo_pago && !['Inicial', 'Final', 'Adicional'].includes(tipo_pago)) {
      return res.status(400).json({ error: 'Tipo de pago inválido' });
    }

    // Validar modo de pago si se proporciona
    if (modo_pago && !['Efectivo', 'Tarjeta'].includes(modo_pago)) {
      return res.status(400).json({ error: 'Modo de pago inválido' });
    }

    // Validar estado si se proporciona
    if (estado_pago && !['Pendiente', 'Recibido', 'Rechazado'].includes(estado_pago)) {
      return res.status(400).json({ error: 'Estado de pago inválido' });
    }

    // Actualizar el pago
    await pago.update({
      id_evento: id_evento || pago.id_evento,
      id_tarjeta: modo_pago === 'Tarjeta' ? id_tarjeta : null,
      monto: monto ? Number(monto) : pago.monto,
      tipo_pago: tipo_pago || pago.tipo_pago,
      estado_pago: estado_pago || pago.estado_pago,
      modo_pago: modo_pago || pago.modo_pago
    });

    // Obtener el pago actualizado con sus relaciones
    const pagoActualizado = await Pago.findByPk(id_pago, {
      include: [
        {
          model: Evento,
          attributes: ['id_evento', 'fecha_evento']
        },
        {
          model: Tarjeta,
          attributes: ['id_tarjeta', 'num_tarjeta', 'tipo_tarjeta']
        }
      ]
    });

    res.json(pagoActualizado);
  } catch (error) {
    console.error('Error al editar pago:', error);
    res.status(500).json({ 
      error: 'Error al editar pago',
      mensaje: 'Ocurrió un error al actualizar el pago'
    });
  }
};

// Cambiar estado de un pago
export const cambiarEstadoPago = async (req: Request, res: Response) => {
  try {
    const { id_pago } = req.params;
    const { estado_pago } = req.body;

    if (!['Pendiente', 'Recibido', 'Rechazado'].includes(estado_pago)) {
      return res.status(400).json({ error: 'Estado de pago inválido' });
    }

    const pago = await Pago.findByPk(id_pago);
    if (!pago) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    await pago.update({ estado_pago });

    const pagoActualizado = await Pago.findByPk(id_pago, {
      include: [
        {
          model: Evento,
          attributes: ['id_evento',  'fecha_evento']
        },
        {
          model: Tarjeta,
          attributes: ['id_tarjeta', 'num_tarjeta', 'tipo_tarjeta']
        }
      ]
    });

    res.json(pagoActualizado);
  } catch (error) {
    console.error('Error al cambiar estado de pago:', error);
    res.status(500).json({ 
      error: 'Error al cambiar estado de pago',
      mensaje: 'Ocurrió un error al actualizar el estado'
    });
  }
};

// Eliminar lógicamente un pago
export const deletePago = async (req: Request, res: Response) => {
  try {
    const { id_pago } = req.params;

    const pago = await Pago.findByPk(id_pago);
    if (!pago) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    // Verificar si el pago ya está eliminado
    if (pago.estado_pago === 'Rechazado') {
      return res.status(400).json({ 
        error: 'Pago ya eliminado',
        mensaje: 'El pago ya ha sido eliminado anteriormente'
      });
    }

    // Actualizar el estado a 'Rechazado'
    await pago.update({ estado_pago: 'Rechazado' });

    const pagoActualizado = await Pago.findByPk(id_pago, {
      include: [
        {
          model: Evento,
          attributes: ['id_evento', 'fecha_evento']
        },
        {
          model: Tarjeta,
          attributes: ['id_tarjeta', 'num_tarjeta', 'tipo_tarjeta']
        }
      ]
    });

    res.json({
      mensaje: 'Pago eliminado exitosamente',
      pago: pagoActualizado
    });
  } catch (error) {
    console.error('Error al eliminar pago:', error);
    res.status(500).json({ 
      error: 'Error al eliminar pago',
      mensaje: 'Ocurrió un error al eliminar el pago'
    });
  }
}; 