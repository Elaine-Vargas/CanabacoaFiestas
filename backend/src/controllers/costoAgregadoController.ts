import { Request, Response } from 'express';
import CostoAgregadoEvento from '../models/CostoAgregadoEvento_model';
import Evento from '../models/Evento_model';
import { Op } from 'sequelize';

// Crear un nuevo costo agregado
export const createCostoAgregado = async (req: Request, res: Response) => {
  try {
    const {
      id_evento,
      desc_costo,
      monto,
      tipo_costo,
      estado_costo_agregado
    } = req.body;

    // Validar campos requeridos
    if (!id_evento || !desc_costo || !monto) {
      return res.status(400).json({
        error: 'Campos incompletos',
        mensaje: 'El evento, descripción y monto son campos obligatorios'
      });
    }

    // Validar tipo_costo y estado_costo_agregado
    const tiposValidos = ['Extra', 'Descuento', 'Penalidad', 'Otro'];
    const estadosValidos = ['Activo', 'Eliminado'];

    if (tipo_costo && !tiposValidos.includes(tipo_costo)) {
      return res.status(400).json({
        error: 'Tipo de costo inválido',
        mensaje: 'El tipo de costo debe ser Extra, Descuento, Penalidad u Otro'
      });
    }

    if (estado_costo_agregado && !estadosValidos.includes(estado_costo_agregado)) {
      return res.status(400).json({
        error: 'Estado inválido',
        mensaje: 'El estado debe ser Activo o Eliminado'
      });
    }

    if (isNaN(monto) || parseFloat(monto) <= 0) {
      return res.status(400).json({
        error: 'Monto inválido',
        mensaje: 'El monto debe ser un número positivo'
      });
    }

    const evento = await Evento.findByPk(id_evento);
    if (!evento) {
      return res.status(404).json({
        error: 'No se encontró el evento',
        mensaje: 'El evento especificado no existe'
      });
    }

    const costoAgregado = await CostoAgregadoEvento.create({
      id_evento,
      desc_costo,
      monto: parseFloat(monto),
      tipo_costo: tipo_costo || 'Otro',
      estado_costo_agregado: estado_costo_agregado || 'Activo',
    });

    const costoCompleto = await CostoAgregadoEvento.findByPk(costoAgregado.id_costo_agregado, {
      include: [{ model: Evento, as: 'evento' }]
    });

    res.status(201).json({
      mensaje: 'Costo agregado creado exitosamente',
      costo: costoCompleto
    });
  } catch (error) {
    console.error('Error al crear costo agregado:', error);
    res.status(500).json({
      error: 'Error al crear el costo agregado',
      mensaje: 'Ocurrió un error al registrar el costo agregado'
    });
  }
};

// Obtener todos los costos agregados de un evento
export const getCostosByEvento = async (req: Request, res: Response) => {
  try {
    const { id_evento } = req.params;

    if (isNaN(Number(id_evento))) {
      return res.status(400).json({
        error: 'ID de evento inválido',
        mensaje: 'El ID del evento debe ser un número'
      });
    }

    const evento = await Evento.findByPk(id_evento);
    if (!evento) {
      return res.status(404).json({
        error: 'No se encontró el evento',
        mensaje: 'El evento especificado no existe'
      });
    }

    const costos = await CostoAgregadoEvento.findAll({
      where: {
        id_evento,
        estado_costo_agregado: 'Activo'
      },
      include: [{ model: Evento, as: 'evento' }],
      order: [['fecha_registro', 'DESC']]
    });

    if (!costos || costos.length === 0) {
      return res.status(404).json({
        error: 'No se encontraron costos',
        mensaje: 'No hay costos agregados registrados para este evento'
      });
    }

    res.json({
      mensaje: 'Costos agregados obtenidos exitosamente',
      costos
    });
  } catch (error) {
    console.error('Error al obtener costos agregados:', error);
    res.status(500).json({
      error: 'Error al obtener los costos agregados',
      mensaje: 'Ocurrió un error al cargar los costos agregados'
    });
  }
};

