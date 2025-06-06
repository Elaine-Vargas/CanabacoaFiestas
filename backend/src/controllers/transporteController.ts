import { Request, Response } from 'express';
import TransporteServicio from '../models/TransporteServicio_model';
import DetalleTransporte from '../models/DetalleTransporte_model';
import Evento from '../models/Evento_model';
import Vehiculo from '../models/Vehiculo_model';
import AlquilerServicio from '../models/AlquilerServicio_model';

// Crear un nuevo servicio de transporte con sus detalles
export const createTransporte = async (req: Request, res: Response) => {
  try {
    const {
      id_evento,
      id_alquiler,
      distancia_km,
      precioneto_transporte,
      itbis_transporte,
      total_transporte,
      estado_transporte,
      detalles // Array de detalles de transporte
    } = req.body;

    // Verificar que el evento existe
    const evento = await Evento.findByPk(id_evento);
    if (!evento) {
      return res.status(404).json({ 
        error: 'Evento no encontrado',
        mensaje: 'No se encontró el evento solicitado'
      });
    }

    // Verificar que el alquiler existe
    const alquiler = await AlquilerServicio.findByPk(id_alquiler);
    if (!alquiler) {
      return res.status(404).json({ 
        error: 'Servicio de alquiler no encontrado',
        mensaje: 'No se encontró el servicio de alquiler solicitado'
      });
    }

    // Crear el servicio de transporte
    const transporte = await TransporteServicio.create({
      id_evento,
      id_alquiler,
      distancia_km,
      precioneto_transporte,
      itbis_transporte,
      total_transporte,
      estado_transporte: estado_transporte || 'Solicitado'
    });

    // Crear los detalles de transporte
    if (detalles && detalles.length > 0) {
      const detallesPromises = detalles.map(async (detalle: any) => {
        // Verificar que el vehículo existe
        const vehiculo = await Vehiculo.findByPk(detalle.matricula_vehiculo);
        if (!vehiculo) {
          throw new Error(`Vehículo con matrícula ${detalle.matricula_vehiculo} no encontrado`);
        }

        return DetalleTransporte.create({
          id_transporte: transporte.id_transporte,
          matricula_vehiculo: detalle.matricula_vehiculo,
          conductor: detalle.conductor,
          estado_dettransporte: detalle.estado_dettransporte || 'Aceptado'
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
            }
          ]
        },
        {
          model: Evento
        },
        {
          model: AlquilerServicio,
          as: 'alquilerServicio'
        }
      ]
    });

    res.status(201).json(transporteCompleto);
  } catch (error) {
    console.error('Error al crear servicio de transporte:', error);
    res.status(500).json({ 
      error: 'Error al crear servicio de transporte',
      mensaje: 'Ocurrió un error al crear el servicio de transporte'
    });
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
            }
          ]
        },
        {
          model: Evento
        },
        {
          model: AlquilerServicio,
          as: 'alquilerServicio'
        }
      ],
      order: [['id_transporte', 'DESC']]
    });

    if (!transportes || transportes.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontraron transportes',
        mensaje: 'No hay servicios de transporte registrados en el sistema'
      });
    }

    res.json(transportes);
  } catch (error) {
    console.error('Error al obtener servicios de transporte:', error);
    res.status(500).json({ 
      error: 'Error al obtener servicios de transporte',
      mensaje: 'Ocurrió un error al cargar los servicios de transporte'
    });
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
      estado_transporte,
      detalles // Array de detalles actualizados
    } = req.body;

    const transporte = await TransporteServicio.findByPk(id_transporte);
    if (!transporte) {
      return res.status(404).json({ 
        error: 'Servicio de transporte no encontrado',
        mensaje: 'No se encontró el servicio de transporte solicitado'
      });
    }

    // Actualizar el servicio
    await transporte.update({
      distancia_km: distancia_km || transporte.distancia_km,
      precioneto_transporte: precioneto_transporte || transporte.precioneto_transporte,
      itbis_transporte: itbis_transporte || transporte.itbis_transporte,
      total_transporte: total_transporte || transporte.total_transporte,
      estado_transporte: estado_transporte || transporte.estado_transporte
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
          const vehiculo = await Vehiculo.findByPk(detalle.matricula_vehiculo);
          if (!vehiculo) {
            throw new Error(`Vehículo con matrícula ${detalle.matricula_vehiculo} no encontrado`);
          }

          return DetalleTransporte.create({
            id_transporte,
            matricula_vehiculo: detalle.matricula_vehiculo,
            conductor: detalle.conductor,
            estado_dettransporte: detalle.estado_dettransporte || 'Aceptado'
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
            }
          ]
        },
        {
          model: Evento
        },
        {
          model: AlquilerServicio,
          as: 'alquilerServicio'
        }
      ]
    });

    res.json(transporteActualizado);
  } catch (error) {
    console.error('Error al editar servicio de transporte:', error);
    res.status(500).json({ 
      error: 'Error al editar servicio de transporte',
      mensaje: 'Ocurrió un error al actualizar el servicio de transporte'
    });
  }
};

// Eliminar lógicamente un servicio de transporte
export const deleteTransporte = async (req: Request, res: Response) => {
  try {
    const { id_transporte } = req.params;

    const transporte = await TransporteServicio.findByPk(id_transporte);
    if (!transporte) {
      return res.status(404).json({ 
        error: 'Servicio de transporte no encontrado',
        mensaje: 'No se encontró el servicio de transporte solicitado'
      });
    }

    // Actualizar el estado a Cancelado
    await transporte.update({
      estado_transporte: 'Cancelado'
    });

    // Actualizar el estado de los detalles a Cancelado
    await DetalleTransporte.update(
      { estado_dettransporte: 'Cancelado' },
      { where: { id_transporte } }
    );

    res.json({ 
      error: null,
      mensaje: 'Servicio de transporte cancelado correctamente'
    });
  } catch (error) {
    console.error('Error al cancelar servicio de transporte:', error);
    res.status(500).json({ 
      error: 'Error al cancelar servicio de transporte',
      mensaje: 'Ocurrió un error al cancelar el servicio de transporte'
    });
  }
}; 