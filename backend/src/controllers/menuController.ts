import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { sequelize } from '../database/database';
import Menu from '../models/Menu_model';
import Proveedor from '../models/Proveedor_model';
import PlatoMenu from '../models/PlatoMenu_model';
import Plato from '../models/Plato_model';

export const createMenu = async (req: Request, res: Response) => {
    const t = await sequelize.transaction();
    try {
        const { desc_menu, precio_menu, id_proveedor, platos } = req.body;

        // Validaciones
        if (!desc_menu || !precio_menu || precio_menu <= 0 || !id_proveedor) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                error: 'Datos inválidos',
                mensaje: 'Descripción, precio (positivo) y proveedor son requeridos'
            });
        }

        // Verificar proveedor
        const proveedor = await Proveedor.findByPk(id_proveedor, { transaction: t });
        if (!proveedor || proveedor.estado_proveedor !== 'Activo') {
            await t.rollback();
            return res.status(404).json({ 
                success: false,
                error: 'Proveedor no disponible',
                mensaje: 'El proveedor no existe o no está activo'
            });
        }

        // Crear menú
        const menu = await Menu.create({
            desc_menu,
            precio_menu,
            id_proveedor,
            estado_menu: 'Activo'
        }, { transaction: t });

        // Procesar platos
        if (platos && platos.length > 0) {
            const platosExistentes = await Plato.count({
                where: { id_plato: { [Op.in]: platos } },
                transaction: t
            });

            if (platosExistentes !== platos.length) {
                await t.rollback();
                return res.status(404).json({
                    success: false,
                    error: 'Platos no encontrados',
                    mensaje: 'Uno o más platos no existen'
                });
            }

            await Promise.all(platos.map((platoId: number) => 
                PlatoMenu.create({
                    id_menu: menu.id_menu,
                    id_plato: platoId
                }, { transaction: t })
            ));
        }

        await t.commit();
        
        // Obtener menú completo
        const menuCompleto = await Menu.findByPk(menu.id_menu, {
            include: [
                { model: Proveedor, as: 'proveedor' },
                { 
                    model: PlatoMenu, 
                    as: 'platos_menu',
                    include: [{ model: Plato, as: 'plato' }]
                }
            ]
        });

        res.status(201).json({
            success: true,
            data: menuCompleto
        });
    } catch (error) {
        await t.rollback();
        console.error('Error en createMenu:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error interno del servidor'
        });
    }
};

export const getMenuCatalog = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, id_proveedor } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        
        const where: any = { estado_menu: 'Activo' };
        if (id_proveedor) where.id_proveedor = id_proveedor;

        const { count, rows } = await Menu.findAndCountAll({
            where,
            offset,
            limit: Number(limit),
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
            ],
            order: [['desc_menu', 'ASC']]
        });

        const catalog = rows.map(menu => ({
            id_menu: menu.id_menu,
            desc_menu: menu.desc_menu,
            precio_menu: parseFloat(menu.precio_menu.toString()),
            proveedor: {
                id: menu.proveedor?.id_proveedor,
                nombre: menu.proveedor?.nombre_proveedor
            },
            platos: menu.platos_menu?.map(pm => ({
                id: pm.plato?.id_plato,
                nombre: pm.plato?.desc_plato
            })) || []
        }));

        res.json({
            success: true,
            total: count,
            page: Number(page),
            pages: Math.ceil(count / Number(limit)),
            data: catalog
        });
    } catch (error) {
        console.error('Error en getMenuCatalog:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error interno del servidor'
        });
    }
};

// Obtener un menú por ID
export const getMenuById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const menu = await Menu.findByPk(id, {
            include: [
                { model: Proveedor, as: 'proveedor' },
                { 
                    model: PlatoMenu, 
                    as: 'platos_menu',
                    include: [{ model: Plato, as: 'plato' }]
                }
            ]
        });

        if (!menu) {
            return res.status(404).json({
                success: false,
                error: 'Menú no encontrado'
            });
        }

        res.json({
            success: true,
            data: menu
        });
    } catch (error) {
        console.error('Error en getMenuById:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error interno del servidor'
        });
    }
};

// Eliminar lógicamente un menú
export const deleteMenu = async (req: Request, res: Response) => {
    const { id } = req.params;
    const t = await sequelize.transaction();
    try {
        const menu = await Menu.findByPk(id);
        if (!menu) {
            return res.status(404).json({
                success: false,
                error: 'Menú no encontrado'
            });
        }

        // Actualizar el estado a 'Inactivo'
        menu.estado_menu = 'Inactivo';
        await menu.save({ transaction: t });

        await t.commit();
        res.json({
            success: true,
            mensaje: 'Menú eliminado lógicamente'
        });
    } catch (error) {
        await t.rollback();
        console.error('Error en deleteMenu:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error interno del servidor'
        });
    }
};

// Editar un menú existente
export const updateMenu = async (req: Request, res: Response) => {
    const { id } = req.params;
    const t = await sequelize.transaction();
    try {
        const { desc_menu, precio_menu, id_proveedor, platos } = req.body;

        // Validaciones
        if (!desc_menu || !precio_menu || precio_menu <= 0 || !id_proveedor) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                error: 'Datos inválidos',
                mensaje: 'Descripción, precio (positivo) y proveedor son requeridos'
            });
        }

        // Verificar proveedor
        const proveedor = await Proveedor.findByPk(id_proveedor, { transaction: t });
        if (!proveedor || proveedor.estado_proveedor !== 'Activo') {
            await t.rollback();
            return res.status(404).json({ 
                success: false,
                error: 'Proveedor no disponible',
                mensaje: 'El proveedor no existe o no está activo'
            });
        }

        // Buscar menú a actualizar
        const menu = await Menu.findByPk(id, { transaction: t });
        if (!menu) {
            await t.rollback();
            return res.status(404).json({
                error: 'Menú no encontrado'
            });
        }

        // Actualizar campos
        menu.desc_menu = desc_menu;
        menu.precio_menu = precio_menu;
        menu.id_proveedor = id_proveedor;

        await menu.save({ transaction: t });

        // Actualizar platos si se envían
        if (platos) {
            // Validar todos los platos
            const platosExistentes = await Plato.count({
                where: { id_plato: { [Op.in]: platos } },
                transaction: t
            });

            if (platosExistentes !== platos.length) {
                await t.rollback();
                return res.status(404).json({
                    success: false,
                    error: 'Platos no encontrados',
                    mensaje: 'Uno o más platos no existen'
                });
            }

            // Eliminar asociaciones anteriores (lógicamente)
            await PlatoMenu.destroy({
                where: { id_menu: menu.id_menu },
                transaction: t
            });

            // Crear nuevas asociaciones
            await Promise.all(platos.map((platoId: number) =>
                PlatoMenu.create({
                    id_menu: menu.id_menu,
                    id_plato: platoId
                }, { transaction: t })
            ));
        }

        await t.commit();

        // Obtener menú actualizado con relaciones
        const menuCompleto = await Menu.findByPk(menu.id_menu, {
            include: [
                { model: Proveedor, as: 'proveedor' },
                { 
                    model: PlatoMenu, 
                    as: 'platos_menu',
                    include: [{ model: Plato, as: 'plato' }]
                }
            ]
        });

        res.json({
            success: true,
            data: menuCompleto
        });

    } catch (error) {
        await t.rollback();
        console.error('Error en updateMenu:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            detalles: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
