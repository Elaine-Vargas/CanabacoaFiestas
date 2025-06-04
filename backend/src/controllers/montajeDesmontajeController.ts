import { Request, Response } from 'express';
import MontajeDesmontajeServicio from '../models/MontajeDesmontajeServicio_model';
import DetalleMontajedesmontaje from '../models/DetalleMontajeDesmontaje_model';
import Evento from '../models/Evento_model';
import Usuario from '../models/Usuario_model';

// Definir interfaz para los datos del detalle
interface DetalleData {
  cedula_usuariopersonal: string;
  horas_trabajo: number;
  precioneto_montaje: number;
}

// Obtener todos los servicios de montaje/desmontaje
export const getMontajesDesmontajes = async (req: Request, res: Response) => {
  try {
    const servicios = await MontajeDesmontajeServicio.findAll({
      include: [
        { model: DetalleMontajedesmontaje, include: [{ model: Usuario, as: 'usuarioPersonal' }] },
        { model: Evento }
      ]
    });

    if (!servicios || servicios.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontraron servicios',
        mensaje: 'No hay servicios de montaje/desmontaje registrados'
      });
    }

    res.json(servicios);
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    res.status(500).json({ 
      error: 'Error al obtener los servicios',
      mensaje: 'Ocurrió un error al cargar los servicios'
    });
  }
};

// Crear un nuevo servicio de montaje/desmontaje con sus detalles
export const createMontajeDesmontaje = async (req: Request, res: Response) => {
  try {
    const { id_evento, precio_neto, itbis, total, detalles } = req.body;

    // Validación básica
    if (!id_evento || !detalles || !Array.isArray(detalles)) {
      return res.status(400).json({ error: 'Datos incompletos o inválidos' });
    }

    const evento = await Evento.findByPk(id_evento);
    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    // Crear el servicio principal
    const montajeDesmontaje = await MontajeDesmontajeServicio.create({
      id_evento: Number(id_evento),
      precio_neto: Number(precio_neto),
      itbis: Number(itbis),
      total: Number(total)
    });

    // Procesar detalles
    const detallesCreados = await Promise.all(
      detalles.map(async (detalle: DetalleData) => {
        const cedula = detalle.cedula_usuariopersonal;
        
        const usuario = await Usuario.findByPk(cedula);
        if (!usuario) {
          throw new Error(`Usuario con cédula ${cedula} no encontrado`);
        }

        return DetalleMontajedesmontaje.create({
          id_montdes: montajeDesmontaje.id_montdes,
          cedula_usuariopersonal: cedula,
          horas_trabajo: Number(detalle.horas_trabajo),
          precioneto_montaje: Number(detalle.precioneto_montaje)
        } as any);
      })
    );

    // Respuesta con los datos completos
    const response = await MontajeDesmontajeServicio.findByPk(montajeDesmontaje.id_montdes, {
      include: [
        { model: DetalleMontajedesmontaje, include: [{ model: Usuario, as: 'usuarioPersonal' }] },
        { model: Evento }
      ]
    });

    return res.status(201).json(response);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Error al crear servicio',
      details: error instanceof Error ? error.message : error
    });
  }
};

// Editar un servicio existente
export const editMontajeDesmontaje = async (req: Request, res: Response) => {
  try {
    const { id_montdes } = req.params;
    const { precio_neto, itbis, total, detalles } = req.body;

    // Validar ID
    const id = Number(id_montdes);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de servicio inválido' });
    }

    // Buscar servicio existente
    const servicio = await MontajeDesmontajeServicio.findByPk(id);
    if (!servicio) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    // Actualizar servicio principal
    await servicio.update({
      precio_neto: Number(precio_neto ?? servicio.precio_neto),
      itbis: Number(itbis ?? servicio.itbis),
      total: Number(total ?? servicio.total)
    });

    // Procesar detalles si se proporcionan
    if (detalles && Array.isArray(detalles)) {
      // Eliminar detalles existentes
      await DetalleMontajedesmontaje.destroy({ where: { id_montdes: id } });

      // Crear nuevos detalles
      if (detalles.length > 0) {
        await Promise.all(
          detalles.map(async (detalle: DetalleData) => {
            const cedula = detalle.cedula_usuariopersonal;
            
            const usuario = await Usuario.findByPk(cedula);
            if (!usuario) {
              throw new Error(`Usuario no encontrado: ${cedula}`);
            }

            await DetalleMontajedesmontaje.create({
              id_montdes: id,
              cedula_usuariopersonal: cedula,
              horas_trabajo: Number(detalle.horas_trabajo),
              precioneto_montaje: Number(detalle.precioneto_montaje)
            } as any);
          })
        );
      }
    }

    // Obtener servicio actualizado
    const servicioActualizado = await MontajeDesmontajeServicio.findByPk(id, {
      include: [
        { model: DetalleMontajedesmontaje, include: [{ model: Usuario, as: 'usuarioPersonal' }] },
        { model: Evento }
      ]
    });

    return res.json(servicioActualizado);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Error al actualizar servicio',
      details: error instanceof Error ? error.message : error
    });
  }
};

// Eliminar lógicamente un servicio
export const deleteMontajeDesmontaje = async (req: Request, res: Response) => {
  try {
    const { id_montdes } = req.params;

    // Validar ID
    const id = Number(id_montdes);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de servicio inválido' });
    }

    // Buscar servicio existente
    const servicio = await MontajeDesmontajeServicio.findByPk(id);
    if (!servicio) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    // Eliminar lógicamente el servicio y sus detalles
    await Promise.all([
      servicio.update({ estado: 'Eliminado' }),
      DetalleMontajedesmontaje.destroy({ where: { id_montdes: id } })
    ]);

    res.json({
      mensaje: 'Servicio eliminado exitosamente',
      servicio
    });
  } catch (error) {
    console.error('Error al eliminar servicio:', error);
    res.status(500).json({ 
      error: 'Error al eliminar servicio',
      mensaje: 'Ocurrió un error al eliminar el servicio'
    });
  }
};

