"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePlato = exports.getPlatoById = exports.getAllPlatos = exports.createPlato = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../database/database");
const Plato_model_1 = __importDefault(require("../models/Plato_model"));
const PlatoMenu_model_1 = __importDefault(require("../models/PlatoMenu_model"));
const Menu_model_1 = __importDefault(require("../models/Menu_model"));
const createPlato = async (req, res) => {
    const t = await database_1.sequelize.transaction();
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
        const plato = await Plato_model_1.default.create({
            desc_plato
        }, { transaction: t });
        // Procesar menús
        if (menus && menus.length > 0) {
            const menusExistentes = await Menu_model_1.default.count({
                where: {
                    id_menu: { [sequelize_1.Op.in]: menus },
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
            await Promise.all(menus.map((menuId) => PlatoMenu_model_1.default.create({
                id_plato: plato.id_plato,
                id_menu: menuId
            }, { transaction: t })));
        }
        await t.commit();
        // Obtener plato completo
        const platoCompleto = await Plato_model_1.default.findByPk(plato.id_plato, {
            include: [
                {
                    model: PlatoMenu_model_1.default,
                    as: 'platos_menu',
                    include: [{ model: Menu_model_1.default, as: 'menu' }]
                }
            ]
        });
        res.status(201).json({
            success: true,
            data: platoCompleto
        });
    }
    catch (error) {
        await t.rollback();
        console.error('Error en createPlato:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.createPlato = createPlato;
const getAllPlatos = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const where = {};
        if (search) {
            where.desc_plato = {
                [sequelize_1.Op.iLike]: `%${search}%`
            };
        }
        const { count, rows } = await Plato_model_1.default.findAndCountAll({
            where,
            offset,
            limit: Number(limit),
            include: [
                {
                    model: PlatoMenu_model_1.default,
                    as: 'platos_menu',
                    include: [{ model: Menu_model_1.default, as: 'menu' }]
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
    }
    catch (error) {
        console.error('Error en getAllPlatos:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.getAllPlatos = getAllPlatos;
// Obtener un plato por ID
const getPlatoById = async (req, res) => {
    const { id } = req.params;
    try {
        const plato = await Plato_model_1.default.findByPk(id, {
            include: [
                {
                    model: PlatoMenu_model_1.default,
                    as: 'platos_menu',
                    include: [{ model: Menu_model_1.default, as: 'menu' }]
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
    }
    catch (error) {
        console.error('Error en getPlatoById:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.getPlatoById = getPlatoById;
// Editar un plato existente
const updatePlato = async (req, res) => {
    const { id } = req.params;
    const t = await database_1.sequelize.transaction();
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
        const plato = await Plato_model_1.default.findByPk(id, { transaction: t });
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
            const menusExistentes = await Menu_model_1.default.count({
                where: {
                    id_menu: { [sequelize_1.Op.in]: menus },
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
            await PlatoMenu_model_1.default.destroy({
                where: { id_plato: plato.id_plato },
                transaction: t
            });
            // Crear nuevas asociaciones
            await Promise.all(menus.map((menuId) => PlatoMenu_model_1.default.create({
                id_plato: plato.id_plato,
                id_menu: menuId
            }, { transaction: t })));
        }
        await t.commit();
        // Obtener plato actualizado con relaciones
        const platoCompleto = await Plato_model_1.default.findByPk(plato.id_plato, {
            include: [
                {
                    model: PlatoMenu_model_1.default,
                    as: 'platos_menu',
                    include: [{ model: Menu_model_1.default, as: 'menu' }]
                }
            ]
        });
        res.json({
            success: true,
            data: platoCompleto
        });
    }
    catch (error) {
        await t.rollback();
        console.error('Error en updatePlato:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            detalles: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};
exports.updatePlato = updatePlato;
