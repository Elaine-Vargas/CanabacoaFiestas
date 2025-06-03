import { Request, Response } from 'express';
import Evento from '../models/Evento_model';
import Usuario from '../models/Usuario_model';
import Espacio from '../models/Espacio_model';
import Comentario from '../models/Comentario_model';
import { Op } from 'sequelize';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    console.log('Iniciando obtención de estadísticas del dashboard...');
    console.log('Headers de la petición:', req.headers);

    // Obtener eventos en proceso
    const eventosEnProceso = await Evento.count({
      where: {
        estado_evento: {
          [Op.in]: ['Pendiente', 'Confirmado']
        }
      }
    }).catch(error => {
      console.error('Error al obtener eventos en proceso:', error);
      return 0;
    });
    console.log('Eventos en proceso encontrados:', eventosEnProceso);

    // Obtener total de usuarios activos
    const totalUsuarios = await Usuario.count({
      where: {
        estado_usuario: 'Activo'
      }
    }).catch(error => {
      console.error('Error al obtener usuarios activos:', error);
      return 0;
    });
    console.log('Total de usuarios activos encontrados:', totalUsuarios);

    // Obtener espacios disponibles
    const espacios = await Espacio.findAll({
      where: {
        estado_espacio: 'Activo'
      }
    }).catch(error => {
      console.error('Error al obtener espacios:', error);
      return [];
    });
    console.log('Espacios activos encontrados:', espacios.length);

    // Obtener cotizaciones pendientes
    const cotizacionesPendientes = await Evento.count({
      where: {
        estado_cotizacion: 'Pendiente'
      }
    }).catch(error => {
      console.error('Error al obtener cotizaciones pendientes:', error);
      return 0;
    });
    console.log('Cotizaciones pendientes encontradas:', cotizacionesPendientes);

    // Calcular calificación promedio
    const comentarios = await Comentario.findAll({
      where: {
        estado_comentario: 'Activo'
      }
    }).catch(error => {
      console.error('Error al obtener comentarios:', error);
      return [];
    });
    console.log('Comentarios activos encontrados:', comentarios.length);

    const calificacionPromedio = comentarios.length > 0
      ? Number((comentarios.reduce((acc, curr) => acc + (curr.calificacion || 0), 0) / comentarios.length).toFixed(1))
      : 0;
    console.log('Calificación promedio calculada:', calificacionPromedio);

    // Verificar la estructura de los datos antes de enviarlos
    const stats = {
      eventsInProcess: Number(eventosEnProceso) || 0,
      totalUsers: Number(totalUsuarios) || 0,
      spaces: Array.isArray(espacios) ? espacios.map(espacio => ({
        id_espacio: espacio.id_espacio,
        nombre: espacio.nombre_espacio,
        telefono: espacio.tel_espacio,
        estado: espacio.estado_espacio
      })) : [],
      quotations: Number(cotizacionesPendientes) || 0,
      averageRating: Number(calificacionPromedio) || 0
    };

    console.log('Estadísticas finales a enviar:', JSON.stringify(stats, null, 2));
    
    // Verificar que todos los campos requeridos estén presentes y sean del tipo correcto
    if (typeof stats.eventsInProcess !== 'number' ||
        typeof stats.totalUsers !== 'number' ||
        !Array.isArray(stats.spaces) ||
        typeof stats.quotations !== 'number' ||
        typeof stats.averageRating !== 'number') {
      console.error('Estructura de datos inválida:', stats);
      throw new Error('Estructura de datos inválida');
    }

    // Configurar headers de respuesta
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Enviar respuesta
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error detallado al obtener estadísticas del dashboard:', error);
    
    // Configurar headers de respuesta para el error
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    res.status(500).json({ 
      error: 'Error al obtener estadísticas del dashboard',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}; 