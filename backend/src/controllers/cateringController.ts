import { Request, Response } from 'express';
import CateringServicio from '../models/CateringServicio_model';
import Evento from '../models/Evento_model';
import MenuCatering from '../models/MenuCatering_model';
import Menu from '../models/Menu_model';
import PlatoMenu from '../models/PlatoMenu_model';
import Plato from '../models/Plato_model';
import Proveedor from '../models/Proveedor_model';
import { Op } from 'sequelize';

// Catering Controllers
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
            precioneto_catering: precioneto_catering || 0,
            itbis_catering: itbis_catering || 0,
            total_catering: total_catering || 0
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
                    as: 'menus_catering',
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
                    as: 'menus_catering',
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
                }
            ]
        });

        if (!caterings || caterings.length === 0) {
            return res.status(404).json({ 
                error: 'No se encontraron servicios de catering',
                mensaje: 'No hay servicios de catering registrados'
            });
        }

        res.json(caterings);
    } catch (error) {
        console.error('Error al obtener servicios de catering:', error);
        res.status(500).json({ 
            error: 'Error al obtener los servicios de catering',
            mensaje: 'Ocurrió un error al cargar los servicios de catering'
        });
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
                    as: 'menus_catering',
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
                    as: 'menus_catering',
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

// Menu Controllers
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
        });

        if (!menus || menus.length === 0) {
            return res.status(404).json({ 
                error: 'No se encontraron menús',
                mensaje: 'No hay menús registrados'
            });
        }

        res.json(menus);
    } catch (error) {
        console.error('Error al obtener menús:', error);
        res.status(500).json({ 
            error: 'Error al obtener los menús',
            mensaje: 'Ocurrió un error al cargar los menús'
        });
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
                    attributes: ['id_menu', 'desc_menu', 'precio_menu', 'id_proveedor'],
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

// MenuCatering Controllers
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
        res.json(menus);
    } catch (error) {
        console.error('Error al obtener menús del catering:', error);
        res.status(500).json({ error: 'Error al obtener menús del catering' });
    }
};

export const getMenuCatalog = async (req: Request, res: Response) => {
    try {
        const menus = await Menu.findAll({
            attributes: ['id_menu', 'desc_menu', 'precio_menu'],
            include: [
                {
                    model: PlatoMenu,
                    as: 'platos_menu',
                    include: [
                        {
                            model: Plato,
                            as: 'plato',
                            attributes: ['id_plato', 'desc_plato']
                        }
                    ]
                },
                {
                    model: Proveedor,
                    as: 'proveedor',
                    attributes: ['id_proveedor', 'nombre_proveedor']
                }
            ]
        });

        const menuCatalog = menus.map(menu => ({
            id_menu: menu.id_menu,
            desc_menu: menu.desc_menu,
            precio_menu: parseFloat(menu.precio_menu.toString()),
            proveedor: menu.proveedor?.nombre_proveedor || 'Sin proveedor',
            platos: menu.platos_menu?.map(pm => ({
                id: pm.plato?.id_plato,
                nombre: pm.plato?.desc_plato
            })) || []
        }));

        res.json(menuCatalog);
    } catch (error) {
        console.error('Error al obtener catálogo de menús:', error);
        res.status(500).json({ 
            error: 'Error al obtener catálogo de menús',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// Plato Controllers
export const getAllPlatos = async (req: Request, res: Response) => {
    try {
        const platos = await Plato.findAll();

        if (!platos || platos.length === 0) {
            return res.status(404).json({ 
                error: 'No se encontraron platos',
                mensaje: 'No hay platos registrados'
            });
        }

        res.json(platos);
    } catch (error) {
        console.error('Error al obtener platos:', error);
        res.status(500).json({ 
            error: 'Error al obtener los platos',
            mensaje: 'Ocurrió un error al cargar los platos'
        });
    }
};

export const getPlatoById = async (req: Request, res: Response) => {
    try {
        const plato = await Plato.findByPk(req.params.id);
        if (!plato) {
            return res.status(404).json({ message: 'Plato no encontrado' });
        }
        res.json(plato);
    } catch (error) {
        console.error('Error al obtener plato:', error);
        res.status(500).json({ message: 'Error al obtener plato' });
    }
};

export const createPlato = async (req: Request, res: Response) => {
    try {
        const plato = await Plato.create(req.body);
        res.status(201).json(plato);
    } catch (error) {
        console.error('Error al crear plato:', error);
        res.status(500).json({ message: 'Error al crear plato' });
    }
};

export const updatePlato = async (req: Request, res: Response) => {
    try {
        const plato = await Plato.findByPk(req.params.id);
        if (!plato) {
            return res.status(404).json({ message: 'Plato no encontrado' });
        }
        await plato.update(req.body);
        res.json(plato);
    } catch (error) {
        console.error('Error al actualizar plato:', error);
        res.status(500).json({ message: 'Error al actualizar plato' });
    }
};

export const deletePlato = async (req: Request, res: Response) => {
    try {
        const plato = await Plato.findByPk(req.params.id);
        if (!plato) {
            return res.status(404).json({ message: 'Plato no encontrado' });
        }
        await plato.destroy();
        res.json({ message: 'Plato eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar plato:', error);
        res.status(500).json({ message: 'Error al eliminar plato' });
    }
};
