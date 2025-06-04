import { Request, Response } from 'express';
import SupervisionServicio from '../models/SupervisionServicio_model';
import DetalleSupervision from '../models/DetalleSupervision_model';
import Evento from '../models/Evento_model';
import Usuario from '../models/Usuario_model';

// Crear un nuevo servicio de supervisión con sus detalles
export const createSupervision = async (req: Request, res: Response) => {
  try {
    const {
      id_evento,
      tarifa_hora,
      precioneto_supervision,
      itbis_supervision,
      total_supervision,
      detalles // Array de detalles de supervisores
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
      total_supervision
    });

    // Crear los detalles de supervisores
    if (detalles && detalles.length > 0) {
      const detallesPromises = detalles.map(async (detalle: any) => {
        // Verificar que el usuario existe
        const usuario = await Usuario.findByPk(detalle.cedula_usuariopersonal);
        if (!usuario) {
          throw new Error(`Usuario con cédula ${detalle.cedula_usuariopersonal} no encontrado`);
        }

        return DetalleSupervision.create({
          id_supervision: supervision.id_supervision,
          cedula_usuariopersonal: detalle.cedula_usuariopersonal,
          horas_trabajo: detalle.horas_trabajo,
          precioneto_supervision: detalle.precioneto_supervision
        });
      });

      await Promise.all(detallesPromises);
    }

    // Obtener el servicio con sus detalles
    const supervisionCompleta = await SupervisionServicio.findByPk(supervision.id_supervision, {
      include: [
        {
          model: DetalleSupervision,
          include: [
            {
              model: Usuario,
              as: 'supervisor'
            }
          ]
        },
        {
          model: Evento
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
          model: DetalleSupervision,
          include: [
            {
              model: Usuario,
              as: 'supervisor'
            }
          ]
        },
        {
          model: Evento
        }
      ]
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
      detalles // Array de detalles actualizados
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
      total_supervision: total_supervision || supervision.total_supervision
    });

    // Si se proporcionaron nuevos detalles, actualizarlos
    if (detalles) {
      // Eliminar detalles existentes
      await DetalleSupervision.destroy({
        where: { id_supervision }
      });

      // Crear nuevos detalles
      if (detalles.length > 0) {
        const detallesPromises = detalles.map(async (detalle: any) => {
          // Verificar que el usuario existe
          const usuario = await Usuario.findByPk(detalle.cedula_usuariopersonal);
          if (!usuario) {
            throw new Error(`Usuario con cédula ${detalle.cedula_usuariopersonal} no encontrado`);
          }

          return DetalleSupervision.create({
            id_supervision,
            cedula_usuariopersonal: detalle.cedula_usuariopersonal,
            horas_trabajo: detalle.horas_trabajo,
            precioneto_supervision: detalle.precioneto_supervision
          });
        });

        await Promise.all(detallesPromises);
      }
    }

    // Obtener el servicio actualizado con sus detalles
    const supervisionActualizada = await SupervisionServicio.findByPk(id_supervision, {
      include: [
        {
          model: DetalleSupervision,
          include: [
            {
              model: Usuario,
              as: 'supervisor'
            }
          ]
        },
        {
          model: Evento
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

    // Eliminar los detalles asociados
    await DetalleSupervision.destroy({
      where: { id_supervision }
    });

    // Eliminar el servicio
    await supervision.destroy();

    res.json({ message: 'Servicio de supervisión eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar servicio de supervisión:', error);
    res.status(500).json({ error: 'Error al eliminar servicio de supervisión' });
  }
}; 