// Editar un costo agregado
export const editCostoAgregado = async (req: Request, res: Response) => {
  try {
    const { id_costo_agregado } = req.params;
    const {
      desc_costo,
      monto,
      tipo_costo,
      estado_costo_agregado
    } = req.body;

    if (isNaN(Number(id_costo_agregado))) {
      return res.status(400).json({
        error: 'ID de costo inválido',
        mensaje: 'El ID del costo debe ser un número'
      });
    }

    if (monto && (isNaN(monto) || parseFloat(monto) <= 0)) {
      return res.status(400).json({
        error: 'Monto inválido',
        mensaje: 'El monto debe ser un número positivo'
      });
    }

    const tiposValidos = ['Extra', 'Descuento', 'Penalidad', 'Otro'];
    const estadosValidos = ['Activo', 'Eliminado'];

    if (tipo_costo && !tiposValidos.includes(tipo_costo)) {
      return res.status(400).json({
        error: 'Tipo de costo inválido',
        mensaje: 'El tipo de costo debe ser Extra, Descuento, Penalidad u Otro'
      });
    }

    if (estado_costo_agregado && !estadosValidos.includes(estado_costo_agregado)) {
      return res.status(400).json({
        error: 'Estado inválido',
        mensaje: 'El estado debe ser Activo o Eliminado'
      });
    }

    const costo = await CostoAgregadoEvento.findByPk(id_costo_agregado);
    if (!costo) {
      return res.status(404).json({
        error: 'No se encontró el costo',
        mensaje: 'El costo agregado especificado no existe'
      });
    }

    if (costo.estado_costo_agregado === 'Eliminado') {
      return res.status(400).json({
        error: 'Costo eliminado',
        mensaje: 'No se puede editar un costo que ha sido eliminado'
      });
    }

    await costo.update({
      desc_costo: desc_costo ?? costo.desc_costo,
      monto: monto ? parseFloat(monto) : costo.monto,
      tipo_costo: tipo_costo ?? costo.tipo_costo,
      estado_costo_agregado: estado_costo_agregado ?? costo.estado_costo_agregado
    });

    const costoActualizado = await CostoAgregadoEvento.findByPk(id_costo_agregado, {
      include: [{ model: Evento, as: 'evento' }]
    });

    res.json({
      mensaje: 'Costo agregado actualizado exitosamente',
      costo: costoActualizado
    });
  } catch (error) {
    console.error('Error al editar costo agregado:', error);
    res.status(500).json({
      error: 'Error al editar el costo agregado',
      mensaje: 'Ocurrió un error al actualizar el costo agregado'
    });
  }
};

// Eliminar un costo agregado (soft delete)
export const deleteCostoAgregado = async (req: Request, res: Response) => {
  try {
    const { id_costo_agregado } = req.params;

    if (isNaN(Number(id_costo_agregado))) {
      return res.status(400).json({
        error: 'ID de costo inválido',
        mensaje: 'El ID del costo debe ser un número'
      });
    }

    const costo = await CostoAgregadoEvento.findByPk(id_costo_agregado);
    if (!costo) {
      return res.status(404).json({
        error: 'No se encontró el costo',
        mensaje: 'El costo agregado especificado no existe'
      });
    }

    if (costo.estado_costo_agregado === 'Eliminado') {
      return res.status(400).json({
        error: 'Costo ya eliminado',
        mensaje: 'Este costo ya ha sido eliminado anteriormente'
      });
    }

    await costo.update({
      estado_costo_agregado: 'Eliminado'
    });

    res.json({
      mensaje: 'Costo agregado eliminado correctamente',
      error: null
    });
  } catch (error) {
    console.error('Error al eliminar costo agregado:', error);
    res.status(500).json({
      error: 'Error al eliminar el costo agregado',
      mensaje: 'Ocurrió un error al eliminar el costo agregado'
    });
  }
};

// Obtener todos los costos agregados
export const getAllCostosAgregados = async (req: Request, res: Response) => {
  try {
    const costos = await CostoAgregadoEvento.findAll({
      attributes: [
        'id_costo_agregado',
        'id_evento',
        'desc_costo',
        'monto',
        'tipo_costo',
        'estado_costo_agregado',
        'fecha_registro'
      ],
      where: {
        estado_costo_agregado: 'Activo'
      },
      include: [
        {
          model: Evento,
          as: 'evento',
          attributes: ['id_evento', 'fecha_evento']
        }
      ],
      order: [
        ['fecha_registro', 'DESC'],
        ['id_costo_agregado', 'DESC']
      ]
    });

    if (!costos || costos.length === 0) {
      return res.status(404).json({
        error: 'No se encontraron costos',
        mensaje: 'No hay costos agregados registrados en el sistema'
      });
    }

    res.json({
      mensaje: 'Costos agregados obtenidos exitosamente',
      total: costos.length,
      costos
    });
  } catch (error) {
    console.error('Error al obtener todos los costos agregados:', error);
    res.status(500).json({
      error: 'Error al obtener los costos agregados',
      mensaje: 'Ocurrió un error al cargar los costos agregados'
    });
  }
};
