import { Request, Response } from 'express';
import Evento from '../models/Evento_model';
import Usuario from '../models/Usuario_model';
import { Op } from 'sequelize';
import TipoEvento from '../models/TipoEvento_model';

export const createEvent = async (req: Request, res: Response) => {
    try {
        const {
            cedula_cliente,
            cedula_asesor,
            fecha_evento,
            hora_evento,
            id_tipo_evento,
            id_direccion,
            espacio_evento,
            estado_solicitud,
            estado_evento,
            desea_supervision,
            nota_cliente,
            subtotal_evento,
            itbis_evento,
            total_evento
        } = req.body;

        // Verificar roles
        const cliente = await Usuario.findOne({ where: { cedula_usuario: cedula_cliente, id_rol: 2 } });
        const asesor = await Usuario.findOne({ where: { cedula_usuario: cedula_asesor, id_rol: 3 } });

        if (!cliente) {
            return res.status(400).json({ 
                error: 'Cliente no válido',
                mensaje: 'El cliente no existe o no tiene el rol correcto'
            });
        }

        if (!asesor) {
            return res.status(400).json({ 
                error: 'Asesor no válido',
                mensaje: 'El asesor no existe o no tiene el rol correcto'
            });
        }

        const evento = await Evento.create({
            cedula_cliente,
            cedula_asesor: cedula_asesor || null,
            fecha_evento,
            hora_evento,
            id_direccion,
            espacio_evento,
            id_tipo_evento,
            estado_solicitud: estado_solicitud || 'Pendiente',
            estado_evento: estado_evento || 'Pendiente',
            desea_supervision: desea_supervision || false,
            nota_cliente: nota_cliente || null,
            subtotal_evento: subtotal_evento || 0.00,
            itbis_evento: itbis_evento || 0.00,
            total_evento: total_evento || 0.00
        });

        res.status(201).json(evento);
    } catch (error) {
        console.error('Error al crear evento:', error);
        res.status(500).json({ 
            error: 'Error al crear el evento',
            mensaje: 'Ocurrió un error al crear el evento'
        });
    }
};

export const showAllEvents = async (req: Request, res: Response) => {
    try {
        const eventos = await Evento.findAll({
            include: [
                { model: Usuario, as: 'cliente' },
                { model: Usuario, as: 'asesor' }
            ]
        });

        if (!eventos || eventos.length === 0) {
            return res.status(404).json({ 
                error: 'No se encontraron eventos',
                mensaje: 'No hay eventos registrados en el sistema'
            });
        }

        res.json(eventos);
    } catch (error) {
        console.error('Error al obtener eventos:', error);
        res.status(500).json({ 
            error: 'Error al obtener los eventos',
            mensaje: 'Ocurrió un error al cargar los eventos'
        });
    }
};

export const showEventsByStatus = async (req: Request, res: Response) => {
    try {
        const { estado } = req.params;
        const eventos = await Evento.findAll({
            where: { estado_evento: estado },
            include: [
                { model: Usuario, as: 'cliente' },
                { model: Usuario, as: 'asesor' }
            ]
        });

        if (!eventos || eventos.length === 0) {
            return res.status(404).json({ 
                error: 'No se encontraron eventos',
                mensaje: `No hay eventos registrados con el estado: ${estado}`
            });
        }

        res.json(eventos);
    } catch (error) {
        console.error('Error al obtener eventos por estado:', error);
        res.status(500).json({ 
            error: 'Error al obtener los eventos por estado',
            mensaje: 'Ocurrió un error al cargar los eventos'
        });
    }
};

export const showEventsByClient = async (req: Request, res: Response) => {
    try {
        const { cedula_cliente } = req.params;
        const eventos = await Evento.findAll({
            where: { cedula_cliente },
            include: [
                { model: Usuario, as: 'cliente' },
                { model: Usuario, as: 'asesor' }
            ]
        });

        if (!eventos || eventos.length === 0) {
            return res.status(404).json({ 
                error: 'No se encontraron eventos',
                mensaje: `No hay eventos registrados para el cliente con cédula: ${cedula_cliente}`
            });
        }

        res.json(eventos);
    } catch (error) {
        console.error('Error al obtener eventos del cliente:', error);
        res.status(500).json({ 
            error: 'Error al obtener los eventos del cliente',
            mensaje: 'Ocurrió un error al cargar los eventos'
        });
    }
};

