import { Request, Response } from 'express';
import DecoracionServicio from '../models/DecoracionServicio_model';
import Evento from '../models/Evento_model';
import { Op } from 'sequelize';

export const createDecoracion = async (req: Request, res: Response) => {
    try {
        const {
            id_evento,
            tema_decoracion,
            precioneto_decor,
            itbis_decoracion,
            total_decoracion
        } = req.body;

        // Verificar que el evento existe
        const evento = await Evento.findByPk(id_evento);
        if (!evento) {
            return res.status(404).json({ error: 'Evento no encontrado' });
        }

        // Crear el servicio de decoración
        const decoracion = await DecoracionServicio.create({
            id_evento,
            tema_decoracion,
            precioneto_decor,
            itbis_decoracion,
            total_decoracion
        });

        res.status(201).json(decoracion);
    } catch (error) {
        console.error('Error al crear servicio de decoración:', error);
        res.status(500).json({ error: 'Error al crear servicio de decoración' });
    }
};

export const getAllDecoraciones = async (req: Request, res: Response) => {
    try {
        const decoraciones = await DecoracionServicio.findAll({
            include: [
                {
                    model: Evento,
                    as: 'evento'
                }
            ]
        });
        res.json(decoraciones);
    } catch (error) {
        console.error('Error al obtener servicios de decoración:', error);
        res.status(500).json({ error: 'Error al obtener servicios de decoración' });
    }
};

export const getDecoracionesByTema = async (req: Request, res: Response) => {
    try {
        const { tema } = req.params;
        const decoraciones = await DecoracionServicio.findAll({
            where: {
                tema_decoracion: {
                    [Op.like]: `%${tema}%`
                }
            },
            include: [
                {
                    model: Evento,
                    as: 'evento'
                }
            ]
        });
        res.json(decoraciones);
    } catch (error) {
        console.error('Error al buscar servicios de decoración por tema:', error);
        res.status(500).json({ error: 'Error al buscar servicios de decoración por tema' });
    }
};

export const editDecoracion = async (req: Request, res: Response) => {
    try {
        const { id_decoracion } = req.params;
        const {
            tema_decoracion,
            precioneto_decor,
            itbis_decoracion,
            total_decoracion
        } = req.body;

        const decoracion = await DecoracionServicio.findByPk(id_decoracion);
        if (!decoracion) {
            return res.status(404).json({ error: 'Servicio de decoración no encontrado' });
        }

        // Actualizar el servicio de decoración
        await decoracion.update({
            tema_decoracion: tema_decoracion || decoracion.tema_decoracion,
            precioneto_decor: precioneto_decor || decoracion.precioneto_decor,
            itbis_decoracion: itbis_decoracion || decoracion.itbis_decoracion,
            total_decoracion: total_decoracion || decoracion.total_decoracion
        });

        res.json(decoracion);
    } catch (error) {
        console.error('Error al editar servicio de decoración:', error);
        res.status(500).json({ error: 'Error al editar servicio de decoración' });
    }
};

export const deleteDecoracion = async (req: Request, res: Response) => {
    try {
        const { id_decoracion } = req.params;
        const decoracion = await DecoracionServicio.findByPk(id_decoracion);
        
        if (!decoracion) {
            return res.status(404).json({ error: 'Servicio de decoración no encontrado' });
        }

        // Borrado lógico - marcar como eliminado
        await decoracion.update({
            estado: 'Eliminado'
        });

        res.json({ message: 'Servicio de decoración eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar servicio de decoración:', error);
        res.status(500).json({ error: 'Error al eliminar servicio de decoración' });
    }
};
