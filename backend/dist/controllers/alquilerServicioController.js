"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAlquileresByUsuario = exports.deleteAlquilerServicio = exports.editAlquilerServicio = exports.getElementosAlquiler = exports.getAlquileresByElemento = exports.getAlquileresByEvento = exports.getAlquilerById = exports.getAllAlquileres = exports.createAlquilerServicio = void 0;
const AlquilerServicio_model_1 = __importDefault(require("../models/AlquilerServicio_model"));
const Elemento_model_1 = __importDefault(require("../models/Elemento_model"));
const Evento_model_1 = __importDefault(require("../models/Evento_model"));
const DetalleAlquiler_model_1 = __importDefault(require("../models/DetalleAlquiler_model"));
const sequelize_1 = require("sequelize");
const database_1 = require("../database/database");
const SubcategoriaElemento_model_1 = __importDefault(require("../models/SubcategoriaElemento_model"));
const CategoriaElemento_model_1 = __importDefault(require("../models/CategoriaElemento_model"));
const Usuario_model_1 = __importDefault(require("../models/Usuario_model"));
const createAlquilerServicio = async (req, res) => {
    const t = await database_1.sequelize.transaction();
    try {
        const { id_evento, cant_elementos_alquiler, subtotal_alquiler, itbis_alquiler, total_alquiler, estado_alquiler = 'Solicitado', elementos } = req.body;
        // Verificar que el evento existe
        const evento = await Evento_model_1.default.findByPk(id_evento);
        if (!evento) {
            await t.rollback();
            return res.status(404).json({
                error: 'Evento no encontrado',
                mensaje: 'El evento especificado no existe en el sistema'
            });
        }
        // Crear el alquiler
        const alquiler = await AlquilerServicio_model_1.default.create({
            id_evento,
            cant_elementos_alquiler,
            subtotal_alquiler,
            itbis_alquiler,
            total_alquiler,
            estado_alquiler
        }, { transaction: t });
        // Crear los detalles del alquiler
        if (elementos && elementos.length > 0) {
            // Validar que todos los elementos existen y tienen suficiente cantidad disponible
            for (const elem of elementos) {
                const elemento = await Elemento_model_1.default.findByPk(elem.id_elemento);
                if (!elemento) {
                    await t.rollback();
                    return res.status(404).json({
                        error: 'Elemento no encontrado',
                        mensaje: `El elemento con ID ${elem.id_elemento} no existe en el sistema`
                    });
                }
                // Solo validar cantidad disponible si el estado es Aceptado
                if (estado_alquiler === 'Aceptado' && elemento.cantidad_disponible < elem.cantidad) {
                    await t.rollback();
                    return res.status(400).json({
                        error: 'Cantidad insuficiente',
                        mensaje: `No hay suficiente cantidad disponible del elemento ${elemento.nombre_elemento}`
                    });
                }
            }
            await Promise.all(elementos.map(async (elem) => {
                await DetalleAlquiler_model_1.default.create({
                    id_alquiler: alquiler.id_alquiler,
                    id_elemento: elem.id_elemento,
                    cantidad_alquiler: elem.cantidad,
                    precio_unitario: elem.precio_unitario,
                    total_alquiler: elem.subtotal,
                    estado_detalquiler: 'Aceptado'
                }, { transaction: t });
                // Solo actualizar la cantidad disponible si el estado es Aceptado
                if (estado_alquiler === 'Aceptado') {
                    const elemento = await Elemento_model_1.default.findByPk(elem.id_elemento);
                    if (elemento) {
                        await elemento.update({
                            cantidad_disponible: elemento.cantidad_disponible - elem.cantidad
                        }, { transaction: t });
                    }
                }
            }));
        }
        await t.commit();
        // Obtener el alquiler con sus detalles
        const alquilerCompleto = await AlquilerServicio_model_1.default.findByPk(alquiler.id_alquiler, {
            include: [
                {
                    model: DetalleAlquiler_model_1.default,
                    include: [
                        {
                            model: Elemento_model_1.default
                        }
                    ]
                },
                {
                    model: Evento_model_1.default,
                    as: 'evento'
                }
            ]
        });
        res.status(201).json(alquilerCompleto);
    }
    catch (error) {
        await t.rollback();
        console.error('Error al crear alquiler:', error);
        res.status(500).json({
            error: 'Error al crear alquiler',
            mensaje: 'Ocurrió un error al procesar el alquiler'
        });
    }
};
exports.createAlquilerServicio = createAlquilerServicio;
const getAllAlquileres = async (req, res) => {
    try {
        const alquileres = await AlquilerServicio_model_1.default.findAll({
            include: [
                {
                    model: DetalleAlquiler_model_1.default,
                    include: [
                        {
                            model: Elemento_model_1.default,
                            include: [
                                {
                                    model: SubcategoriaElemento_model_1.default,
                                    include: [
                                        {
                                            model: CategoriaElemento_model_1.default,
                                            as: 'categoria'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    model: Evento_model_1.default,
                    as: 'evento'
                }
            ],
            order: [['id_alquiler', 'DESC']]
        });
        res.json(alquileres);
    }
    catch (error) {
        console.error('Error al obtener alquileres:', error);
        res.status(500).json({
            error: 'Error al obtener alquileres',
            mensaje: 'Ocurrió un error al cargar los alquileres'
        });
    }
};
exports.getAllAlquileres = getAllAlquileres;
const getAlquilerById = async (req, res) => {
    try {
        const { id_alquiler } = req.params;
        const alquiler = await AlquilerServicio_model_1.default.findByPk(id_alquiler, {
            include: [
                {
                    model: DetalleAlquiler_model_1.default,
                    where: {
                        estado_detalquiler: 'Aceptado'
                    },
                    required: false,
                    include: [
                        {
                            model: Elemento_model_1.default
                        }
                    ]
                },
                {
                    model: Evento_model_1.default,
                    as: 'evento'
                }
            ]
        });
        if (!alquiler) {
            return res.status(404).json({
                error: 'Alquiler no encontrado',
                mensaje: 'No existe un alquiler con el ID proporcionado'
            });
        }
        res.json(alquiler);
    }
    catch (error) {
        console.error('Error al obtener alquiler:', error);
        res.status(500).json({
            error: 'Error al obtener el alquiler',
            mensaje: 'Ocurrió un error al cargar el alquiler'
        });
    }
};
exports.getAlquilerById = getAlquilerById;
const getAlquileresByEvento = async (req, res) => {
    try {
        const { id_evento } = req.params;
        // Verificar si el evento existe
        const evento = await Evento_model_1.default.findByPk(id_evento);
        if (!evento) {
            return res.status(404).json({
                error: 'Evento no encontrado',
                mensaje: `No se encontró el evento con ID ${id_evento}`
            });
        }
        const alquileres = await AlquilerServicio_model_1.default.findAll({
            where: {
                id_evento,
                estado_alquiler: {
                    [sequelize_1.Op.ne]: 'Cancelado'
                }
            },
            include: [
                {
                    model: DetalleAlquiler_model_1.default,
                    where: {
                        estado_detalquiler: 'Aceptado'
                    },
                    required: false,
                    include: [
                        {
                            model: Elemento_model_1.default
                        }
                    ]
                },
                {
                    model: Evento_model_1.default,
                    as: 'evento',
                    attributes: ['id_evento', 'nombre_evento', 'fecha_evento']
                }
            ],
            order: [['id_alquiler', 'DESC']]
        });
        if (!alquileres || alquileres.length === 0) {
            return res.status(404).json({
                error: 'No se encontraron alquileres',
                mensaje: 'No hay alquileres registrados para este evento'
            });
        }
        res.json(alquileres);
    }
    catch (error) {
        console.error('Error al obtener alquileres por evento:', error);
        res.status(500).json({
            error: 'Error al obtener los alquileres',
            mensaje: 'Ocurrió un error al cargar los alquileres del evento'
        });
    }
};
exports.getAlquileresByEvento = getAlquileresByEvento;
const getAlquileresByElemento = async (req, res) => {
    try {
        const { id_elemento } = req.params;
        // Verificar si el elemento existe
        const elemento = await Elemento_model_1.default.findByPk(id_elemento);
        if (!elemento) {
            return res.status(404).json({
                error: 'Elemento no encontrado',
                mensaje: `No se encontró el elemento con ID ${id_elemento}`
            });
        }
        // Buscar todos los detalles de alquiler que contengan este elemento
        const detallesAlquiler = await DetalleAlquiler_model_1.default.findAll({
            where: {
                id_elemento,
                estado_detalquiler: 'Aceptado'
            },
            include: [
                {
                    model: AlquilerServicio_model_1.default,
                    as: 'alquiler',
                    where: {
                        estado_alquiler: {
                            [sequelize_1.Op.ne]: 'Cancelado'
                        }
                    },
                    include: [
                        {
                            model: Evento_model_1.default,
                            as: 'evento',
                            attributes: ['id_evento', 'nombre_evento', 'fecha_evento']
                        }
                    ]
                }
            ],
            order: [[{ model: AlquilerServicio_model_1.default, as: 'alquiler' }, 'id_alquiler', 'DESC']]
        });
        if (!detallesAlquiler || detallesAlquiler.length === 0) {
            return res.status(404).json({
                error: 'No se encontraron alquileres',
                mensaje: 'No hay alquileres registrados para este elemento'
            });
        }
        // Transformar la respuesta para que sea más útil
        const alquileres = detallesAlquiler
            .filter(detalle => detalle.alquiler !== null && detalle.alquiler !== undefined)
            .map(detalle => {
            const alquilerData = detalle.alquiler.get();
            return {
                ...alquilerData,
                cantidad_alquilada: detalle.cantidad_alquiler,
                precio_unitario: detalle.precio_unitario,
                subtotal: detalle.total_alquiler
            };
        });
        res.json(alquileres);
    }
    catch (error) {
        console.error('Error al obtener alquileres por elemento:', error);
        res.status(500).json({
            error: 'Error al obtener los alquileres',
            mensaje: 'Ocurrió un error al cargar los alquileres del elemento'
        });
    }
};
exports.getAlquileresByElemento = getAlquileresByElemento;
const getElementosAlquiler = async (req, res) => {
    try {
        const { id_alquiler } = req.params;
        // Verificar si el alquiler existe
        const alquilerExists = await AlquilerServicio_model_1.default.findByPk(id_alquiler);
        if (!alquilerExists) {
            return res.status(404).json({
                error: 'Alquiler no encontrado',
                mensaje: `No se encontró el alquiler con ID ${id_alquiler}`
            });
        }
        const detalles = await DetalleAlquiler_model_1.default.findAll({
            where: {
                id_alquiler,
                estado_detalquiler: 'Aceptado'
            },
            include: [
                {
                    model: Elemento_model_1.default,
                    as: 'elemento',
                    attributes: ['id_elemento', 'nombre_elemento', 'precio_elemento', 'cantidad_disponible', 'imagen_url']
                }
            ]
        });
        if (!detalles || detalles.length === 0) {
            return res.status(404).json({
                error: 'No se encontraron elementos',
                mensaje: 'Este alquiler no tiene elementos asociados'
            });
        }
        // Transformar la respuesta para incluir solo la información necesaria
        const elementosFormateados = detalles.map(detalle => {
            const elemento = detalle.elemento;
            if (!elemento)
                return null;
            return {
                id_elemento: elemento.id_elemento,
                nombre_elemento: elemento.nombre_elemento,
                precio_elemento: elemento.precio_elemento,
                cantidad_disponible: elemento.cantidad_disponible,
                imagen_url: elemento.imagen_url,
                cantidad_alquiler: detalle.cantidad_alquiler,
                precio_unitario: detalle.precio_unitario,
                total_alquiler: detalle.total_alquiler,
                estado_detalquiler: detalle.estado_detalquiler
            };
        }).filter(elemento => elemento !== null);
        res.json(elementosFormateados);
    }
    catch (error) {
        console.error('Error al obtener elementos del alquiler:', error);
        res.status(500).json({
            error: 'Error al obtener elementos del alquiler',
            mensaje: 'Ocurrió un error al cargar los elementos del alquiler'
        });
    }
};
exports.getElementosAlquiler = getElementosAlquiler;
const editAlquilerServicio = async (req, res) => {
    const t = await database_1.sequelize.transaction();
    try {
        const { id_alquiler } = req.params;
        const { cant_elementos_alquiler, subtotal_alquiler, itbis_alquiler, total_alquiler, estado_alquiler, elementos } = req.body;
        console.log('Datos recibidos para actualización:', {
            id_alquiler,
            cant_elementos_alquiler,
            subtotal_alquiler,
            itbis_alquiler,
            total_alquiler,
            estado_alquiler,
            elementos
        });
        // Buscar el alquiler con sus detalles actuales
        const alquiler = await AlquilerServicio_model_1.default.findByPk(id_alquiler, {
            include: [{
                    model: DetalleAlquiler_model_1.default,
                    include: [{ model: Elemento_model_1.default }]
                }]
        });
        if (!alquiler) {
            await t.rollback();
            return res.status(404).json({
                error: 'Alquiler no encontrado',
                mensaje: 'El alquiler especificado no existe en el sistema'
            });
        }
        // Actualizar el alquiler principal
        await alquiler.update({
            estado_alquiler,
            cant_elementos_alquiler,
            subtotal_alquiler,
            itbis_alquiler,
            total_alquiler
        }, { transaction: t });
        if (elementos && elementos.length > 0) {
            // Marcar todos los detalles actuales como 'Cancelado'
            await DetalleAlquiler_model_1.default.update({ estado_detalquiler: 'Cancelado' }, {
                where: { id_alquiler: alquiler.id_alquiler },
                transaction: t
            });
            // Crear nuevos detalles
            for (const elemento of elementos) {
                await DetalleAlquiler_model_1.default.create({
                    id_alquiler: alquiler.id_alquiler,
                    id_elemento: elemento.id_elemento,
                    cantidad_alquiler: elemento.cantidad,
                    precio_unitario: elemento.precio_unitario,
                    total_alquiler: elemento.subtotal,
                    estado_detalquiler: 'Aceptado'
                }, { transaction: t });
                // Actualizar la cantidad disponible del elemento
                const elementoActual = await Elemento_model_1.default.findByPk(elemento.id_elemento, { transaction: t });
                if (elementoActual) {
                    await elementoActual.update({
                        cantidad_disponible: elementoActual.cantidad_disponible - elemento.cantidad
                    }, { transaction: t });
                }
            }
        }
        await t.commit();
        // Obtener el alquiler actualizado con sus detalles
        const alquilerActualizado = await AlquilerServicio_model_1.default.findByPk(id_alquiler, {
            include: [
                {
                    model: DetalleAlquiler_model_1.default,
                    where: {
                        estado_detalquiler: 'Aceptado'
                    },
                    required: false,
                    include: [
                        {
                            model: Elemento_model_1.default
                        }
                    ]
                },
                {
                    model: Evento_model_1.default,
                    as: 'evento'
                }
            ]
        });
        return res.json(alquilerActualizado);
    }
    catch (error) {
        await t.rollback();
        console.error('Error al editar el alquiler:', error);
        return res.status(500).json({
            error: 'Error interno del servidor',
            mensaje: 'Ocurrió un error al actualizar el alquiler'
        });
    }
};
exports.editAlquilerServicio = editAlquilerServicio;
const deleteAlquilerServicio = async (req, res) => {
    const t = await database_1.sequelize.transaction();
    try {
        const { id_alquiler } = req.params;
        const alquiler = await AlquilerServicio_model_1.default.findByPk(id_alquiler, {
            include: [{
                    model: DetalleAlquiler_model_1.default,
                    where: { estado_detalquiler: 'Aceptado' },
                    required: false,
                    include: [{ model: Elemento_model_1.default }]
                }]
        });
        if (!alquiler) {
            await t.rollback();
            return res.status(404).json({
                error: 'Alquiler no encontrado',
                mensaje: 'El alquiler especificado no existe en el sistema'
            });
        }
        const estadoAnterior = alquiler.estado_alquiler;
        // Obtener detalles actuales para restaurar cantidades
        const detallesActuales = await DetalleAlquiler_model_1.default.findAll({
            where: {
                id_alquiler,
                estado_detalquiler: 'Aceptado'
            }
        });
        // Restaurar cantidades de elementos
        for (const detalle of detallesActuales) {
            const elemento = await Elemento_model_1.default.findByPk(detalle.id_elemento);
            if (elemento) {
                await elemento.update({
                    cantidad_disponible: elemento.cantidad_disponible + detalle.cantidad_alquiler
                }, { transaction: t });
            }
        }
        // Marcar el alquiler como cancelado
        await alquiler.update({
            estado_alquiler: 'Cancelado'
        }, { transaction: t });
        // Marcar todos los detalles como cancelados
        await DetalleAlquiler_model_1.default.update({ estado_detalquiler: 'Cancelado' }, {
            where: { id_alquiler },
            transaction: t
        });
        await t.commit();
        res.json({
            message: 'Alquiler cancelado correctamente',
            alquiler: alquiler
        });
    }
    catch (error) {
        await t.rollback();
        console.error('Error al eliminar alquiler:', error);
        res.status(500).json({
            error: 'Error al eliminar alquiler',
            mensaje: 'Ocurrió un error al cancelar el alquiler'
        });
    }
};
exports.deleteAlquilerServicio = deleteAlquilerServicio;
const getAlquileresByUsuario = async (req, res) => {
    try {
        const { cedula_usuario } = req.params;
        // Verificar que el usuario existe
        const usuario = await Usuario_model_1.default.findByPk(cedula_usuario);
        if (!usuario) {
            return res.status(404).json({
                error: 'Usuario no encontrado',
                mensaje: 'El usuario especificado no existe en el sistema'
            });
        }
        // Obtener los eventos del usuario
        const eventos = await Evento_model_1.default.findAll({
            where: { cedula_usuario }
        });
        if (!eventos || eventos.length === 0) {
            return res.status(404).json({
                error: 'No hay eventos',
                mensaje: 'El usuario no tiene eventos registrados'
            });
        }
        // Obtener los IDs de los eventos
        const idEventos = eventos.map(evento => evento.id_evento);
        // Obtener los alquileres asociados a los eventos del usuario
        const alquileres = await AlquilerServicio_model_1.default.findAll({
            where: {
                id_evento: {
                    [sequelize_1.Op.in]: idEventos
                },
                estado_alquiler: {
                    [sequelize_1.Op.ne]: 'Cancelado' // Excluir alquileres cancelados
                }
            },
            include: [
                {
                    model: DetalleAlquiler_model_1.default,
                    include: [
                        {
                            model: Elemento_model_1.default,
                            include: [
                                {
                                    model: SubcategoriaElemento_model_1.default,
                                    include: [
                                        {
                                            model: CategoriaElemento_model_1.default,
                                            as: 'categoria'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    model: Evento_model_1.default,
                    as: 'evento'
                }
            ],
            order: [['id_alquiler', 'DESC']]
        });
        if (!alquileres || alquileres.length === 0) {
            return res.status(404).json({
                error: 'No hay alquileres',
                mensaje: 'No se encontraron alquileres para este usuario'
            });
        }
        res.json(alquileres);
    }
    catch (error) {
        console.error('Error al obtener alquileres del usuario:', error);
        res.status(500).json({
            error: 'Error al obtener alquileres',
            mensaje: 'Ocurrió un error al cargar los alquileres del usuario'
        });
    }
};
exports.getAlquileresByUsuario = getAlquileresByUsuario;
