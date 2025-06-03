import { Request, Response } from 'express';
import Evento from '../models/Evento_model';
import Usuario from '../models/Usuario_model';
import Espacio from '../models/Espacio_model';
import Comentario from '../models/Comentario_model';
import { Op } from 'sequelize';
import AlquilerServicio from '../models/AlquilerServicio_model';
import DecoracionServicio from '../models/DecoracionServicio_model';
import CateringServicio from '../models/CateringServicio_model';
import MontajeDesmontajeServicio from '../models/MontajeDesmontajeServicio_model';
import TransporteServicio from '../models/TransporteServicio_model';
import SupervisionServicio from '../models/SupervisionServicio_model';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    console.log('Iniciando obtención de estadísticas del dashboard...');
    console.log('Headers de la petición:', req.headers);

    // Obtener el rol del usuario del token
    const userRole = req.headers['user-role'];
    const userCedula = req.headers['user-cedula'];
    console.log('Rol del usuario:', userRole);
    console.log('Cédula del usuario:', userCedula);

    if (!userRole || !userCedula) {
      console.error('Faltan headers necesarios:', { userRole, userCedula });
      return res.status(400).json({ 
        error: 'Faltan headers necesarios',
        details: 'Se requieren los headers user-role y user-cedula'
      });
    }

    let stats = {};

    // Mostrar estadísticas para el Administrador
    if (userRole === '1') {
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

      // Obtener total de usuarios activos
      const totalUsuarios = await Usuario.count({
        where: {
          estado_usuario: 'Activo'
        }
      }).catch(error => {
        console.error('Error al obtener usuarios activos:', error);
        return 0;
      });

      // Obtener espacios disponibles
      const espacios = await Espacio.findAll({
        where: {
          estado_espacio: 'Activo'
        }
      }).catch(error => {
        console.error('Error al obtener espacios:', error);
        return [];
      });

      // Obtener cotizaciones pendientes
      const cotizacionesPendientes = await Evento.count({
        where: {
          estado_cotizacion: 'Pendiente'
        }
      }).catch(error => {
        console.error('Error al obtener cotizaciones pendientes:', error);
        return 0;
      });

      // Calcular calificación promedio
      const comentarios = await Comentario.findAll({
        where: {
          estado_comentario: 'Activo'
        }
      }).catch(error => {
        console.error('Error al obtener comentarios:', error);
        return [];
      });

      const calificacionPromedio = comentarios.length > 0
        ? Number((comentarios.reduce((acc, curr) => acc + (curr.calificacion || 0), 0) / comentarios.length).toFixed(1))
        : 0;

      stats = {
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
    }
    // Estadísticas para el Cliente
    else if (userRole === '2') {
      // Obtener eventos activos del cliente
      const eventosActivos = await Evento.count({
        where: {
          cedula_cliente: userCedula,
          estado_evento: {
            [Op.in]: ['Pendiente', 'Confirmado']
          }
        }
      }).catch(error => {
        console.error('Error al obtener eventos activos del cliente:', error);
        return 0;
      });

      // Obtener total de eventos realizados del cliente
      const eventosRealizados = await Evento.count({
        where: {
          cedula_cliente: userCedula,
          estado_evento: 'Completado'
        }
      }).catch(error => {
        console.error('Error al obtener eventos realizados del cliente:', error);
        return 0;
      });

      // Obtener comentarios enviados por el cliente a través de sus eventos
      const comentariosEnviados = await Comentario.count({
        include: [{
          model: Evento,
          where: {
            cedula_cliente: userCedula
          },
          required: true
        }],
        where: {
          estado_comentario: 'Activo'
        }
      }).catch(error => {
        console.error('Error al obtener comentarios enviados:', error);
        return 0;
      });

      stats = {
        eventosActivos: Number(eventosActivos) || 0,
        eventosRealizados: Number(eventosRealizados) || 0,
        comentariosEnviados: Number(comentariosEnviados) || 0
      };
    }
    // Estadísticas para el Organizador de eventos
    else if (userRole === '3') {
      // Obtener eventos asignados
      const eventosAsignados = await Evento.count({
        where: {
          cedula_asesor: userCedula
        }
      }).catch(error => {
        console.error('Error al obtener eventos asignados:', error);
        return 0;
      });

      // Obtener clientes activos
      const clientesActivos = await Usuario.count({
        where: {
          estado_usuario: 'Activo',
          id_rol: 2
        }
      }).catch(error => {
        console.error('Error al obtener clientes activos:', error);
        return 0;
      });

      // Calcular calificación promedio
      const comentarios = await Comentario.findAll({
        where: {
          estado_comentario: 'Activo'
        }
      }).catch(error => {
        console.error('Error al obtener comentarios:', error);
        return [];
      });

      const calificacionPromedio = comentarios.length > 0
        ? Number((comentarios.reduce((acc, curr) => acc + (curr.calificacion || 0), 0) / comentarios.length).toFixed(1))
        : 0;

      stats = {
        eventsInProcess: Number(eventosAsignados) || 0,
        totalUsers: Number(clientesActivos) || 0,
        averageRating: Number(calificacionPromedio) || 0
      };
    }
    // Estadísticas para el Encargado de inventario
    else if (userRole === '4') {
      // Obtener elementos disponibles
      const elementosDisponibles = await Espacio.count({
        where: {
          estado_espacio: 'Activo'
        }
      }).catch(error => {
        console.error('Error al obtener elementos disponibles:', error);
        return 0;
      });

      // Obtener eventos que requieren inventario
      const eventosConInventario = await Evento.count({
        where: {
          estado_evento: {
            [Op.in]: ['Pendiente', 'Confirmado']
          }
        }
      }).catch(error => {
        console.error('Error al obtener eventos con inventario:', error);
        return 0;
      });

      stats = {
        eventsInProcess: Number(elementosDisponibles) || 0,
        totalUsers: Number(eventosConInventario) || 0
      };
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

export const getEventosRealizados = async (req: Request, res: Response) => {
  try {
    const userCedula = req.headers['user-cedula'];
    
    if (!userCedula) {
      return res.status(400).json({ 
        error: 'Falta header necesario',
        details: 'Se requiere el header user-cedula'
      });
    }

    const eventos = await Evento.findAll({
      where: {
        cedula_cliente: userCedula,
        estado_evento: 'Completado'
      },
      include: [
        {
          model: Usuario,
          as: 'asesor',
          attributes: ['nombre_usuario', 'apellido_usuario', 'tel_usuario']
        },
        {
          model: Espacio,
          as: 'espacio',
          attributes: ['nombre_espacio']
        },
        {
          model: AlquilerServicio,
          as: 'alquileres_servicio'
        },
        {
          model: DecoracionServicio,
          as: 'decoracion_servicio'
        },
        {
          model: CateringServicio,
          as: 'catering_servicio'
        },
        {
          model: MontajeDesmontajeServicio,
          as: 'montaje_desmontaje_servicio'
        },
        {
          model: TransporteServicio,
          as: 'transporte_servicio'
        },
        {
          model: SupervisionServicio,
          as: 'supervision_servicio'
        }
      ]
    });

    const eventosFormateados = eventos.map(evento => ({
      id_evento: evento.id_evento,
      empleado_encargado: `${evento.asesor?.nombre_usuario} ${evento.asesor?.apellido_usuario}`,
      contacto_asesor: evento.asesor?.tel_usuario || 'No disponible',
      fecha_evento: evento.fecha_evento,
      hora_evento: evento.hora_evento,
      espacio: evento.espacio?.nombre_espacio || 'No disponible',
      servicios_adicionales: [
        ...(evento.alquileres_servicio?.length ? ['Alquiler'] : []),
        ...(evento.decoracion_servicio ? ['Decoración'] : []),
        ...(evento.catering_servicio ? ['Catering'] : []),
        ...(evento.montaje_desmontaje_servicio ? ['Montaje/Desmontaje'] : []),
        ...(evento.transporte_servicio ? ['Transporte'] : []),
        ...(evento.supervision_servicio ? ['Supervisión'] : [])
      ]
    }));

    res.status(200).json(eventosFormateados);
  } catch (error) {
    console.error('Error al obtener eventos realizados:', error);
    res.status(500).json({ 
      error: 'Error al obtener eventos realizados',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}; 