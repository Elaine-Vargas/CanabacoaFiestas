"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDetalleCompra = exports.createDetalleCompra = exports.deleteCompra = exports.editCompra = exports.getComprasByElemento = exports.getDetallesByCompra = exports.getCompras = exports.createCompra = void 0;
const Compra_model_1 = __importDefault(require("../models/Compra_model"));
const DetalleCompra_model_1 = __importDefault(require("../models/DetalleCompra_model"));
const Proveedor_model_1 = __importDefault(require("../models/Proveedor_model"));
const Elemento_model_1 = __importDefault(require("../models/Elemento_model"));
const sequelize_1 = require("sequelize");
const database_1 = require("../database/database");
// Crear una nueva compra con sus detalles
const createCompra = async (req, res) => {
    const t = await database_1.sequelize.transaction();
    try {
        const { id_proveedor, detalles, // Array de detalles de compra
        costo_compra, estado_compra = 'Completada' // Estado por defecto
         } = req.body;
        // Verificar que el proveedor existe
        const proveedor = await Proveedor_model_1.default.findByPk(id_proveedor);
        if (!proveedor) {
            await t.rollback();
            return res.status(404).json({
                error: 'Proveedor no encontrado',
                mensaje: 'El proveedor especificado no existe en el sistema'
            });
        }
        // Crear la compra
        const compra = await Compra_model_1.default.create({
            id_proveedor,
            fecha_compra: new Date(),
            hora_compra: new Date().toTimeString().split(' ')[0],
            costo_compra,
            estado_compra
        }, { transaction: t });
        // Crear los detalles de compra
        if (detalles && detalles.length > 0) {
            // Validar que todos los elementos existen
            for (const detalle of detalles) {
                const elemento = await Elemento_model_1.default.findByPk(detalle.id_elemento);
                if (!elemento) {
                    await t.rollback();
                    return res.status(404).json({
                        error: 'Elemento no encontrado',
                        mensaje: `El elemento con ID ${detalle.id_elemento} no existe en el sistema`
                    });
                }
            }
            const detallesPromises = detalles.map((detalle) => DetalleCompra_model_1.default.create({
                id_compra: compra.id_compra,
                id_elemento: detalle.id_elemento,
                cantidad_compra: detalle.cantidad_compra,
                precio_unitario: detalle.precio_unitario,
                precio_total: detalle.precio_unitario * detalle.cantidad_compra
            }, { transaction: t }));
            await Promise.all(detallesPromises);
        }
        await t.commit();
        // Obtener la compra con sus detalles
        const compraCompleta = await Compra_model_1.default.findByPk(compra.id_compra, {
            include: [
                {
                    model: DetalleCompra_model_1.default,
                    include: [
                        {
                            model: Elemento_model_1.default
                        }
                    ]
                },
                {
                    model: Proveedor_model_1.default
                }
            ]
        });
        res.status(201).json(compraCompleta);
    }
    catch (error) {
        await t.rollback();
        console.error('Error al crear compra:', error);
        res.status(500).json({
            error: 'Error al crear compra',
            mensaje: 'Ocurrió un error al procesar la compra'
        });
    }
};
exports.createCompra = createCompra;
// Obtener todas las compras
const getCompras = async (req, res) => {
    try {
        const compras = await Compra_model_1.default.findAll({
            where: {
                estado_compra: {
                    [sequelize_1.Op.ne]: 'Cancelada'
                }
            },
            include: [
                {
                    model: DetalleCompra_model_1.default,
                    include: [
                        {
                            model: Elemento_model_1.default
                        }
                    ]
                },
                {
                    model: Proveedor_model_1.default
                }
            ],
            order: [['fecha_compra', 'DESC'], ['hora_compra', 'DESC']]
        });
        if (!compras || compras.length === 0) {
            return res.status(404).json({
                error: 'No se encontraron compras',
                mensaje: 'No hay compras registradas en el sistema'
            });
        }
        res.json(compras);
    }
    catch (error) {
        console.error('Error al obtener compras:', error);
        res.status(500).json({
            error: 'Error al obtener las compras',
            mensaje: 'Ocurrió un error al cargar las compras'
        });
    }
};
exports.getCompras = getCompras;
// Obtener detalles de una compra específica
const getDetallesByCompra = async (req, res) => {
    try {
        const { id_compra } = req.params;
        const detalles = await DetalleCompra_model_1.default.findAll({
            where: { id_compra },
            include: [
                {
                    model: Elemento_model_1.default
                }
            ]
        });
        if (!detalles || detalles.length === 0) {
            return res.status(404).json({
                error: 'No se encontraron detalles',
                mensaje: 'No hay detalles registrados para esta compra'
            });
        }
        res.json(detalles);
    }
    catch (error) {
        console.error('Error al obtener detalles de la compra:', error);
        res.status(500).json({
            error: 'Error al obtener los detalles de la compra',
            mensaje: 'Ocurrió un error al cargar los detalles de la compra'
        });
    }
};
exports.getDetallesByCompra = getDetallesByCompra;
// Obtener compras por elemento
const getComprasByElemento = async (req, res) => {
    try {
        const { id_elemento } = req.params;
        const detalles = await DetalleCompra_model_1.default.findAll({
            where: { id_elemento },
            include: [
                {
                    model: Compra_model_1.default,
                    where: {
                        estado_compra: {
                            [sequelize_1.Op.ne]: 'Cancelada'
                        }
                    },
                    include: [
                        {
                            model: Proveedor_model_1.default
                        }
                    ]
                },
                {
                    model: Elemento_model_1.default
                }
            ]
        });
        if (!detalles || detalles.length === 0) {
            return res.status(404).json({
                error: 'No se encontraron compras',
                mensaje: 'No hay compras registradas para este elemento'
            });
        }
        res.json(detalles);
    }
    catch (error) {
        console.error('Error al obtener compras del elemento:', error);
        res.status(500).json({
            error: 'Error al obtener las compras del elemento',
            mensaje: 'Ocurrió un error al cargar las compras del elemento'
        });
    }
};
exports.getComprasByElemento = getComprasByElemento;
// Editar una compra
const editCompra = async (req, res) => {
    try {
        const { id_compra } = req.params;
        const { id_proveedor, estado_compra, detalles // Array de detalles actualizados
         } = req.body;
        const compra = await Compra_model_1.default.findByPk(id_compra);
        if (!compra) {
            return res.status(404).json({ error: 'Compra no encontrada' });
        }
        // Verificar que el proveedor existe si se está actualizando
        if (id_proveedor) {
            const proveedor = await Proveedor_model_1.default.findByPk(id_proveedor);
            if (!proveedor) {
                return res.status(404).json({ error: 'Proveedor no encontrado' });
            }
        }
        // Actualizar la compra
        await compra.update({
            id_proveedor: id_proveedor || compra.id_proveedor,
            estado_compra: estado_compra || compra.estado_compra
        });
        // Si se proporcionaron nuevos detalles, actualizarlos
        if (detalles) {
            // Eliminar detalles existentes
            await DetalleCompra_model_1.default.destroy({
                where: { id_compra }
            });
            // Crear nuevos detalles
            if (detalles.length > 0) {
                const detallesPromises = detalles.map((detalle) => DetalleCompra_model_1.default.create({
                    id_compra,
                    id_elemento: detalle.id_elemento,
                    cantidad_compra: detalle.cantidad_compra,
                    precio_unitario: detalle.precio_unitario,
                    precio_total: detalle.precio_unitario * detalle.cantidad_compra
                }));
                await Promise.all(detallesPromises);
            }
        }
        // Obtener la compra actualizada con sus detalles
        const compraActualizada = await Compra_model_1.default.findByPk(id_compra, {
            include: [
                {
                    model: DetalleCompra_model_1.default,
                    include: [
                        {
                            model: Elemento_model_1.default
                        }
                    ]
                },
                {
                    model: Proveedor_model_1.default
                }
            ]
        });
        res.json(compraActualizada);
    }
    catch (error) {
        console.error('Error al editar compra:', error);
        res.status(500).json({ error: 'Error al editar compra' });
    }
};
exports.editCompra = editCompra;
// Eliminar lógicamente una compra
const deleteCompra = async (req, res) => {
    try {
        const { id_compra } = req.params;
        const compra = await Compra_model_1.default.findByPk(id_compra);
        if (!compra) {
            return res.status(404).json({ error: 'Compra no encontrada' });
        }
        await compra.update({
            estado_compra: 'Cancelada'
        });
        res.json({ message: 'Compra cancelada correctamente' });
    }
    catch (error) {
        console.error('Error al cancelar compra:', error);
        res.status(500).json({ error: 'Error al cancelar compra' });
    }
};
exports.deleteCompra = deleteCompra;
// Crear un detalle de compra individual
const createDetalleCompra = async (req, res) => {
    const t = await database_1.sequelize.transaction();
    try {
        const { id_compra, id_elemento, cantidad_compra, precio_unitario } = req.body;
        // Verificar que la compra existe
        const compra = await Compra_model_1.default.findByPk(id_compra);
        if (!compra) {
            await t.rollback();
            return res.status(404).json({
                error: 'Compra no encontrada',
                mensaje: 'La compra especificada no existe en el sistema'
            });
        }
        // Verificar que el elemento existe
        const elemento = await Elemento_model_1.default.findByPk(id_elemento);
        if (!elemento) {
            await t.rollback();
            return res.status(404).json({
                error: 'Elemento no encontrado',
                mensaje: 'El elemento especificado no existe en el sistema'
            });
        }
        // Validar cantidad y precio
        if (cantidad_compra <= 0) {
            await t.rollback();
            return res.status(400).json({
                error: 'Cantidad inválida',
                mensaje: 'La cantidad debe ser mayor que cero'
            });
        }
        if (precio_unitario <= 0) {
            await t.rollback();
            return res.status(400).json({
                error: 'Precio inválido',
                mensaje: 'El precio unitario debe ser mayor que cero'
            });
        }
        // Calcular el precio total
        const precio_total = precio_unitario * cantidad_compra;
        // Crear el detalle de compra
        const detalleCompra = await DetalleCompra_model_1.default.create({
            id_compra,
            id_elemento,
            cantidad_compra,
            precio_unitario,
            precio_total
        }, { transaction: t });
        // Actualizar el costo total de la compra
        const nuevoCosto = compra.costo_compra + precio_total;
        await compra.update({ costo_compra: nuevoCosto }, { transaction: t });
        await t.commit();
        // Obtener el detalle con sus relaciones
        const detalleCompleto = await DetalleCompra_model_1.default.findByPk(detalleCompra.id_detcompra, {
            include: [
                {
                    model: Elemento_model_1.default
                },
                {
                    model: Compra_model_1.default,
                    include: [
                        {
                            model: Proveedor_model_1.default
                        }
                    ]
                }
            ]
        });
        res.status(201).json(detalleCompleto);
    }
    catch (error) {
        await t.rollback();
        console.error('Error al crear detalle de compra:', error);
        res.status(500).json({
            error: 'Error al crear detalle de compra',
            mensaje: 'Ocurrió un error al procesar el detalle de compra'
        });
    }
};
exports.createDetalleCompra = createDetalleCompra;
// Eliminar lógicamente un detalle de compra
const deleteDetalleCompra = async (req, res) => {
    const t = await database_1.sequelize.transaction();
    try {
        const { id_detalle_compra } = req.params;
        const detalle = await DetalleCompra_model_1.default.findByPk(id_detalle_compra);
        if (!detalle) {
            await t.rollback();
            return res.status(404).json({
                error: 'Detalle de compra no encontrado',
                mensaje: 'El detalle de compra especificado no existe en el sistema'
            });
        }
        // Obtener la compra asociada
        const compra = await Compra_model_1.default.findByPk(detalle.id_compra);
        if (!compra) {
            await t.rollback();
            return res.status(404).json({
                error: 'Compra asociada no encontrada',
                mensaje: 'No se encontró la compra asociada al detalle'
            });
        }
        // Actualizar el costo total de la compra
        const nuevoCosto = compra.costo_compra - detalle.precio_total;
        await compra.update({ costo_compra: nuevoCosto }, { transaction: t });
        // Eliminar el detalle
        await detalle.destroy({ transaction: t });
        await t.commit();
        res.json({
            message: 'Detalle de compra eliminado correctamente',
            detalle: detalle
        });
    }
    catch (error) {
        await t.rollback();
        console.error('Error al eliminar detalle de compra:', error);
        res.status(500).json({
            error: 'Error al eliminar detalle de compra',
            mensaje: 'Ocurrió un error al eliminar el detalle de compra'
        });
    }
};
exports.deleteDetalleCompra = deleteDetalleCompra;
