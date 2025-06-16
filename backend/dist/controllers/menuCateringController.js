"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMenusByCateringId = exports.updateMenuCatering = exports.removeMenuFromCatering = exports.addMenuToCatering = void 0;
const database_1 = require("../database/database");
const MenuCatering_model_1 = __importDefault(require("../models/MenuCatering_model"));
const CateringServicio_model_1 = __importDefault(require("../models/CateringServicio_model"));
const Menu_model_1 = __importDefault(require("../models/Menu_model"));
// Añadir un menú a un catering
const addMenuToCatering = async (req, res) => {
    const t = await database_1.sequelize.transaction();
    try {
        const { id_catering, id_menu, personas_menucatering } = req.body;
        // Validaciones
        if (!id_catering || !id_menu || !personas_menucatering) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                error: 'Datos inválidos',
                mensaje: 'ID de catering, ID de menú y personas_menucatering son requeridos'
            });
        }
        // Verificar catering
        const catering = await CateringServicio_model_1.default.findByPk(id_catering, { transaction: t });
        if (!catering || catering.estado_catering === 'Cancelado') {
            await t.rollback();
            return res.status(404).json({
                success: false,
                error: 'Catering no disponible',
                mensaje: 'El servicio de catering no existe o ha sido cancelado'
            });
        }
        // Verificar menú
        const menu = await Menu_model_1.default.findByPk(id_menu, { transaction: t });
        if (!menu || menu.estado_menu !== 'Activo') {
            await t.rollback();
            return res.status(404).json({
                success: false,
                error: 'Menú no disponible',
                mensaje: 'El menú no existe o no está activo'
            });
        }
        // Verificar si ya existe la relación
        const existeRelacion = await MenuCatering_model_1.default.findOne({
            where: {
                id_catering,
                id_menu,
                estado_menucatering: 'Aceptado'
            },
            transaction: t
        });
        if (existeRelacion) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                error: 'Relación existente',
                mensaje: 'Este menú ya está asignado al catering'
            });
        }
        // Crear relación
        const menuCatering = await MenuCatering_model_1.default.create({
            id_catering,
            id_menu,
            personas_menucatering,
            estado_menucatering: 'Aceptado'
        }, { transaction: t });
        await t.commit();
        res.status(201).json({
            success: true,
            data: {
                ...menuCatering.toJSON(),
                menu: menu
            }
        });
    }
    catch (error) {
        await t.rollback();
        console.error('Error en addMenuToCatering:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.addMenuToCatering = addMenuToCatering;
// Remover un menú de un catering
const removeMenuFromCatering = async (req, res) => {
    const t = await database_1.sequelize.transaction();
    try {
        const { id_catering, id_menu } = req.params;
        // Verificar relación existente
        const menuCatering = await MenuCatering_model_1.default.findOne({
            where: {
                id_catering: Number(id_catering),
                id_menu: Number(id_menu),
                estado_menucatering: 'Aceptado'
            },
            transaction: t
        });
        if (!menuCatering) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                error: 'Relación no encontrada',
                mensaje: 'No se encontró el menú asignado a este catering'
            });
        }
        // Actualizar estado (borrado lógico)
        await menuCatering.update({
            estado_menucatering: 'Cancelado'
        }, { transaction: t });
        await t.commit();
        res.json({
            success: true,
            data: {
                mensaje: 'Menú removido del catering correctamente'
            }
        });
    }
    catch (error) {
        await t.rollback();
        console.error('Error en removeMenuFromCatering:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.removeMenuFromCatering = removeMenuFromCatering;
// Actualizar la relación entre un menú y un catering
const updateMenuCatering = async (req, res) => {
    const t = await database_1.sequelize.transaction();
    try {
        const { id_catering, id_menu } = req.params;
        const { nuevo_estado } = req.body; // Se puede cambiar el estado de la relación
        // Validaciones
        if (!nuevo_estado) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                error: 'Datos inválidos',
                mensaje: 'El nuevo estado es requerido'
            });
        }
        // Verificar relación existente
        const menuCatering = await MenuCatering_model_1.default.findOne({
            where: {
                id_catering: Number(id_catering),
                id_menu: Number(id_menu),
                estado_menucatering: 'Aceptado'
            },
            transaction: t
        });
        if (!menuCatering) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                error: 'Relación no encontrada',
                mensaje: 'No se encontró el menú asignado a este catering'
            });
        }
        // Actualizar estado
        await menuCatering.update({
            estado_menucatering: nuevo_estado
        }, { transaction: t });
        await t.commit();
        res.json({
            success: true,
            data: {
                mensaje: 'Estado de la relación actualizado correctamente'
            }
        });
    }
    catch (error) {
        await t.rollback();
        console.error('Error en updateMenuCatering:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.updateMenuCatering = updateMenuCatering;
// Obtener todos los menús asignados a un catering
const getMenusByCateringId = async (req, res) => {
    const { id_catering } = req.params;
    try {
        const menusCatering = await MenuCatering_model_1.default.findAll({
            where: {
                id_catering: Number(id_catering),
                estado_menucatering: 'Aceptado'
            },
            include: [
                {
                    model: Menu_model_1.default,
                    as: 'menu'
                }
            ]
        });
        if (menusCatering.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No se encontraron menús',
                mensaje: 'No hay menús asignados a este catering'
            });
        }
        res.json({
            success: true,
            data: menusCatering
        });
    }
    catch (error) {
        console.error('Error en getMenusByCateringId:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};
exports.getMenusByCateringId = getMenusByCateringId;
