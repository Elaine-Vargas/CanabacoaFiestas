import { Request, Response } from 'express';
import SupervisionServicio from '../models/SupervisionServicio_model';
import Evento from '../models/Evento_model';
import Usuario from '../models/Usuario_model';

// Crear un nuevo servicio de supervisión
export const createSupervision = async (req: Request, res: Response) => {
  try {
    const {
      id_evento,
      tarifa_hora,
      precioneto_supervision,
      itbis_supervision,
      total_supervision,
      estado_supervision
    } = req.body;

    // Verificar que el evento existe
    const evento = await Evento.findByPk(id_evento);
    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    // Crear el servicio de supervisión
    const supervision = await SupervisionServicio.create({
      id_evento,
      tarifa_hora,
      precioneto_supervision,
      itbis_supervision,
      total_supervision,
      estado_supervision: estado_supervision || 'Aceptado'
    });

    // Obtener el servicio con el evento
    const supervisionCompleta = await SupervisionServicio.findByPk(supervision.id_supervision, {
      include: [
        {
          model: Evento,
          include: [
            { model: Usuario, as: 'cliente' },
            { model: Usuario, as: 'asesor' }
          ]
        }
      ]
    });

    res.status(201).json(supervisionCompleta);
  } catch (error) {
    console.error('Error al crear servicio de supervisión:', error);
    res.status(500).json({ error: 'Error al crear servicio de supervisión' });
  }
};

// Obtener todos los servicios de supervisión
export const getSupervisiones = async (req: Request, res: Response) => {
  try {
    const supervisiones = await SupervisionServicio.findAll({
      include: [
        {
          model: Evento,
          include: [
            { model: Usuario, as: 'cliente' },
            { model: Usuario, as: 'asesor' }
          ]
        }
      ],
      order: [['id_supervision', 'DESC']]
    });

    res.json(supervisiones);
  } catch (error) {
    console.error('Error al obtener servicios de supervisión:', error);
    res.status(500).json({ error: 'Error al obtener servicios de supervisión' });
  }
};

// Editar un servicio de supervisión
export const editSupervision = async (req: Request, res: Response) => {
  try {
    const { id_supervision } = req.params;
    const {
      tarifa_hora,
      precioneto_supervision,
      itbis_supervision,
      total_supervision,
      estado_supervision
    } = req.body;

    const supervision = await SupervisionServicio.findByPk(id_supervision);
    if (!supervision) {
      return res.status(404).json({ error: 'Servicio de supervisión no encontrado' });
    }

    // Actualizar el servicio
    await supervision.update({
      tarifa_hora: tarifa_hora || supervision.tarifa_hora,
      precioneto_supervision: precioneto_supervision || supervision.precioneto_supervision,
      itbis_supervision: itbis_supervision || supervision.itbis_supervision,
      total_supervision: total_supervision || supervision.total_supervision,
      estado_supervision: estado_supervision || supervision.estado_supervision
    });

    // Obtener el servicio actualizado con el evento
    const supervisionActualizada = await SupervisionServicio.findByPk(id_supervision, {
      include: [
        {
          model: Evento,
          include: [
            { model: Usuario, as: 'cliente' },
            { model: Usuario, as: 'asesor' }
          ]
        }
      ]
    });

    res.json(supervisionActualizada);
  } catch (error) {
    console.error('Error al editar servicio de supervisión:', error);
    res.status(500).json({ error: 'Error al editar servicio de supervisión' });
  }
};

// Eliminar lógicamente un servicio de supervisión
export const deleteSupervision = async (req: Request, res: Response) => {
  try {
    const { id_supervision } = req.params;

    const supervision = await SupervisionServicio.findByPk(id_supervision);
    if (!supervision) {
      return res.status(404).json({ error: 'Servicio de supervisión no encontrado' });
    }

    // Actualizar el estado a Cancelado
    await supervision.update({
      estado_supervision: 'Cancelado'
    });

    res.json({ message: 'Servicio de supervisión cancelado correctamente' });
  } catch (error) {
    console.error('Error al eliminar servicio de supervisión:', error);
    res.status(500).json({ error: 'Error al eliminar servicio de supervisión' });
  }
}; 