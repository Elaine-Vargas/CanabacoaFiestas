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
            desea_supervision,
            nota_cliente
        } = req.body;

        // Verificar roles
        const cliente = await Usuario.findOne({ where: { cedula_usuario: cedula_cliente, id_rol: 2 } });
        const asesor = await Usuario.findOne({ where: { cedula_usuario: cedula_asesor, id_rol: 3 } });

        if (!cliente) {
            return res.status(400).json({ message: 'El cliente no existe o no tiene el rol correcto' });
        }

        if (!asesor) {
            return res.status(400).json({ message: 'El asesor no existe o no tiene el rol correcto' });
        }

        const evento = await Evento.create({
            cedula_cliente,
            cedula_asesor: cedula_asesor || null,
            fecha_evento,
            hora_evento,
            id_espacio,
            id_tipo_evento,
            desea_supervision: desea_supervision || false,
            nota_cliente: nota_cliente || null
        });

        res.status(201).json(evento);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el evento', error });
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
        res.json(eventos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los eventos', error });
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
        res.json(eventos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los eventos por estado', error });
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
        res.json(eventos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los eventos del cliente', error });
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
        res.json(eventos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los eventos del asesor', error });
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
            id_espacio,
            id_tipo_evento,
            desea_supervision,
            nota_cliente,
            estado_evento
        } = req.body;

        // Verificar roles si se están actualizando
        if (cedula_cliente) {
            const cliente = await Usuario.findOne({ where: { cedula_usuario: cedula_cliente, id_rol: 2 } });
            if (!cliente) {
                return res.status(400).json({ message: 'El cliente no existe o no tiene el rol correcto' });
            }
        }

        if (cedula_asesor) {
            const asesor = await Usuario.findOne({ where: { cedula_usuario: cedula_asesor, id_rol: 3 } });
            if (!asesor) {
                return res.status(400).json({ message: 'El asesor no existe o no tiene el rol correcto' });
            }
        }

        const evento = await Evento.findByPk(id_evento);
        if (!evento) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }

        await evento.update({
            cedula_cliente: cedula_cliente || evento.cedula_cliente,
            cedula_asesor: cedula_asesor || evento.cedula_asesor,
            fecha_evento: fecha_evento || evento.fecha_evento,
            hora_evento: hora_evento || evento.hora_evento,
            id_espacio: id_espacio || evento.id_espacio,
            id_tipo_evento: id_tipo_evento || evento.id_tipo_evento,
            desea_supervision: desea_supervision !== undefined ? desea_supervision : evento.desea_supervision,
            nota_cliente: nota_cliente || evento.nota_cliente,
            estado_evento: estado_evento || evento.estado_evento
        });

        res.json(evento);
    } catch (error) {
        res.status(500).json({ message: 'Error al editar el evento', error });
    }
};

export const deleteEvent = async (req: Request, res: Response) => {
    try {
        const { id_evento } = req.params;
        const evento = await Evento.findByPk(id_evento);
        
        if (!evento) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }

        await evento.update({
            estado_evento: 'Cancelado'
        });

        res.json({ message: 'Evento eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el evento', error });
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