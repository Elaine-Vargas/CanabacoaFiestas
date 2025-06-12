import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { sequelize } from '../database/database';
import Plato from '../models/Plato_model';
import PlatoMenu from '../models/PlatoMenu_model';
import Menu from '../models/Menu_model';

export const createPlato = async (req: Request, res: Response) => {
    const t = await sequelize.transaction();
    try {
        const { desc_plato, menus } = req.body;

        // Validaciones
        if (!desc_plato || desc_plato.trim().length === 0) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                error: 'Datos inválidos',
                mensaje: 'La descripción del plato es requerida'
            });
        }

        // Crear plato
        const plato = await Plato.create({
            desc_plato
        }, { transaction: t });

        // Procesar menús
        if (menus && menus.length > 0) {
            const menusExistentes = await Menu.count({
                where: { 
                    id_menu: { [Op.in]: menus },
                    estado_menu: 'Activo'
                },
                transaction: t
            });

            if (menusExistentes !== menus.length) {
                await t.rollback();
                return res.status(404).json({
                    success: false,
                    error: 'Menús no encontrados',
                    mensaje: 'Uno o más menús no existen o no están activos'
                });
            }

            await Promise.all(menus.map((menuId: number) => 
                PlatoMenu.create({
                    id_plato: plato.id_plato,
                    id_menu: menuId
                }, { transaction: t })
            ));
        }

        await t.commit();
        
        // Obtener plato completo
        const platoCompleto = await Plato.findByPk(plato.id_plato, {
            include: [
                { 
                    model: PlatoMenu, 
                    as: 'platos_menu',
                    include: [{ model: Menu, as: 'menu' }]
                }
            ]
        });

        res.status(201).json({
            success: true,
            data: platoCompleto
        });
    } catch (error) {
        await t.rollback();
        console.error('Error en createPlato:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error interno del servidor'
        });
    }
};

export const getAllPlatos = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        
        const where: any = {};
        if (search) {
            where.desc_plato = {
                [Op.iLike]: `%${search}%`
            };
        }

        const { count, rows } = await Plato.findAndCountAll({
            where,
            offset,
            limit: Number(limit),
            include: [
                { 
                    model: PlatoMenu, 
                    as: 'platos_menu',
                    include: [{ model: Menu, as: 'menu' }]
                }
            ],
            order: [['desc_plato', 'ASC']]
        });

        res.json({
            success: true,
            total: count,
            page: Number(page),
            pages: Math.ceil(count / Number(limit)),
            data: rows
        });
    } catch (error) {
        console.error('Error en getAllPlatos:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error interno del servidor'
        });
    }
};

// Obtener un plato por ID
export const getPlatoById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const plato = await Plato.findByPk(id, {
            include: [
                { 
                    model: PlatoMenu, 
                    as: 'platos_menu',
                    include: [{ model: Menu, as: 'menu' }]
                }
            ]
        });

        if (!plato) {
            return res.status(404).json({
                success: false,
                error: 'Plato no encontrado'
            });
        }

        res.json({
            success: true,
            data: plato
        });
    } catch (error) {
        console.error('Error en getPlatoById:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error interno del servidor'
        });
    }
};

// Editar un plato existente
export const updatePlato = async (req: Request, res: Response) => {
    const { id } = req.params;
    const t = await sequelize.transaction();
    try {
        const { desc_plato, menus } = req.body;

        // Validaciones
        if (!desc_plato || desc_plato.trim().length === 0) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                error: 'Datos inválidos',
                mensaje: 'La descripción del plato es requerida'
            });
        }

        // Buscar plato a actualizar
        const plato = await Plato.findByPk(id, { transaction: t });
        if (!plato) {
            await t.rollback();
            return res.status(404).json({
                error: 'Plato no encontrado'
            });
        }

        // Actualizar campos
        plato.desc_plato = desc_plato;
        await plato.save({ transaction: t });

        // Actualizar menús si se envían
        if (menus) {
            // Validar todos los menús
            const menusExistentes = await Menu.count({
                where: { 
                    id_menu: { [Op.in]: menus },
                    estado_menu: 'Activo'
                },
                transaction: t
            });

            if (menusExistentes !== menus.length) {
                await t.rollback();
                return res.status(404).json({
                    success: false,
                    error: 'Menús no encontrados',
                    mensaje: 'Uno o más menús no existen o no están activos'
                });
            }

            // Eliminar asociaciones anteriores (lógicamente)
            await PlatoMenu.destroy({
                where: { id_plato: plato.id_plato },
                transaction: t
            });

            // Crear nuevas asociaciones
            await Promise.all(menus.map((menuId: number) =>
                PlatoMenu.create({
                    id_plato: plato.id_plato,
                    id_menu: menuId
                }, { transaction: t })
            ));
        }

        await t.commit();

        // Obtener plato actualizado con relaciones
        const platoCompleto = await Plato.findByPk(plato.id_plato, {
            include: [
                { 
                    model: PlatoMenu, 
                    as: 'platos_menu',
                    include: [{ model: Menu, as: 'menu' }]
                }
            ]
        });

        res.json({
            success: true,
            data: platoCompleto
        });

    } catch (error) {
        await t.rollback();
        console.error('Error en updatePlato:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            detalles: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
