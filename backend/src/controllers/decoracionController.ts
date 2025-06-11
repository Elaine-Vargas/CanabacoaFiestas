import { Request, Response } from 'express';
import DecoracionServicio from '../models/DecoracionServicio_model';
import DetalleDecoracion from '../models/DetalleDecoracion_model';
import Evento from '../models/Evento_model';
import { Op, Transaction } from 'sequelize';
import { sequelize } from '../database/database';
import Usuario from '../models/Usuario_model';
import TipoEvento from '../models/TipoEvento_model';

export const createDecoracion = async (req: Request, res: Response) => {
    try {
        const decoracionCompleta = await sequelize.transaction(async (t) => {
            const {
                id_evento,
                tema_decoracion,
                colores_decoracion,
                detalles // Array de detalles de decoración
            } = req.body;

            // Verificar que el evento existe
            const evento = await Evento.findByPk(id_evento, { transaction: t });
            if (!evento) {
                // Lanzamos un error, lo que hará que Sequelize revierta la transacción automáticamente
                throw new Error('Evento no encontrado');
            }

            // Calcular totales asegurando que los valores son números
            const precioneto = detalles.reduce((total: number, elemento: any) => 
                total + (Number(elemento.precio_elemento || 0) * Number(elemento.cantelemento_decoracion || 0)), 0);
            const itbis = precioneto * 0.18; // 18% ITBIS
            const total = precioneto + itbis;

            // Crear el servicio de decoración
            const decoracion = await DecoracionServicio.create({
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
                const detallesPromises = detalles.map((detalle: any) => 
                    DetalleDecoracion.create({
                        id_decoracion: decoracion.id_decoracion,
                        elemento_decoracion: detalle.elemento_decoracion,
                        cantelemento_decoracion: Number(detalle.cantelemento_decoracion || 0),
                        precio_elemento: Number(detalle.precio_elemento || 0),
                        precio_decoracion: Number(detalle.precio_elemento || 0) * Number(detalle.cantelemento_decoracion || 0),
                        estado_detdecoracion: 'Aceptado'
                    }, { transaction: t })
                );
                await Promise.all(detallesPromises);
            }

            // Obtener la decoración con sus detalles dentro de la misma transacción
            const completeDecoracion = await DecoracionServicio.findByPk(decoracion.id_decoracion, {
                include: [
                    {
                        model: DetalleDecoracion,
                        as: 'detalles_decoracion',
                        where: {
                            estado_detdecoracion: 'Aceptado'
                        },
                        required: false
                    },
                    {
                        model: Evento,
                        include: [
                            {
                                model: Usuario,
                                as: 'cliente'
                            },
                            {
                                model: TipoEvento,
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

    } catch (error: any) {
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

export const getAllDecoraciones = async (req: Request, res: Response) => {
    try {
        const decoraciones = await DecoracionServicio.findAll({
            where: {
                estado_decoracion: {
                    [Op.ne]: 'Eliminado'
                }
            },
            include: [
                {
                    model: Evento,
                    as: 'evento',
                    include: [
                        {
                            model: Usuario,
                            as: 'cliente'
                        },
                        {
                            model: TipoEvento,
                            as: 'tipo_evento'
                        }
                    ]
                },
                {
                    model: DetalleDecoracion,
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
    } catch (error: any) {
        console.error('Error al obtener servicios de decoración:', error);
        res.status(500).json({
            error: 'Error al obtener servicios de decoración',
            mensaje: error.message || 'Ocurrió un error al cargar los servicios de decoración' // Mensaje de error más detallado
        });
    }
};

export const getDecoracionesByTema = async (req: Request, res: Response) => {
    try {
        const { tema } = req.params;
        const decoraciones = await DecoracionServicio.findAll({
            where: {
                tema_decoracion: {
                    [Op.like]: `%${tema}%`
                },
                estado_decoracion: {
                    [Op.ne]: 'Eliminado'
                }
            },
            include: [
                {
                    model: DetalleDecoracion,
                    where: {
                        estado_detdecoracion: 'Aceptado'
                    },
                    required: false
                },
                {
                    model: Evento,
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
    } catch (error) {
        console.error('Error al buscar servicios de decoración por tema:', error);
        res.status(500).json({ 
            error: 'Error al buscar servicios de decoración por tema',
            mensaje: 'Ocurrió un error al buscar los servicios de decoración'
        });
    }
};

export const editDecoracion = async (req: Request, res: Response) => {
    const t: Transaction = await sequelize.transaction();
    try {
        const { id_decoracion } = req.params;
        const {
            tema_decoracion,
            precioneto_decoracion,
            itbis_decoracion,
            total_decoracion,
            detalles // Array de detalles actualizados
        } = req.body;

        const decoracion = await DecoracionServicio.findByPk(id_decoracion);
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
            await DetalleDecoracion.update(
                { estado_detdecoracion: 'Cancelado' },
                { 
                    where: { id_decoracion },
                    transaction: t
                }
            );

            // Crear nuevos detalles
            if (detalles.length > 0) {
                const detallesPromises = detalles.map((detalle: any) => 
                    DetalleDecoracion.create({
                        id_decoracion,
                        elemento_decoracion: detalle.elemento_decoracion,
                        cantelemento_decoracion: Number(detalle.cantelemento_decoracion || 0),
                        precio_elemento: Number(detalle.precio_elemento || 0),
                        precio_decoracion: Number(detalle.precio_elemento || 0) * Number(detalle.cantelemento_decoracion || 0),
                        estado_detdecoracion: 'Aceptado'
                    }, { transaction: t })
                );
                await Promise.all(detallesPromises);
            }
        }

        await t.commit();

        // Obtener la decoración actualizada con sus detalles
        const decoracionActualizada = await DecoracionServicio.findByPk(id_decoracion, {
            include: [
                {
                    model: DetalleDecoracion,
                    where: {
                        estado_detdecoracion: 'Aceptado'
                    },
                    required: false
                },
                {
                    model: Evento,
                    as: 'evento'
                }
            ]
        });

        res.json(decoracionActualizada);
    } catch (error) {
        await t.rollback();
        console.error('Error al editar servicio de decoración:', error);
        res.status(500).json({ 
            error: 'Error al editar servicio de decoración',
            mensaje: 'Ocurrió un error al actualizar el servicio de decoración'
        });
    }
};

export const deleteDecoracion = async (req: Request, res: Response) => {
    const t: Transaction = await sequelize.transaction();
    try {
        const { id_decoracion } = req.params;
        const decoracion = await DecoracionServicio.findByPk(id_decoracion);
        
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
        await DetalleDecoracion.update(
            { estado_detdecoracion: 'Cancelado' },
            { 
                where: { id_decoracion },
                transaction: t
            }
        );

        await t.commit();
        res.json({ 
            message: 'Servicio de decoración eliminado correctamente',
            decoracion: decoracion
        });
    } catch (error) {
        await t.rollback();
        console.error('Error al eliminar servicio de decoración:', error);
        res.status(500).json({ 
            error: 'Error al eliminar servicio de decoración',
            mensaje: 'Ocurrió un error al eliminar el servicio de decoración'
        });
    }
};

// Crear un detalle de decoración individual
export const createDetalleDecoracion = async (req: Request, res: Response) => {
    const t: Transaction = await sequelize.transaction();
    try {
        const {
            id_decoracion,
            elemento_decoracion,
            cantelemento_decoracion,
            precio_elemento
        } = req.body;

        // Verificar que la decoración existe
        const decoracion = await DecoracionServicio.findByPk(id_decoracion);
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
        const detalleDecoracion = await DetalleDecoracion.create({
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
        const detalleCompleto = await DetalleDecoracion.findByPk(detalleDecoracion.id_detdecoracion, {
            include: [
                {
                    model: DecoracionServicio,
                    include: [
                        {
                            model: Evento,
                            as: 'evento'
                        }
                    ]
                }
            ]
        });

        res.status(201).json(detalleCompleto);
    } catch (error) {
        await t.rollback();
        console.error('Error al crear detalle de decoración:', error);
        res.status(500).json({ 
            error: 'Error al crear detalle de decoración',
            mensaje: 'Ocurrió un error al procesar el detalle de decoración'
        });
    }
};

// Eliminar un detalle de decoración
export const deleteDetalleDecoracion = async (req: Request, res: Response) => {
    const t: Transaction = await sequelize.transaction();
    try {
        const { id_detalle_decoracion } = req.params;

        const detalle = await DetalleDecoracion.findByPk(id_detalle_decoracion);
        if (!detalle) {
            await t.rollback();
            return res.status(404).json({ 
                error: 'Detalle de decoración no encontrado',
                mensaje: 'El detalle de decoración especificado no existe en el sistema'
            });
        }

        // Obtener la decoración asociada
        const decoracion = await DecoracionServicio.findByPk(detalle.id_decoracion);
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
    } catch (error) {
        await t.rollback();
        console.error('Error al eliminar detalle de decoración:', error);
        res.status(500).json({ 
            error: 'Error al eliminar detalle de decoración',
            mensaje: 'Ocurrió un error al eliminar el detalle de decoración'
        });
    }
};

// Obtener todos los detalles de una decoración específica
export const getDetallesByDecoracion = async (req: Request, res: Response) => {
    try {
        const { id_decoracion } = req.params;

        // Verificar que la decoración existe
        const decoracion = await DecoracionServicio.findByPk(id_decoracion);
        if (!decoracion) {
            return res.status(404).json({ 
                error: 'Servicio de decoración no encontrado',
                mensaje: 'El servicio de decoración especificado no existe en el sistema'
            });
        }

        const detalles = await DetalleDecoracion.findAll({
            where: {
                id_decoracion,
                estado_detdecoracion: 'Aceptado'
            },
            include: [
                {
                    model: DecoracionServicio,
                    include: [
                        {
                            model: Evento,
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
    } catch (error) {
        console.error('Error al obtener detalles de decoración:', error);
        res.status(500).json({ 
            error: 'Error al obtener detalles de decoración',
            mensaje: 'Ocurrió un error al cargar los detalles de decoración'
        });
    }
};

// Obtener todos los detalles de decoración activos
export const getAllDetallesDecoracion = async (req: Request, res: Response) => {
    try {
        const detalles = await DetalleDecoracion.findAll({
            where: {
                estado_detdecoracion: 'Aceptado'
            },
            include: [
                {
                    model: DecoracionServicio,
                    include: [
                        {
                            model: Evento,
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
    } catch (error) {
        console.error('Error al obtener detalles de decoración:', error);
        res.status(500).json({ 
            error: 'Error al obtener detalles de decoración',
            mensaje: 'Ocurrió un error al cargar los detalles de decoración'
        });
    }
};
