"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDecoracionesByCliente = exports.getAllDetallesDecoracion = exports.getDetallesByDecoracion = exports.deleteDetalleDecoracion = exports.createDetalleDecoracion = exports.deleteDecoracion = exports.editDecoracion = exports.getDecoracionesByTema = exports.getAllDecoraciones = exports.createDecoracion = void 0;
const DecoracionServicio_model_1 = __importDefault(require("../models/DecoracionServicio_model"));
const DetalleDecoracion_model_1 = __importDefault(require("../models/DetalleDecoracion_model"));
const Evento_model_1 = __importDefault(require("../models/Evento_model"));
const sequelize_1 = require("sequelize");
const database_1 = require("../database/database");
const Usuario_model_1 = __importDefault(require("../models/Usuario_model"));
const TipoEvento_model_1 = __importDefault(require("../models/TipoEvento_model"));
const createDecoracion = async (req, res) => {
    try {
        const decoracionCompleta = await database_1.sequelize.transaction(async (t) => {
            const { id_evento, tema_decoracion, colores_decoracion, detalles // Array de detalles de decoración
             } = req.body;
            // Verificar que el evento existe
            const evento = await Evento_model_1.default.findByPk(id_evento, { transaction: t });
            if (!evento) {
                // Lanzamos un error, lo que hará que Sequelize revierta la transacción automáticamente
                throw new Error('Evento no encontrado');
            }
            // Calcular totales asegurando que los valores son números
            const precioneto = detalles.reduce((total, elemento) => total + (Number(elemento.precio_elemento || 0) * Number(elemento.cantelemento_decoracion || 0)), 0);
            const itbis = precioneto * 0.18; // 18% ITBIS
            const total = precioneto + itbis;
            // Crear el servicio de decoración
            const decoracion = await DecoracionServicio_model_1.default.create({
                id_evento,
                tema_decoracion,
                colores_decoracion,
                precioneto_decoracion: precioneto,
                itbis_decoracion: itbis,
                total_decoracion: total,
                estado_decoracion: 'Solicitado'
            }, { transaction: t });
            // Crear los detalles de decoración
            if (detalles && detalles.length > 0) {
                const detallesPromises = detalles.map((detalle) => DetalleDecoracion_model_1.default.create({
                    id_decoracion: decoracion.id_decoracion,
                    elemento_decoracion: detalle.elemento_decoracion,
                    cantelemento_decoracion: Number(detalle.cantelemento_decoracion || 0),
                    precio_elemento: Number(detalle.precio_elemento || 0),
                    precio_decoracion: Number(detalle.precio_elemento || 0) * Number(detalle.cantelemento_decoracion || 0),
                    estado_detdecoracion: 'Aceptado'
                }, { transaction: t }));
                await Promise.all(detallesPromises);
            }
            // Obtener la decoración con sus detalles dentro de la misma transacción
            const completeDecoracion = await DecoracionServicio_model_1.default.findByPk(decoracion.id_decoracion, {
                include: [
                    {
                        model: DetalleDecoracion_model_1.default,
                        as: 'detalles_decoracion',
                        where: {
                            estado_detdecoracion: 'Aceptado'
                        },
                        required: false
                    },
                    {
                        model: Evento_model_1.default,
                        include: [
                            {
                                model: Usuario_model_1.default,
                                as: 'cliente'
                            },
                            {
                                model: TipoEvento_model_1.default,
                                as: 'tipo_evento'
                            }
                        ]
                    }
                ],
                transaction: t // Asegurar que esta operación también es parte de la transacción
            });
            return completeDecoracion; // Devolver el resultado de la transacción
        });
        // Enviar respuesta exitosa
        return res.status(201).json({
            success: true,
            mensaje: 'Decoración creada exitosamente',
            decoracion: decoracionCompleta ? decoracionCompleta.get({ plain: true }) : null
        });
    }
    catch (error) {
        console.error('Error al crear servicio de decoración:', error);
        if (error.message === 'Evento no encontrado') {
            return res.status(404).json({
                success: false,
                error: 'Evento no encontrado',
                mensaje: 'El evento especificado no existe en el sistema'
            });
        }
        // Manejo de errores genérico
        return res.status(500).json({
            success: false,
            error: 'Error al crear servicio de decoración',
            mensaje: error.message
        });
    }
};
exports.createDecoracion = createDecoracion;
const getAllDecoraciones = async (req, res) => {
    try {
        const decoraciones = await DecoracionServicio_model_1.default.findAll({
            where: {
                estado_decoracion: {
                    [sequelize_1.Op.ne]: 'Eliminado'
                }
            },
            include: [
                {
                    model: Evento_model_1.default,
                    as: 'evento',
                    include: [
                        {
                            model: Usuario_model_1.default,
                            as: 'cliente'
                        },
                        {
                            model: TipoEvento_model_1.default,
                            as: 'tipo_evento'
                        }
                    ]
                },
                {
                    model: DetalleDecoracion_model_1.default,
                    as: 'detalles_decoracion', // Usar el alias correcto
                    where: {
                        estado_detdecoracion: 'Aceptado'
                    },
                    required: false
                }
            ],
            order: [['id_decoracion', 'DESC']]
        });
        // No devolver 404 si no hay decoraciones
        res.json(decoraciones.map(d => d ? d.get({ plain: true }) : null).filter(Boolean) || []); // Asegurar que la respuesta sea un objeto plano y filtrar nulos
    }
    catch (error) {
        console.error('Error al obtener servicios de decoración:', error);
        res.status(500).json({
            error: 'Error al obtener servicios de decoración',
            mensaje: error.message || 'Ocurrió un error al cargar los servicios de decoración' // Mensaje de error más detallado
        });
    }
};
exports.getAllDecoraciones = getAllDecoraciones;
const getDecoracionesByTema = async (req, res) => {
    try {
        const { tema } = req.params;
        const decoraciones = await DecoracionServicio_model_1.default.findAll({
            where: {
                tema_decoracion: {
                    [sequelize_1.Op.like]: `%${tema}%`
                },
                estado_decoracion: {
                    [sequelize_1.Op.ne]: 'Eliminado'
                }
            },
            include: [
                {
                    model: DetalleDecoracion_model_1.default,
                    where: {
                        estado_detdecoracion: 'Aceptado'
                    },
                    required: false
                },
                {
                    model: Evento_model_1.default,
                    as: 'evento'
                }
            ],
            order: [['id_decoracion', 'DESC']]
        });
        if (!decoraciones || decoraciones.length === 0) {
            return res.status(404).json({
                error: 'No se encontraron decoraciones',
                mensaje: `No hay servicios de decoración registrados con el tema: ${tema}`
            });
        }
        res.json(decoraciones);
    }
    catch (error) {
        console.error('Error al buscar servicios de decoración por tema:', error);
        res.status(500).json({
            error: 'Error al buscar servicios de decoración por tema',
            mensaje: 'Ocurrió un error al buscar los servicios de decoración'
        });
    }
};
exports.getDecoracionesByTema = getDecoracionesByTema;
const editDecoracion = async (req, res) => {
    const t = await database_1.sequelize.transaction();
    try {
        const { id_decoracion } = req.params;
        const { tema_decoracion, precioneto_decoracion, itbis_decoracion, total_decoracion, detalles // Array de detalles actualizados
         } = req.body;
        const decoracion = await DecoracionServicio_model_1.default.findByPk(id_decoracion);
        if (!decoracion) {
            await t.rollback();
            return res.status(404).json({
                error: 'Servicio de decoración no encontrado',
                mensaje: 'El servicio de decoración especificado no existe en el sistema'
            });
        }
        // Actualizar el servicio de decoración
        await decoracion.update({
            tema_decoracion: tema_decoracion || decoracion.tema_decoracion,
            precioneto_decoracion: precioneto_decoracion || decoracion.precioneto_decoracion,
            itbis_decoracion: itbis_decoracion || decoracion.itbis_decoracion,
            total_decoracion: total_decoracion || decoracion.total_decoracion
        }, { transaction: t });
        // Si se proporcionaron nuevos detalles, actualizarlos
        if (detalles) {
            // Marcar detalles existentes como cancelados
            await DetalleDecoracion_model_1.default.update({ estado_detdecoracion: 'Cancelado' }, {
                where: { id_decoracion },
                transaction: t
            });
            // Crear nuevos detalles
            if (detalles.length > 0) {
                const detallesPromises = detalles.map((detalle) => DetalleDecoracion_model_1.default.create({
                    id_decoracion,
                    elemento_decoracion: detalle.elemento_decoracion,
                    cantelemento_decoracion: Number(detalle.cantelemento_decoracion || 0),
                    precio_elemento: Number(detalle.precio_elemento || 0),
                    precio_decoracion: Number(detalle.precio_elemento || 0) * Number(detalle.cantelemento_decoracion || 0),
                    estado_detdecoracion: 'Aceptado'
                }, { transaction: t }));
                await Promise.all(detallesPromises);
            }
        }
        await t.commit();
        // Obtener la decoración actualizada con sus detalles
        const decoracionActualizada = await DecoracionServicio_model_1.default.findByPk(id_decoracion, {
            include: [
                {
                    model: DetalleDecoracion_model_1.default,
                    where: {
                        estado_detdecoracion: 'Aceptado'
                    },
                    required: false
                },
                {
                    model: Evento_model_1.default,
                    as: 'evento'
                }
            ]
        });
        res.json(decoracionActualizada);
    }
    catch (error) {
        await t.rollback();
        console.error('Error al editar servicio de decoración:', error);
        res.status(500).json({
            error: 'Error al editar servicio de decoración',
            mensaje: 'Ocurrió un error al actualizar el servicio de decoración'
        });
    }
};
exports.editDecoracion = editDecoracion;
const deleteDecoracion = async (req, res) => {
    const t = await database_1.sequelize.transaction();
    try {
        const { id_decoracion } = req.params;
        const decoracion = await DecoracionServicio_model_1.default.findByPk(id_decoracion);
        if (!decoracion) {
            await t.rollback();
            return res.status(404).json({
                error: 'Servicio de decoración no encontrado',
                mensaje: 'El servicio de decoración especificado no existe en el sistema'
            });
        }
        // Marcar el servicio como eliminado
        await decoracion.update({
            estado_decoracion: 'Eliminado'
        }, { transaction: t });
        // Marcar todos los detalles como cancelados
        await DetalleDecoracion_model_1.default.update({ estado_detdecoracion: 'Cancelado' }, {
            where: { id_decoracion },
            transaction: t
        });
        await t.commit();
        res.json({
            message: 'Servicio de decoración eliminado correctamente',
            decoracion: decoracion
        });
    }
    catch (error) {
        await t.rollback();
        console.error('Error al eliminar servicio de decoración:', error);
        res.status(500).json({
            error: 'Error al eliminar servicio de decoración',
            mensaje: 'Ocurrió un error al eliminar el servicio de decoración'
        });
    }
};
exports.deleteDecoracion = deleteDecoracion;
// Crear un detalle de decoración individual
const createDetalleDecoracion = async (req, res) => {
    const t = await database_1.sequelize.transaction();
    try {
        const { id_decoracion, elemento_decoracion, cantelemento_decoracion, precio_elemento } = req.body;
        // Verificar que la decoración existe
        const decoracion = await DecoracionServicio_model_1.default.findByPk(id_decoracion);
        if (!decoracion) {
            await t.rollback();
            return res.status(404).json({
                error: 'Servicio de decoración no encontrado',
                mensaje: 'El servicio de decoración especificado no existe en el sistema'
            });
        }
        // Validar cantidad y precio
        if (cantelemento_decoracion <= 0) {
            await t.rollback();
            return res.status(400).json({
                error: 'Cantidad inválida',
                mensaje: 'La cantidad debe ser mayor que cero'
            });
        }
        if (precio_elemento <= 0) {
            await t.rollback();
            return res.status(400).json({
                error: 'Precio inválido',
                mensaje: 'El precio del elemento debe ser mayor que cero'
            });
        }
        // Calcular el precio total
        const precio_decoracion = precio_elemento * cantelemento_decoracion;
        // Crear el detalle de decoración
        const detalleDecoracion = await DetalleDecoracion_model_1.default.create({
            id_decoracion,
            elemento_decoracion,
            cantelemento_decoracion,
            precio_elemento,
            precio_decoracion,
            estado_detdecoracion: 'Aceptado'
        }, { transaction: t });
        // Actualizar el precio total de la decoración
        const nuevoPrecioNeto = decoracion.precioneto_decoracion + precio_decoracion;
        const nuevoItbis = nuevoPrecioNeto * 0.18; // 18% ITBIS
        const nuevoTotal = nuevoPrecioNeto + nuevoItbis;
        await decoracion.update({
            precioneto_decoracion: nuevoPrecioNeto,
            itbis_decoracion: nuevoItbis,
            total_decoracion: nuevoTotal
        }, { transaction: t });
        await t.commit();
        // Obtener el detalle con sus relaciones
        const detalleCompleto = await DetalleDecoracion_model_1.default.findByPk(detalleDecoracion.id_detdecoracion, {
            include: [
                {
                    model: DecoracionServicio_model_1.default,
                    include: [
                        {
                            model: Evento_model_1.default,
                            as: 'evento'
                        }
                    ]
                }
            ]
        });
        res.status(201).json(detalleCompleto);
    }
    catch (error) {
        await t.rollback();
        console.error('Error al crear detalle de decoración:', error);
        res.status(500).json({
            error: 'Error al crear detalle de decoración',
            mensaje: 'Ocurrió un error al procesar el detalle de decoración'
        });
    }
};
exports.createDetalleDecoracion = createDetalleDecoracion;
// Eliminar un detalle de decoración
const deleteDetalleDecoracion = async (req, res) => {
    const t = await database_1.sequelize.transaction();
    try {
        const { id_detalle_decoracion } = req.params;
        const detalle = await DetalleDecoracion_model_1.default.findByPk(id_detalle_decoracion);
        if (!detalle) {
            await t.rollback();
            return res.status(404).json({
                error: 'Detalle de decoración no encontrado',
                mensaje: 'El detalle de decoración especificado no existe en el sistema'
            });
        }
        // Obtener la decoración asociada
        const decoracion = await DecoracionServicio_model_1.default.findByPk(detalle.id_decoracion);
        if (!decoracion) {
            await t.rollback();
            return res.status(404).json({
                error: 'Servicio de decoración no encontrado',
                mensaje: 'No se encontró el servicio de decoración asociado al detalle'
            });
        }
        // Actualizar el precio total de la decoración
        const nuevoPrecioNeto = decoracion.precioneto_decoracion - detalle.precio_decoracion;
        const nuevoItbis = nuevoPrecioNeto * 0.18; // 18% ITBIS
        const nuevoTotal = nuevoPrecioNeto + nuevoItbis;
        await decoracion.update({
            precioneto_decoracion: nuevoPrecioNeto,
            itbis_decoracion: nuevoItbis,
            total_decoracion: nuevoTotal
        }, { transaction: t });
        // Marcar el detalle como cancelado
        await detalle.update({
            estado_detdecoracion: 'Cancelado'
        }, { transaction: t });
        await t.commit();
        res.json({
            message: 'Detalle de decoración eliminado correctamente',
            detalle: detalle
        });
    }
    catch (error) {
        await t.rollback();
        console.error('Error al eliminar detalle de decoración:', error);
        res.status(500).json({
            error: 'Error al eliminar detalle de decoración',
            mensaje: 'Ocurrió un error al eliminar el detalle de decoración'
        });
    }
};
exports.deleteDetalleDecoracion = deleteDetalleDecoracion;
// Obtener todos los detalles de una decoración específica
const getDetallesByDecoracion = async (req, res) => {
    try {
        const { id_decoracion } = req.params;
        // Verificar que la decoración existe
        const decoracion = await DecoracionServicio_model_1.default.findByPk(id_decoracion);
        if (!decoracion) {
            return res.status(404).json({
                error: 'Servicio de decoración no encontrado',
                mensaje: 'El servicio de decoración especificado no existe en el sistema'
            });
        }
        const detalles = await DetalleDecoracion_model_1.default.findAll({
            where: {
                id_decoracion,
                estado_detdecoracion: 'Aceptado'
            },
            include: [
                {
                    model: DecoracionServicio_model_1.default,
                    include: [
                        {
                            model: Evento_model_1.default,
                            as: 'evento'
                        }
                    ]
                }
            ],
            order: [['id_detdecoracion', 'DESC']]
        });
        if (!detalles || detalles.length === 0) {
            return res.status(404).json({
                error: 'No se encontraron detalles',
                mensaje: 'No hay detalles registrados para esta decoración'
            });
        }
        res.json(detalles);
    }
    catch (error) {
        console.error('Error al obtener detalles de decoración:', error);
        res.status(500).json({
            error: 'Error al obtener detalles de decoración',
            mensaje: 'Ocurrió un error al cargar los detalles de decoración'
        });
    }
};
exports.getDetallesByDecoracion = getDetallesByDecoracion;
// Obtener todos los detalles de decoración activos
const getAllDetallesDecoracion = async (req, res) => {
    try {
        const detalles = await DetalleDecoracion_model_1.default.findAll({
            where: {
                estado_detdecoracion: 'Aceptado'
            },
            include: [
                {
                    model: DecoracionServicio_model_1.default,
                    include: [
                        {
                            model: Evento_model_1.default,
                            as: 'evento'
                        }
                    ]
                }
            ],
            order: [['id_detdecoracion', 'DESC']]
        });
        if (!detalles || detalles.length === 0) {
            return res.status(404).json({
                error: 'No se encontraron detalles',
                mensaje: 'No hay detalles de decoración registrados en el sistema'
            });
        }
        res.json(detalles);
    }
    catch (error) {
        console.error('Error al obtener detalles de decoración:', error);
        res.status(500).json({
            error: 'Error al obtener detalles de decoración',
            mensaje: 'Ocurrió un error al cargar los detalles de decoración'
        });
    }
};
exports.getAllDetallesDecoracion = getAllDetallesDecoracion;
// Obtener decoraciones por cliente, con filtros de estado y evento
const getDecoracionesByCliente = async (req, res) => {
    try {
        const { cedula_usuario } = req.params;
        const { estado, id_evento } = req.query;
        // Construir condiciones dinámicas
        const whereDecoracion = {
            estado_decoracion: { [sequelize_1.Op.ne]: 'Eliminado' }
        };
        if (estado)
            whereDecoracion.estado_decoracion = estado;
        if (id_evento)
            whereDecoracion.id_evento = id_evento;
        // Buscar decoraciones donde el evento pertenezca al cliente
        const decoraciones = await DecoracionServicio_model_1.default.findAll({
            where: whereDecoracion,
            include: [
                {
                    model: Evento_model_1.default,
                    as: 'evento',
                    where: { cedula_cliente: cedula_usuario },
                    include: [
                        { model: Usuario_model_1.default, as: 'cliente' },
                        { model: TipoEvento_model_1.default, as: 'tipo_evento' }
                    ]
                },
                {
                    model: DetalleDecoracion_model_1.default,
                    as: 'detalles_decoracion',
                    where: { estado_detdecoracion: 'Aceptado' },
                    required: false
                }
            ],
            order: [['id_decoracion', 'DESC']]
        });
        res.json(decoraciones.map(d => d ? d.get({ plain: true }) : null).filter(Boolean) || []);
    }
    catch (error) {
        console.error('Error al obtener decoraciones por cliente:', error);
        res.status(500).json({
            error: 'Error al obtener decoraciones por cliente',
            mensaje: error.message || 'Ocurrió un error al cargar las decoraciones por cliente'
        });
    }
};
exports.getDecoracionesByCliente = getDecoracionesByCliente;