export const showEventsByAsesor = async (req: Request, res: Response) => {
    try {
        const { cedula_asesor } = req.params;
        const eventos = await Evento.findAll({
            where: { cedula_asesor },
            include: [
                { model: Usuario, as: 'cliente' },
                { model: Usuario, as: 'asesor' }
            ]
        });

        if (!eventos || eventos.length === 0) {
            return res.status(404).json({ 
                error: 'No se encontraron eventos',
                mensaje: `No hay eventos registrados para el asesor con cédula: ${cedula_asesor}`
            });
        }

        res.json(eventos);
    } catch (error) {
        console.error('Error al obtener eventos del asesor:', error);
        res.status(500).json({ 
            error: 'Error al obtener los eventos del asesor',
            mensaje: 'Ocurrió un error al cargar los eventos'
        });
    }
};

export const editEvent = async (req: Request, res: Response) => {
    try {
        const { id_evento } = req.params;
        const {
            cedula_cliente,
            cedula_asesor,
            fecha_evento,
            hora_evento,
            id_direccion,
            espacio_evento,
            id_tipo_evento,
            desea_supervision,
            nota_cliente,
            estado_solicitud,
            estado_evento,
            subtotal_evento,
            itbis_evento,
            total_evento
        } = req.body;

        // Verificar roles si se están actualizando
        if (cedula_cliente) {
            const cliente = await Usuario.findOne({ where: { cedula_usuario: cedula_cliente, id_rol: 2 } });
            if (!cliente) {
                return res.status(400).json({ 
                    error: 'Cliente no válido',
                    mensaje: 'El cliente no existe o no tiene el rol correcto'
                });
            }
        }

        if (cedula_asesor) {
            const asesor = await Usuario.findOne({ where: { cedula_usuario: cedula_asesor, id_rol: 3 } });
            if (!asesor) {
                return res.status(400).json({ 
                    error: 'Asesor no válido',
                    mensaje: 'El asesor no existe o no tiene el rol correcto'
                });
            }
        }

        const evento = await Evento.findByPk(id_evento);
        if (!evento) {
            return res.status(404).json({ 
                error: 'Evento no encontrado',
                mensaje: 'No se encontró el evento solicitado'
            });
        }

        await evento.update({
            cedula_cliente: cedula_cliente || evento.cedula_cliente,
            cedula_asesor: cedula_asesor || evento.cedula_asesor,
            fecha_evento: fecha_evento || evento.fecha_evento,
            hora_evento: hora_evento || evento.hora_evento,
            id_direccion: id_direccion || evento.id_direccion,
            espacio_evento: espacio_evento || evento.espacio_evento,
            id_tipo_evento: id_tipo_evento || evento.id_tipo_evento,
            estado_solicitud: estado_solicitud || evento.estado_solicitud,
            estado_evento: estado_evento || evento.estado_evento,
            desea_supervision: desea_supervision !== undefined ? desea_supervision : evento.desea_supervision,
            nota_cliente: nota_cliente || evento.nota_cliente,
            subtotal_evento: subtotal_evento || evento.subtotal_evento,
            itbis_evento: itbis_evento || evento.itbis_evento,
            total_evento: total_evento || evento.total_evento
        });

        res.json(evento);
    } catch (error) {
        console.error('Error al editar evento:', error);
        res.status(500).json({ 
            error: 'Error al editar el evento',
            mensaje: 'Ocurrió un error al actualizar el evento'
        });
    }
};

export const deleteEvent = async (req: Request, res: Response) => {
    try {
        const { id_evento } = req.params;
        const evento = await Evento.findByPk(id_evento);
        
        if (!evento) {
            return res.status(404).json({ 
                error: 'Evento no encontrado',
                mensaje: 'No se encontró el evento solicitado'
            });
        }

        await evento.update({
            estado_evento: 'Cancelado'
        });

        res.json({ 
            error: null,
            mensaje: 'Evento cancelado correctamente'
        });
    } catch (error) {
        console.error('Error al cancelar evento:', error);
        res.status(500).json({ 
            error: 'Error al cancelar el evento',
            mensaje: 'Ocurrió un error al cancelar el evento'
        });
    }
};


export const getTiposEventos = async (req: Request, res: Response) => {
    try {
      console.log('Intentando obtener tipos de evento...');
      const tipoevento = await TipoEvento.findAll({
      });
  
      if (!tipoevento || tipoevento.length === 0) {
        console.log('No se encontraron tipos de eventos');
        return res.status(404).json({ 
          error: 'No se encontraron tipos de eventos',
          mensaje: 'No hay tipos de eventos disponibles'
        });
      }
  
      res.json(tipoevento);
    } catch (error) {
      console.error('Error detallado al obtener tipos de eventos:', error);
      res.status(500).json({ 
        error: 'Error al obtener los tipos de eventos',
        mensaje: 'Ocurrió un error al cargar los tipos de eventos. Por favor, intente más tarde.'
      });
    }
  };