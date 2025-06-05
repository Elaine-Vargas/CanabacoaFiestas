import { Request, Response } from 'express';
import TransporteServicio from '../models/TransporteServicio_model';
import DetalleTransporte from '../models/DetalleTransporte_model';
import Evento from '../models/Evento_model';
import Vehiculo from '../models/Vehiculo_model';
import Usuario from '../models/Usuario_model';

// Crear un nuevo servicio de transporte con sus detalles
export const createTransporte = async (req: Request, res: Response) => {
  try {
    const {
      id_evento,
      distancia_km,
      precioneto_transporte,
      itbis_transporte,
      total_transporte,
      detalles // Array de detalles de transporte
    } = req.body;

    // Verificar que el evento existe
    const evento = await Evento.findByPk(id_evento);
    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    // Crear el servicio de transporte
    const transporte = await TransporteServicio.create({
      id_evento,
      distancia_km,
      precioneto_transporte,
      itbis_transporte,
      total_transporte
    });

    // Crear los detalles de transporte
    if (detalles && detalles.length > 0) {
      const detallesPromises = detalles.map(async (detalle: any) => {
        // Verificar que el vehículo existe
        const vehiculo = await Vehiculo.findByPk(detalle.id_vehiculo);
        if (!vehiculo) {
          throw new Error(`Vehículo con ID ${detalle.id_vehiculo} no encontrado`);
        }

        // Verificar que el conductor existe
        const conductor = await Usuario.findByPk(detalle.id_usuarioconductor);
        if (!conductor) {
          throw new Error(`Conductor con cédula ${detalle.id_usuarioconductor} no encontrado`);
        }

        return DetalleTransporte.create({
          id_transporte: transporte.id_transporte,
          id_vehiculo: detalle.id_vehiculo,
          id_usuarioconductor: detalle.id_usuarioconductor,
          cantidad_elementos: detalle.cantidad_elementos,
          precioneto_transporte: detalle.precioneto_transporte,
          itbis_transporte: detalle.itbis_transporte,
          total_transporte: detalle.total_transporte
        });
      });

      await Promise.all(detallesPromises);
    }

    // Obtener el servicio con sus detalles
    const transporteCompleto = await TransporteServicio.findByPk(transporte.id_transporte, {
      include: [
        {
          model: DetalleTransporte,
          include: [
            {
              model: Vehiculo,
              as: 'vehiculo'
            },
            {
              model: Usuario,
              as: 'conductor'
            }
          ]
        },
        {
          model: Evento
        }
      ]
    });

    res.status(201).json(transporteCompleto);
  } catch (error) {
    console.error('Error al crear servicio de transporte:', error);
    res.status(500).json({ error: 'Error al crear servicio de transporte' });
  }
};

// Obtener todos los servicios de transporte
export const getTransportes = async (req: Request, res: Response) => {
  try {
    const transportes = await TransporteServicio.findAll({
      include: [
        {
          model: DetalleTransporte,
          include: [
            {
              model: Vehiculo,
              as: 'vehiculo'
            },
            {
              model: Usuario,
              as: 'conductor'
            }
          ]
        },
        {
          model: Evento
        }
      ]
    });

    res.json(transportes);
  } catch (error) {
    console.error('Error al obtener servicios de transporte:', error);
    res.status(500).json({ error: 'Error al obtener servicios de transporte' });
  }
};

// Editar un servicio de transporte
export const editTransporte = async (req: Request, res: Response) => {
  try {
    const { id_transporte } = req.params;
    const {
      distancia_km,
      precioneto_transporte,
      itbis_transporte,
      total_transporte,
      detalles // Array de detalles actualizados
    } = req.body;

    const transporte = await TransporteServicio.findByPk(id_transporte);
    if (!transporte) {
      return res.status(404).json({ error: 'Servicio de transporte no encontrado' });
    }

    // Actualizar el servicio
    await transporte.update({
      distancia_km: distancia_km || transporte.distancia_km,
      precioneto_transporte: precioneto_transporte || transporte.precioneto_transporte,
      itbis_transporte: itbis_transporte || transporte.itbis_transporte,
      total_transporte: total_transporte || transporte.total_transporte
    });

    // Si se proporcionaron nuevos detalles, actualizarlos
    if (detalles) {
      // Eliminar detalles existentes
      await DetalleTransporte.destroy({
        where: { id_transporte }
      });

      // Crear nuevos detalles
      if (detalles.length > 0) {
        const detallesPromises = detalles.map(async (detalle: any) => {
          // Verificar que el vehículo existe
          const vehiculo = await Vehiculo.findByPk(detalle.id_vehiculo);
          if (!vehiculo) {
            throw new Error(`Vehículo con ID ${detalle.id_vehiculo} no encontrado`);
          }

          // Verificar que el conductor existe
          const conductor = await Usuario.findByPk(detalle.id_usuarioconductor);
          if (!conductor) {
            throw new Error(`Conductor con cédula ${detalle.id_usuarioconductor} no encontrado`);
          }

          return DetalleTransporte.create({
            id_transporte,
            id_vehiculo: detalle.id_vehiculo,
            id_usuarioconductor: detalle.id_usuarioconductor,
            cantidad_elementos: detalle.cantidad_elementos,
            precioneto_transporte: detalle.precioneto_transporte,
            itbis_transporte: detalle.itbis_transporte,
            total_transporte: detalle.total_transporte
          });
        });

        await Promise.all(detallesPromises);
      }
    }

    // Obtener el servicio actualizado con sus detalles
    const transporteActualizado = await TransporteServicio.findByPk(id_transporte, {
      include: [
        {
          model: DetalleTransporte,
          include: [
            {
              model: Vehiculo,
              as: 'vehiculo'
            },
            {
              model: Usuario,
              as: 'conductor'
            }
          ]
        },
        {
          model: Evento
        }
      ]
    });

    res.json(transporteActualizado);
  } catch (error) {
    console.error('Error al editar servicio de transporte:', error);
    res.status(500).json({ error: 'Error al editar servicio de transporte' });
  }
};

// Eliminar lógicamente un servicio de transporte
export const deleteTransporte = async (req: Request, res: Response) => {
  try {
    const { id_transporte } = req.params;

    const transporte = await TransporteServicio.findByPk(id_transporte);
    if (!transporte) {
      return res.status(404).json({ error: 'Servicio de transporte no encontrado' });
    }

    // Eliminar los detalles asociados
    await DetalleTransporte.destroy({
      where: { id_transporte }
    });

    // Eliminar el servicio
    await transporte.destroy();

    res.json({ message: 'Servicio de transporte eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar servicio de transporte:', error);
    res.status(500).json({ error: 'Error al eliminar servicio de transporte' });
  }
}; 