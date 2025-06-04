import { Request, Response } from 'express';
import CateringServicio from '../models/CateringServicio_model';
import Evento from '../models/Evento_model';
import MenuCatering from '../models/MenuCatering_model';

export const createCatering = async (req: Request, res: Response) => {
    try {
        const {
            id_evento,
            personas_catering,
            precioneto_catering,
            itbis_catering,
            total_catering,
            menus // Array de IDs de menús
        } = req.body;

        // Verificar que el evento existe
        const evento = await Evento.findByPk(id_evento);
        if (!evento) {
            return res.status(404).json({ error: 'Evento no encontrado' });
        }

        // Crear el servicio de catering
        const catering = await CateringServicio.create({
            id_evento,
            personas_catering,
            precioneto_catering,
            itbis_catering,
            total_catering
        });

        // Si se proporcionaron menús, crearlos
        if (menus && menus.length > 0) {
            const menuPromises = menus.map((menuId: number) => 
                MenuCatering.create({
                    id_catering: catering.id_catering,
                    id_menu: menuId
                })
            );
            await Promise.all(menuPromises);
        }

        // Obtener el catering con sus menús
        const cateringConMenus = await CateringServicio.findByPk(catering.id_catering, {
            include: [
                {
                    model: MenuCatering,
                    as: 'menu_catering'
                }
            ]
        });

        res.status(201).json(cateringConMenus);
    } catch (error) {
        console.error('Error al crear servicio de catering:', error);
        res.status(500).json({ error: 'Error al crear servicio de catering' });
    }
};

export const getAllCaterings = async (req: Request, res: Response) => {
    try {
        const caterings = await CateringServicio.findAll({
            include: [
                {
                    model: Evento,
                    as: 'evento'
                },
                {
                    model: MenuCatering,
                    as: 'menu_catering'
                }
            ]
        });
        res.json(caterings);
    } catch (error) {
        console.error('Error al obtener servicios de catering:', error);
        res.status(500).json({ error: 'Error al obtener servicios de catering' });
    }
};

export const getCateringById = async (req: Request, res: Response) => {
    try {
        const { id_catering } = req.params;
        const catering = await CateringServicio.findByPk(id_catering, {
            include: [
                {
                    model: Evento,
                    as: 'evento'
                },
                {
                    model: MenuCatering,
                    as: 'menu_catering'
                }
            ]
        });

        if (!catering) {
            return res.status(404).json({ error: 'Servicio de catering no encontrado' });
        }

        res.json(catering);
    } catch (error) {
        console.error('Error al obtener servicio de catering:', error);
        res.status(500).json({ error: 'Error al obtener servicio de catering' });
    }
};

export const editCatering = async (req: Request, res: Response) => {
    try {
        const { id_catering } = req.params;
        const {
            personas_catering,
            precioneto_catering,
            itbis_catering,
            total_catering,
            menus // Array de IDs de menús
        } = req.body;

        const catering = await CateringServicio.findByPk(id_catering);
        if (!catering) {
            return res.status(404).json({ error: 'Servicio de catering no encontrado' });
        }

        // Actualizar el servicio de catering
        await catering.update({
            personas_catering: personas_catering || catering.personas_catering,
            precioneto_catering: precioneto_catering || catering.precioneto_catering,
            itbis_catering: itbis_catering || catering.itbis_catering,
            total_catering: total_catering || catering.total_catering
        });

        // Si se proporcionaron nuevos menús, actualizar la lista
        if (menus) {
            // Eliminar menús existentes
            await MenuCatering.destroy({
                where: { id_catering: id_catering }
            });

            // Crear nuevos menús
            if (menus.length > 0) {
                const menuPromises = menus.map((menuId: number) => 
                    MenuCatering.create({
                        id_catering: catering.id_catering,
                        id_menu: menuId
                    })
                );
                await Promise.all(menuPromises);
            }
        }

        // Obtener el catering actualizado con sus menús
        const cateringActualizado = await CateringServicio.findByPk(id_catering, {
            include: [
                {
                    model: MenuCatering,
                    as: 'menu_catering'
                }
            ]
        });

        res.json(cateringActualizado);
    } catch (error) {
        console.error('Error al editar servicio de catering:', error);
        res.status(500).json({ error: 'Error al editar servicio de catering' });
    }
};

export const deleteCatering = async (req: Request, res: Response) => {
    try {
        const { id_catering } = req.params;
        const catering = await CateringServicio.findByPk(id_catering);
        
        if (!catering) {
            return res.status(404).json({ error: 'Servicio de catering no encontrado' });
        }

        // Borrado lógico - marcar como eliminado
        await catering.update({
            estado: 'Eliminado'
        });

        res.json({ message: 'Servicio de catering eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar servicio de catering:', error);
        res.status(500).json({ error: 'Error al eliminar servicio de catering' });
    }
};
