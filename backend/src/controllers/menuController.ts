import { Request, Response } from 'express';
import Menu from '../models/Menu_model';
import MenuCatering from '../models/MenuCatering_model';
import Proveedor from '../models/Proveedor_model';
import PlatoMenu from '../models/PlatoMenu_model';
import Plato from '../models/Plato_model';
import { Op } from 'sequelize';

// Controladores para Menu
export const createMenu = async (req: Request, res: Response) => {
    try {
        const {
            desc_menu,
            precio_menu,
            id_proveedor,
            platos // Array de IDs de platos
        } = req.body;

        // Verificar que el proveedor existe
        const proveedor = await Proveedor.findByPk(id_proveedor);
        if (!proveedor) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }

        // Crear el menú
        const menu = await Menu.create({
            desc_menu,
            precio_menu,
            id_proveedor
        });

        // Si se proporcionaron platos, crearlos
        if (platos && platos.length > 0) {
            const platoPromises = platos.map((platoId: number) => 
                PlatoMenu.create({
                    id_menu: menu.id_menu,
                    id_plato: platoId
                })
            );
            await Promise.all(platoPromises);
        }

        // Obtener el menú con sus platos
        const menuConPlatos = await Menu.findByPk(menu.id_menu, {
            include: [
                {
                    model: PlatoMenu,
                    as: 'platos_menu'
                }
            ]
        });

        res.status(201).json(menuConPlatos);
    } catch (error) {
        console.error('Error al crear menú:', error);
        res.status(500).json({ error: 'Error al crear menú' });
    }
};

export const getAllMenus = async (req: Request, res: Response) => {
    try {
        const menus = await Menu.findAll({
            include: [
                {
                    model: PlatoMenu,
                    as: 'platos_menu'
                },
                {
                    model: Proveedor,
                    as: 'proveedor'
                }
            ]
        });
        res.json(menus);
    } catch (error) {
        console.error('Error al obtener menús:', error);
        res.status(500).json({ error: 'Error al obtener menús' });
    }
};

export const getMenuById = async (req: Request, res: Response) => {
    try {
        const { id_menu } = req.params;
        const menu = await Menu.findByPk(id_menu, {
            include: [
                {
                    model: PlatoMenu,
                    as: 'platos_menu'
                },
                {
                    model: Proveedor,
                    as: 'proveedor'
                }
            ]
        });

        if (!menu) {
            return res.status(404).json({ error: 'Menú no encontrado' });
        }

        res.json(menu);
    } catch (error) {
        console.error('Error al obtener menú:', error);
        res.status(500).json({ error: 'Error al obtener menú' });
    }
};

export const editMenu = async (req: Request, res: Response) => {
    try {
        const { id_menu } = req.params;
        const {
            desc_menu,
            precio_menu,
            id_proveedor,
            platos // Array de IDs de platos
        } = req.body;

        const menu = await Menu.findByPk(id_menu);
        if (!menu) {
            return res.status(404).json({ error: 'Menú no encontrado' });
        }

        // Verificar que el proveedor existe si se está actualizando
        if (id_proveedor) {
            const proveedor = await Proveedor.findByPk(id_proveedor);
            if (!proveedor) {
                return res.status(404).json({ error: 'Proveedor no encontrado' });
            }
        }

        // Actualizar el menú
        await menu.update({
            desc_menu: desc_menu || menu.desc_menu,
            precio_menu: precio_menu || menu.precio_menu,
            id_proveedor: id_proveedor || menu.id_proveedor
        });

        // Si se proporcionaron nuevos platos, actualizar la lista
        if (platos) {
            // Eliminar platos existentes
            await PlatoMenu.destroy({
                where: { id_menu: id_menu }
            });

            // Crear nuevos platos
            if (platos.length > 0) {
                const platoPromises = platos.map((platoId: number) => 
                    PlatoMenu.create({
                        id_menu: menu.id_menu,
                        id_plato: platoId
                    })
                );
                await Promise.all(platoPromises);
            }
        }

        // Obtener el menú actualizado con sus platos
        const menuActualizado = await Menu.findByPk(id_menu, {
            include: [
                {
                    model: PlatoMenu,
                    as: 'platos_menu'
                },
                {
                    model: Proveedor,
                    as: 'proveedor'
                }
            ]
        });

        res.json(menuActualizado);
    } catch (error) {
        console.error('Error al editar menú:', error);
        res.status(500).json({ error: 'Error al editar menú' });
    }
};

export const deleteMenu = async (req: Request, res: Response) => {
    try {
        const { id_menu } = req.params;
        const menu = await Menu.findByPk(id_menu);
        
        if (!menu) {
            return res.status(404).json({ error: 'Menú no encontrado' });
        }

        // Borrado lógico - marcar como eliminado
        await menu.update({
            estado: 'Eliminado'
        });

        res.json({ message: 'Menú eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar menú:', error);
        res.status(500).json({ error: 'Error al eliminar menú' });
    }
};

// Controladores para MenuCatering
export const addMenuToCatering = async (req: Request, res: Response) => {
    try {
        const { id_catering, id_menu } = req.body;

        // Verificar que el menú existe
        const menu = await Menu.findByPk(id_menu);
        if (!menu) {
            return res.status(404).json({ error: 'Menú no encontrado' });
        }

        // Crear la relación
        const menuCatering = await MenuCatering.create({
            id_catering,
            id_menu
        });

        res.status(201).json(menuCatering);
    } catch (error) {
        console.error('Error al agregar menú al catering:', error);
        res.status(500).json({ error: 'Error al agregar menú al catering' });
    }
};

export const removeMenuFromCatering = async (req: Request, res: Response) => {
    try {
        const { id_catering, id_menu } = req.params;

        const menuCatering = await MenuCatering.findOne({
            where: {
                id_catering,
                id_menu
            }
        });

        if (!menuCatering) {
            return res.status(404).json({ error: 'Relación menú-catering no encontrada' });
        }

        await menuCatering.destroy();
        res.json({ message: 'Menú removido del catering correctamente' });
    } catch (error) {
        console.error('Error al remover menú del catering:', error);
        res.status(500).json({ error: 'Error al remover menú del catering' });
    }
};

export const getMenusByCatering = async (req: Request, res: Response) => {
    try {
        const { id_catering } = req.params;
        const menus = await MenuCatering.findAll({
            where: { id_catering },
            include: [
                {
                    model: Menu,
                    as: 'menu'
                }
            ]
        });
        res.json(menus);
    } catch (error) {
        console.error('Error al obtener menús del catering:', error);
        res.status(500).json({ error: 'Error al obtener menús del catering' });
    }
};

export const getMenuByCatering = async (req: Request, res: Response) => {
    try {
        const { id_catering } = req.params;
        
        // Obtener los menús asociados al catering
        const menuCaterings = await MenuCatering.findAll({
            where: { id_catering },
            include: [
                {
                    model: Menu,
                    as: 'menu',
                    include: [
                        {
                            model: PlatoMenu,
                            as: 'platos_menu',
                            include: [
                                {
                                    model: Plato,
                                    as: 'plato'
                                }
                            ]
                        },
                        {
                            model: Proveedor,
                            as: 'proveedor'
                        }
                    ]
                }
            ]
        });

        if (!menuCaterings || menuCaterings.length === 0) {
            return res.status(404).json({ error: 'No se encontraron menús para este catering' });
        }

        res.json(menuCaterings);
    } catch (error) {
        console.error('Error al obtener menús del catering:', error);
        res.status(500).json({ error: 'Error al obtener menús del catering' });
    }
};
