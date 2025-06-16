"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTransporte = exports.editTransporte = exports.getTransportes = exports.createTransporte = void 0;
const TransporteServicio_model_1 = __importDefault(require("../models/TransporteServicio_model"));
const DetalleTransporte_model_1 = __importDefault(require("../models/DetalleTransporte_model"));
const Vehiculo_model_1 = __importDefault(require("../models/Vehiculo_model"));
const AlquilerServicio_model_1 = __importDefault(require("../models/AlquilerServicio_model"));
const database_1 = require("../database/database");
const sequelize_1 = require("sequelize");
// Crear un nuevo servicio de transporte con sus detalles
const createTransporte = async (req, res) => {
    const t = await database_1.sequelize.transaction();
    try {
        const { id_alquiler, distancia_km, precioneto_transporte, itbis_transporte, total_transporte, estado_transporte = 'Solicitado', detalles // Array de detalles de transporte
         } = req.body;
        // Verificar que el alquiler existe
        const alquiler = await AlquilerServicio_model_1.default.findByPk(id_alquiler);
        if (!alquiler) {
            await t.rollback();
            return res.status(404).json({
                error: 'Servicio de alquiler no encontrado',
                mensaje: 'No se encontró el servicio de alquiler solicitado'
            });
        }
        // Crear el servicio de transporte
        const transporte = await TransporteServicio_model_1.default.create({
            id_alquiler,
            distancia_km,
            precioneto_transporte,
            itbis_transporte,
            total_transporte,
            estado_transporte
        }, { transaction: t });
        // Crear los detalles de transporte
        if (detalles && detalles.length > 0) {
            // Validar que todos los vehículos existen
            for (const detalle of detalles) {
                const vehiculo = await Vehiculo_model_1.default.findByPk(detalle.matricula_vehiculo);
                if (!vehiculo) {
                    await t.rollback();
                    return res.status(404).json({
                        error: 'Vehículo no encontrado',
                        mensaje: `No se encontró el vehículo con matrícula ${detalle.matricula_vehiculo}`
                    });
                }
                // Verificar si el vehículo ya está asignado a otro transporte activo
                const vehiculoEnUso = await DetalleTransporte_model_1.default.findOne({
                    where: {
                        matricula_vehiculo: detalle.matricula_vehiculo,
                        estado_dettransporte: 'Aceptado'
                    },
                    include: [
                        {
                            model: TransporteServicio_model_1.default,
                            where: {
                                estado_transporte: {
                                    [sequelize_1.Op.ne]: 'Cancelado'
                                }
                            }
                        }
                    ]
                });
                if (vehiculoEnUso) {
                    await t.rollback();
                    return res.status(400).json({
                        error: 'Vehículo en uso',
                        mensaje: `El vehículo con matrícula ${detalle.matricula_vehiculo} ya está asignado a otro transporte activo`
                    });
                }
            }
            await Promise.all(detalles.map(async (detalle) => {
                return DetalleTransporte_model_1.default.create({
                    id_transporte: transporte.id_transporte,
                    matricula_vehiculo: detalle.matricula_vehiculo,
                    id_usuarioconductor: detalle.id_usuarioconductor,
                    estado_dettransporte: 'Aceptado'
                }, { transaction: t });
            }));
        }
        await t.commit();
        // Obtener el servicio con sus detalles
        const transporteCompleto = await TransporteServicio_model_1.default.findByPk(transporte.id_transporte, {
            include: [
                {
                    model: DetalleTransporte_model_1.default,
                    include: [
                        {
                            model: Vehiculo_model_1.default,
                            as: 'vehiculo'
                        }
                    ]
                },
                {
                    model: AlquilerServicio_model_1.default,
                    as: 'alquilerServicio'
                }
            ]
        });
        res.status(201).json(transporteCompleto);
    }
    catch (error) {
        await t.rollback();
        console.error('Error al crear servicio de transporte:', error);
        res.status(500).json({
            error: 'Error al crear servicio de transporte',
            mensaje: 'Ocurrió un error al crear el servicio de transporte'
        });
    }
};
exports.createTransporte = createTransporte;
// Obtener todos los servicios de transporte
const getTransportes = async (req, res) => {
    try {
        const transportes = await TransporteServicio_model_1.default.findAll({
            where: {
                estado_transporte: {
                    [sequelize_1.Op.ne]: 'Cancelado'
                }
            },
            include: [
                {
                    model: DetalleTransporte_model_1.default,
                    where: {
                        estado_dettransporte: 'Aceptado'
                    },
                    required: false,
                    include: [
                        {
                            model: Vehiculo_model_1.default,
                            as: 'vehiculo'
                        }
                    ]
                },
                {
                    model: AlquilerServicio_model_1.default,
                    as: 'alquilerServicio'
                }
            ],
            order: [['id_transporte', 'DESC']]
        });
        if (!transportes || transportes.length === 0) {
            return res.status(404).json({
                error: 'No se encontraron transportes',
                mensaje: 'No hay servicios de transporte registrados en el sistema'
            });
        }
        res.json(transportes);
    }
    catch (error) {
        console.error('Error al obtener servicios de transporte:', error);
        res.status(500).json({
            error: 'Error al obtener servicios de transporte',
            mensaje: 'Ocurrió un error al cargar los servicios de transporte'
        });
    }
};
exports.getTransportes = getTransportes;
// Editar un servicio de transporte
const editTransporte = async (req, res) => {
    const t = await database_1.sequelize.transaction();
    try {
        const { id_transporte } = req.params;
        const { distancia_km, precioneto_transporte, itbis_transporte, total_transporte, estado_transporte, detalles // Array de detalles actualizados
         } = req.body;
        const transporte = await TransporteServicio_model_1.default.findByPk(id_transporte);
        if (!transporte) {
            await t.rollback();
            return res.status(404).json({
                error: 'Servicio de transporte no encontrado',
                mensaje: 'No se encontró el servicio de transporte solicitado'
            });
        }
        // Actualizar el servicio
        await transporte.update({
            distancia_km: distancia_km || transporte.distancia_km,
            precioneto_transporte: precioneto_transporte || transporte.precioneto_transporte,
            itbis_transporte: itbis_transporte || transporte.itbis_transporte,
            total_transporte: total_transporte || transporte.total_transporte,
            estado_transporte: estado_transporte || transporte.estado_transporte
        }, { transaction: t });
        // Si se proporcionaron nuevos detalles, actualizarlos
        if (detalles) {
            // Marcar detalles existentes como cancelados
            await DetalleTransporte_model_1.default.update({ estado_dettransporte: 'Cancelado' }, {
                where: { id_transporte },
                transaction: t
            });
            // Crear nuevos detalles
            if (detalles.length > 0) {
                // Validar que todos los vehículos existen y están disponibles
                for (const detalle of detalles) {
                    const vehiculo = await Vehiculo_model_1.default.findByPk(detalle.matricula_vehiculo);
                    if (!vehiculo) {
                        await t.rollback();
                        return res.status(404).json({
                            error: 'Vehículo no encontrado',
                            mensaje: `No se encontró el vehículo con matrícula ${detalle.matricula_vehiculo}`
                        });
                    }
                    // Verificar si el vehículo ya está asignado a otro transporte activo
                    const vehiculoEnUso = await DetalleTransporte_model_1.default.findOne({
                        where: {
                            matricula_vehiculo: detalle.matricula_vehiculo,
                            estado_dettransporte: 'Aceptado',
                            id_transporte: {
                                [sequelize_1.Op.ne]: id_transporte
                            }
                        },
                        include: [
                            {
                                model: TransporteServicio_model_1.default,
                                where: {
                                    estado_transporte: {
                                        [sequelize_1.Op.ne]: 'Cancelado'
                                    }
                                }
                            }
                        ]
                    });
                    if (vehiculoEnUso) {
                        await t.rollback();
                        return res.status(400).json({
                            error: 'Vehículo en uso',
                            mensaje: `El vehículo con matrícula ${detalle.matricula_vehiculo} ya está asignado a otro transporte activo`
                        });
                    }
                }
                await Promise.all(detalles.map(async (detalle) => {
                    return DetalleTransporte_model_1.default.create({
                        id_transporte,
                        matricula_vehiculo: detalle.matricula_vehiculo,
                        id_usuarioconductor: detalle.id_usuarioconductor,
                        estado_dettransporte: 'Aceptado'
                    }, { transaction: t });
                }));
            }
        }
        await t.commit();
        // Obtener el servicio actualizado con sus detalles
        const transporteActualizado = await TransporteServicio_model_1.default.findByPk(id_transporte, {
            include: [
                {
                    model: DetalleTransporte_model_1.default,
                    where: {
                        estado_dettransporte: 'Aceptado'
                    },
                    required: false,
                    include: [
                        {
                            model: Vehiculo_model_1.default,
                            as: 'vehiculo'
                        }
                    ]
                },
                {
                    model: AlquilerServicio_model_1.default,
                    as: 'alquilerServicio'
                }
            ]
        });
        res.json(transporteActualizado);
    }
    catch (error) {
        await t.rollback();
        console.error('Error al editar servicio de transporte:', error);
        res.status(500).json({
            error: 'Error al editar servicio de transporte',
            mensaje: 'Ocurrió un error al actualizar el servicio de transporte'
        });
    }
};
exports.editTransporte = editTransporte;
// Eliminar lógicamente un servicio de transporte
const deleteTransporte = async (req, res) => {
    const t = await database_1.sequelize.transaction();
    try {
        const { id_transporte } = req.params;
        const transporte = await TransporteServicio_model_1.default.findByPk(id_transporte);
        if (!transporte) {
            await t.rollback();
            return res.status(404).json({
                error: 'Servicio de transporte no encontrado',
                mensaje: 'No se encontró el servicio de transporte solicitado'
            });
        }
        // Actualizar el estado a Cancelado
        await transporte.update({
            estado_transporte: 'Cancelado'
        }, { transaction: t });
        // Actualizar el estado de los detalles a Cancelado
        await DetalleTransporte_model_1.default.update({ estado_dettransporte: 'Cancelado' }, {
            where: { id_transporte },
            transaction: t
        });
        await t.commit();
        // Obtener el servicio actualizado
        const transporteActualizado = await TransporteServicio_model_1.default.findByPk(id_transporte, {
            include: [
                {
                    model: DetalleTransporte_model_1.default,
                    include: [
                        {
                            model: Vehiculo_model_1.default,
                            as: 'vehiculo'
                        }
                    ]
                },
                {
                    model: AlquilerServicio_model_1.default,
                    as: 'alquilerServicio'
                }
            ]
        });
        res.json({
            mensaje: 'Servicio de transporte cancelado correctamente',
            transporte: transporteActualizado
        });
    }
    catch (error) {
        await t.rollback();
        console.error('Error al cancelar servicio de transporte:', error);
        res.status(500).json({
            error: 'Error al cancelar servicio de transporte',
            mensaje: 'Ocurrió un error al cancelar el servicio de transporte'
        });
    }
};
exports.deleteTransporte = deleteTransporte;
