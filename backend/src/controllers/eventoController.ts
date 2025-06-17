import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Evento from '../models/Evento_model';
import Usuario from '../models/Usuario_model';
import TipoEvento from '../models/TipoEvento_model';
import Direccion from '../models/Direccion_model';
import Ciudad from '../models/Ciudad_model';
import Provincia from '../models/Provincia_model';
import EmpleadoEvento from '../models/EmpleadoEvento_model';
 
export const createEvent = async (req: Request, res: Response) => {
    try {
        const {
            cedula_cliente,
            cedula_asesor,
            fecha_evento,
            hora_evento,
            id_tipo_evento,
            id_provincia,
            id_ciudad,
            sector,
            calle,
            detalles,
            espacio_evento,
            estado_solicitud,
            desea_supervision,
            nota_cliente
        } = req.body;

        console.log('Datos recibidos:', req.body);

        // Verificar roles
        const cliente = await Usuario.findOne({ where: { cedula_usuario: cedula_cliente, id_rol: 2 } });
        if (!cliente) {
            return res.status(400).json({ 
                error: 'Cliente no válido',
                mensaje: 'El cliente no existe o no tiene el rol correcto'
            });
        }

        let asesor = null;
        if (cedula_asesor) {
            asesor = await Usuario.findOne({ where: { cedula_usuario: cedula_asesor, id_rol: 3 } });
            if (!asesor) {
                return res.status(400).json({ 
                    error: 'Asesor no válido',
                    mensaje: 'El asesor no existe o no tiene el rol correcto'
                });
            }
        }

        // Verificar que el tipo de evento existe
        const tipoEvento = await TipoEvento.findByPk(id_tipo_evento);
        if (!tipoEvento) {
            return res.status(400).json({
                error: 'Tipo de evento no válido',
                mensaje: 'El tipo de evento seleccionado no existe'
            });
        }

        // Verificar que la ciudad existe y pertenece a la provincia
        const ciudad = await Ciudad.findOne({
            where: {
                id_ciudad,
                id_provincia
            }
        });

        if (!ciudad) {
            return res.status(400).json({
                error: 'Ciudad no válida',
                mensaje: 'La ciudad seleccionada no existe o no pertenece a la provincia seleccionada'
            });
        }

        // Crear la dirección
        const direccion = await Direccion.create({
            id_ciudad,
            sector,
            calle,
            detalles: detalles || null
        });

        console.log('Dirección creada:', direccion.toJSON());

        // Crear el evento
        const evento = await Evento.create({
            cedula_cliente,
            cedula_asesor: cedula_asesor || null,
            fecha_evento,
            hora_evento,
            id_tipo_evento,
            id_direccion: direccion.id_direccion,
            espacio_evento,
            estado_solicitud: estado_solicitud || 'Pendiente',
            desea_supervision: desea_supervision || false,
            nota_cliente: nota_cliente || null,
            subtotal_evento: 0,
            itbis_evento: 0,
            total_evento: 0
        });

        console.log('Evento creado:', evento.toJSON());

        // Obtener el evento con sus relaciones
        const eventoCompleto = await Evento.findByPk(evento.id_evento, {
            include: [
                {
                    model: Usuario,
                    as: 'cliente', // Asegúrate que este es el alias correcto
                    attributes: ['cedula_usuario', 'nombre_usuario', 'apellido_usuario']
                },
                {
                    model: Usuario,
                    as: 'asesor', // Asegúrate que este es el alias correcto
                    attributes: ['cedula_usuario', 'nombre_usuario', 'apellido_usuario']
                },
                {
                    model: TipoEvento,
                    attributes: ['id_tipo_evento', 'tipo_evento']
                },
                {
                    model: Direccion,
                    include: [
                        {
                            model: Ciudad,
                            include: [
                                {
                                    model: Provincia,
                                    attributes: ['id_provincia', 'nombre_provincia']
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        if (!eventoCompleto) {
            throw new Error('Error al recuperar el evento creado');
        }

        res.status(201).json({
            mensaje: 'Evento creado exitosamente',
            evento: eventoCompleto
        });
    } catch (error) {
        console.error('Error detallado al crear evento:', error);
        res.status(500).json({
            error: 'Error al crear evento',
            mensaje: error instanceof Error ? error.message : 'Ocurrió un error al crear el evento'
        });
    }
};

export const showAllEvents = async (req: Request, res: Response) => {
    try {
        const eventos = await Evento.findAll({
            include: [
                { 
                    model: Usuario, 
                    as: 'cliente', // Asegúrate que este es el alias correcto
                    attributes: ['nombre_usuario', 'apellido_usuario']
                },
                { 
                    model: Usuario, 
                    as: 'asesor', // Asegúrate que este es el alias correcto
                    attributes: ['nombre_usuario', 'apellido_usuario']
                },
                { 
                    model: TipoEvento, 
                    attributes: ['tipo_evento']
                },
                {
                    model: Direccion,
                    include: [
                        {
                            model: Ciudad,
                            include: [
                                {
                                    model: Provincia,
                                    attributes: ['nombre_provincia']
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        if (!eventos || eventos.length === 0) {
            return res.status(404).json({ 
                error: 'No se encontraron eventos',
                mensaje: 'No hay eventos registrados en el sistema'
            });
        }

        res.json(eventos);
    } catch (error) {
        console.error('Error al obtener eventos:', error);
        res.status(500).json({ 
            error: 'Error al obtener los eventos',
            mensaje: 'Ocurrió un error al cargar los eventos'
        });
    }
};

export const showEventsByStatus = async (req: Request, res: Response) => {
    try {
        const { estado } = req.params;
        const eventos = await Evento.findAll({
            where: { estado_solicitud: estado },
            include: [
                { model: Usuario, as: 'cliente' }, // Asegúrate que este es el alias correcto
                { model: Usuario, as: 'asesor' }, // Asegúrate que este es el alias correcto
                { model: TipoEvento, as: 'tipo_evento' } // Asegúrate que este es el alias correcto
            ]
        });

        if (!eventos || eventos.length === 0) {
            return res.status(404).json({ 
                error: 'No se encontraron eventos',
                mensaje: `No hay eventos registrados con el estado: ${estado}`
            });
        }

        res.json(eventos);
    } catch (error) {
        console.error('Error al obtener eventos por estado:', error);
        res.status(500).json({ 
            error: 'Error al obtener los eventos por estado',
            mensaje: 'Ocurrió un error al cargar los eventos'
        });
    }
};

export const showEventsByClient = async (req: Request, res: Response) => {
    try {
        const { cedula_cliente } = req.params;
        const eventos = await Evento.findAll({
            where: { cedula_cliente },
            include: [
                { model: Usuario, as: 'cliente' }, // Asegúrate que este es el alias correcto
                { model: Usuario, as: 'asesor' }, // Asegúrate que este es el alias correcto
                { model: TipoEvento, as: 'tipo_evento' } // Asegúrate que este es el alias correcto
            ]
        });

        if (!eventos || eventos.length === 0) {
            return res.status(404).json({ 
                error: 'No se encontraron eventos',
                mensaje: `No hay eventos registrados para el cliente con cédula: ${cedula_cliente}`
            });
        }

        res.json(eventos);
    } catch (error) {
        console.error('Error al obtener eventos del cliente:', error);
        res.status(500).json({ 
            error: 'Error al obtener los eventos del cliente',
            mensaje: 'Ocurrió un error al cargar los eventos'
        });
    }
};

export const showEventsByAsesor = async (req: Request, res: Response) => {
    try {
        const { cedula_asesor } = req.params;
        const eventos = await Evento.findAll({
            where: { cedula_asesor },
            include: [
                { model: Usuario, as: 'cliente' }, // Asegúrate que este es el alias correcto
                { model: Usuario, as: 'asesor' }, // Asegúrate que este es el alias correcto
                { model: TipoEvento, as: 'tipo_evento' } // Asegúrate que este es el alias correcto
            ]
        });

        if (!eventos || eventos.length === 0) {
            return res.status(404).json({ 
                error: 'No se encontraron eventos',
                mensaje: `No hay eventos registrados para el asesor con cédula: ${cedula_asesor}`
            });
        }

        res.json(eventos);
    } catch (error) {
        console.error('Error al obtener eventos del asesor:', error);
        res.status(500).json({ 
            error: 'Error al obtener los eventos del asesor',
            mensaje: 'Ocurrió un error al cargar los eventos'
        });
    }
};

export const editEvent = async (req: Request, res: Response) => {
    try {
        const { id_evento } = req.params;
        const {
            cedula_cliente,
            cedula_asesor,
            fecha_evento,
            hora_evento,
            id_direccion,
            espacio_evento,
            id_tipo_evento,
            desea_supervision,
            nota_cliente,
            estado_solicitud,
        } = req.body;

        console.log('Datos recibidos para editar evento:', {
            id_evento,
            cedula_cliente,
            cedula_asesor,
            fecha_evento,
            hora_evento,
            id_direccion,
            espacio_evento,
            id_tipo_evento,
            desea_supervision,
            nota_cliente,
            estado_solicitud,
        });

        // Verificar roles si se están actualizando
        if (cedula_cliente) {
            const cliente = await Usuario.findOne({ where: { cedula_usuario: cedula_cliente, id_rol: 2 } });
            if (!cliente) {
                return res.status(400).json({ 
                    error: 'Cliente no válido',
                    mensaje: 'El cliente no existe o no tiene el rol correcto'
                });
            }
        }

        if (cedula_asesor) {
            const asesor = await Usuario.findOne({ where: { cedula_usuario: cedula_asesor, id_rol: 3 } });
            if (!asesor) {
                return res.status(400).json({ 
                    error: 'Asesor no válido',
                    mensaje: 'El asesor no existe o no tiene el rol correcto'
                });
            }
        }

        const evento = await Evento.findByPk(id_evento);
        if (!evento) {
            return res.status(404).json({ 
                error: 'Evento no encontrado',
                mensaje: 'No se encontró el evento solicitado'
            });
        }

        // Validar que los campos obligatorios no sean nulos
        const datosActualizados = {
            cedula_cliente: cedula_cliente || evento.cedula_cliente,
            cedula_asesor: cedula_asesor || evento.cedula_asesor,
            fecha_evento: fecha_evento || evento.fecha_evento,
            hora_evento: hora_evento || evento.hora_evento,
            id_direccion: id_direccion || evento.id_direccion,
            espacio_evento: espacio_evento || evento.espacio_evento,
            id_tipo_evento: id_tipo_evento || evento.id_tipo_evento,
            estado_solicitud: estado_solicitud || evento.estado_solicitud,
            desea_supervision: desea_supervision !== undefined ? desea_supervision : evento.desea_supervision,
            nota_cliente: nota_cliente !== undefined ? nota_cliente : evento.nota_cliente,
        };

        // Validar que los campos obligatorios no sean nulos
        if (!datosActualizados.cedula_cliente) {
            return res.status(400).json({
                error: 'Cliente requerido',
                mensaje: 'El cliente es un campo obligatorio'
            });
        }

        if (!datosActualizados.fecha_evento) {
            return res.status(400).json({
                error: 'Fecha requerida',
                mensaje: 'La fecha del evento es un campo obligatorio'
            });
        }

        if (!datosActualizados.hora_evento) {
            return res.status(400).json({
                error: 'Hora requerida',
                mensaje: 'La hora del evento es un campo obligatorio'
            });
        }

        if (!datosActualizados.id_tipo_evento) {
            return res.status(400).json({
                error: 'Tipo de evento requerido',
                mensaje: 'El tipo de evento es un campo obligatorio'
            });
        }

        if (!datosActualizados.id_direccion) {
            return res.status(400).json({
                error: 'Dirección requerida',
                mensaje: 'La dirección es un campo obligatorio'
            });
        }

        if (!datosActualizados.espacio_evento) {
            return res.status(400).json({
                error: 'Espacio requerido',
                mensaje: 'El espacio del evento es un campo obligatorio'
            });
        }

        console.log('Evento encontrado:', evento.toJSON());
        console.log('Datos a actualizar:', datosActualizados);

        await evento.update(datosActualizados);

        res.json(evento);
    } catch (error) {
        console.error('Error detallado al editar evento:', error);
        res.status(500).json({ 
            error: 'Error al editar el evento',
            mensaje: error instanceof Error ? error.message : 'Ocurrió un error al actualizar el evento'
        });
    }
};

export const deleteEvent = async (req: Request, res: Response) => {
    try {
        const { id_evento } = req.params;
        const evento = await Evento.findByPk(id_evento);
        
        if (!evento) {
            return res.status(404).json({ 
                error: 'Evento no encontrado',
                mensaje: 'No se encontró el evento solicitado'
            });
        }

        await evento.update({
            estado_solicitud: 'Cancelado'
        });

        res.json({ 
            error: null,
            mensaje: 'Evento cancelado correctamente'
        });
    } catch (error) {
        console.error('Error al cancelar evento:', error);
        res.status(500).json({ 
            error: 'Error al cancelar el evento',
            mensaje: 'Ocurrió un error al cancelar el evento'
        });
    }
};

export const getTiposEventos = async (req: Request, res: Response) => {
    try {
      console.log('Intentando obtener tipos de evento...');
      const tipoevento = await TipoEvento.findAll({
      });
  
      if (!tipoevento || tipoevento.length === 0) {
        console.log('No se encontraron tipos de eventos');
        return res.status(404).json({ 
          error: 'No se encontraron tipos de eventos',
          mensaje: 'No hay tipos de eventos disponibles'
        });
      }
  
      res.json(tipoevento);
    } catch (error) {
      console.error('Error detallado al obtener tipos de eventos:', error);
      res.status(500).json({ 
        error: 'Error al obtener los tipos de eventos',
        mensaje: 'Ocurrió un error al cargar los tipos de eventos. Por favor, intente más tarde.'
      });
    }
  };

//empleado-evento APIs
export const assignEmployeeToEvent = async (req: Request, res: Response) => {
    try {
        const { id_evento, empleado_evento, puesto_evento } = req.body;
        console.log('Datos recibidos en el controlador:', { id_evento, empleado_evento, puesto_evento });

        if (!id_evento || !empleado_evento || !puesto_evento) {
            return res.status(400).json({
                error: 'Datos incompletos',
                mensaje: 'Faltan datos requeridos para la asignación'
            });
        }

        // Verificar que el evento existe
        const evento = await Evento.findByPk(id_evento);
        if (!evento) {
            console.log('Evento no encontrado:', id_evento);
            return res.status(404).json({
                error: 'Evento no encontrado',
                mensaje: 'El evento especificado no existe'
            });
        }

        // Verificar que el empleado existe y tiene rol de empleado (id_rol: 3)
        const empleado = await Usuario.findOne({
            where: { cedula_usuario: empleado_evento, id_rol: 3 }
        });
        if (!empleado) {
            console.log('Empleado no encontrado o rol incorrecto:', empleado_evento);
            return res.status(404).json({
                error: 'Empleado no encontrado',
                mensaje: 'El empleado especificado no existe o no tiene el rol correcto'
            });
        }

        // Verificar si el empleado ya está asignado al evento
        const existingAssignment = await EmpleadoEvento.findOne({
            where: { 
                id_evento: id_evento,
                empleado_evento: empleado_evento,
                estado_empevento: 'Activo'
            },
            attributes: ['id_evento', 'empleado_evento', 'puesto_evento']
        });
        if (existingAssignment) {
            console.log('Asignación duplicada encontrada:', { id_evento, empleado_evento });
            return res.status(400).json({
                error: 'Asignación duplicada',
                mensaje: 'Este empleado ya está asignado a este evento'
            });
        }

        // Validar que el puesto_evento sea válido
        const puestosValidos = ['Decorador', 'Camarero', 'Conductor', 'Supervisor', 'Encargado de Logística', 'Encargado de Limpieza'];
        if (!puestosValidos.includes(puesto_evento)) {
            console.log('Puesto inválido:', puesto_evento);
            return res.status(400).json({
                error: 'Puesto inválido',
                mensaje: 'El puesto especificado no es válido'
            });
        }

        console.log('Creando nueva asignación...');
        const empleadoEvento = await EmpleadoEvento.create({
            id_evento,
            empleado_evento,
            puesto_evento,
            estado_empevento: 'Activo'
        }, {
            fields: ['id_evento', 'empleado_evento', 'puesto_evento', 'estado_empevento']
        });
        console.log('Asignación creada exitosamente:', empleadoEvento);

        res.status(201).json(empleadoEvento);
    } catch (error) {
        console.error('Error detallado al asignar empleado al evento:', error);
        throw error;
    }
};

export const getEventEmployees = async (req: Request, res: Response) => {
    try {
        const { id_evento } = req.params;

        const empleados = await EmpleadoEvento.findAll({
            where: { 
                id_evento,
                estado_empevento: 'Activo'
            },
            include: [
                { model: Usuario, as: 'empleado' } // Asegúrate que este es el alias correcto
            ]
        });

        if (!empleados || empleados.length === 0) {
            return res.status(404).json({
                error: 'No se encontraron empleados',
                mensaje: 'No hay empleados asignados a este evento'
            });
        }

        res.json(empleados);
    } catch (error) {
        console.error('Error al obtener empleados del evento:', error);
        res.status(500).json({
            error: 'Error al obtener empleados',
            mensaje: 'Ocurrió un error al cargar los empleados del evento'
        });
    }
};

export const getEmployeeEvents = async (req: Request, res: Response) => {
    try {
        const { id_empleado } = req.params; // Cédula del empleado logueado
        console.log('Buscando eventos donde el empleado', id_empleado, 'ha participado.');

        const eventos = await EmpleadoEvento.findAll({
            where: {
                empleado_evento: id_empleado, // El empleado es el que participa en el evento
                estado_empevento: 'Activo'
            },
            include: [
                {
                    model: Evento,
                    as: 'evento',
                    include: [
                        { model: Usuario, as: 'cliente', attributes: ['nombre_usuario', 'apellido_usuario'] },
                        { model: Usuario, as: 'asesor', attributes: ['nombre_usuario', 'apellido_usuario'] },
                        { model: TipoEvento, as: 'tipo_evento', attributes: ['tipo_evento'] },
                    ]
                },
                {
                    model: Usuario,
                    as: 'empleado', // El empleado que participa
                    attributes: ['cedula_usuario', 'nombre_usuario', 'apellido_usuario']
                }
            ],
            order: [[{ model: Evento, as: 'evento' }, 'fecha_evento', 'DESC']]
        });

        console.log('Eventos participados encontrados para', id_empleado + ':', eventos.length);

        if (!eventos || eventos.length === 0) {
            console.log('No se encontraron participaciones de eventos para el empleado', id_empleado);
            return res.status(404).json({
                error: 'No se encontraron participaciones',
                mensaje: 'No hay eventos donde este empleado ha participado.'
            });
        }

        res.json(eventos);
    } catch (error) {
        console.error('Error al obtener participaciones del empleado:', error);
        res.status(500).json({
            error: 'Error al obtener participaciones',
            mensaje: 'Ocurrió un error al cargar las participaciones del empleado.'
        });
    }
};

export const getAsesorTeamAssignments = async (req: Request, res: Response) => {
    try {
        const { cedula_asesor } = req.params; // Cédula del empleado logueado (asesor)
        console.log('Buscando asignaciones de equipo para eventos donde el asesor es:', cedula_asesor);

        const asignaciones = await EmpleadoEvento.findAll({
            where: {
                estado_empevento: 'Activo' // Asignaciones activas
            },
            include: [
                {
                    model: Evento,
                    as: 'evento',
                    where: {
                        cedula_asesor: cedula_asesor // Filtra por eventos donde este empleado es el asesor
                    },
                    required: true, // Solo incluye si el evento cumple la condición
                    include: [
                        { model: Usuario, as: 'cliente', attributes: ['nombre_usuario', 'apellido_usuario'] },
                        { model: TipoEvento, as: 'tipo_evento', attributes: ['tipo_evento'] },
                    ]
                },
                {
                    model: Usuario,
                    as: 'empleado', // El empleado que está asignado a la tarea
                    attributes: ['cedula_usuario', 'nombre_usuario', 'apellido_usuario']
                }
            ],
            order: [[{ model: Evento, as: 'evento' }, 'fecha_evento', 'DESC']]
        });

        console.log('Asignaciones de equipo encontradas para eventos asesorados por', cedula_asesor + ':', asignaciones.length);

        if (!asignaciones || asignaciones.length === 0) {
            console.log('No se encontraron asignaciones de equipo para eventos donde el empleado es asesor para', cedula_asesor);
            return res.status(404).json({
                error: 'No se encontraron asignaciones de equipo',
                mensaje: 'No hay empleados asignados a eventos donde este empleado es el asesor.'
            });
        }

        res.json(asignaciones);
    } catch (error) {
        console.error('Error al obtener asignaciones de equipo del asesor:', error);
        res.status(500).json({
            error: 'Error al obtener asignaciones de equipo',
            mensaje: 'Ocurrió un error al cargar las asignaciones de equipo para el asesor.'
        });
    }
};

export const updateEmployeeRole = async (req: Request, res: Response) => {
    try {
        const { id_evento, empleado_evento } = req.params;
        const { puesto_evento } = req.body;

        const empleadoEvento = await EmpleadoEvento.findOne({
            where: { 
                id_evento, 
                empleado_evento,
                estado_empevento: 'Activo'
            }
        });

        if (!empleadoEvento) {
            return res.status(404).json({
                error: 'Asignación no encontrada',
                mensaje: 'No se encontró la asignación del empleado al evento'
            });
        }

        await empleadoEvento.update({ puesto_evento });

        res.json(empleadoEvento);
    } catch (error) {
        console.error('Error al actualizar rol del empleado:', error);
        res.status(500).json({
            error: 'Error al actualizar rol',
            mensaje: 'Ocurrió un error al actualizar el rol del empleado'
        });
    }
};

export const removeEmployeeFromEvent = async (req: Request, res: Response) => {
    try {
        const { id_evento, empleado_evento } = req.params;

        const asignacion = await EmpleadoEvento.findOne({
            where: {
                id_evento: id_evento,
                empleado_evento: empleado_evento
            }
        });

        if (!asignacion) {
            return res.status(404).json({
                error: 'Asignación no encontrada',
                mensaje: 'No se encontró la asignación de empleado para este evento.'
            });
        }

        await asignacion.destroy(); // Borrado lógico o físico según tu modelo

        res.status(200).json({ mensaje: 'Empleado removido del evento exitosamente.' });

    } catch (error) {
        console.error('Error al remover empleado del evento:', error);
        res.status(500).json({
            error: 'Error al remover empleado del evento',
            mensaje: error instanceof Error ? error.message : 'Ocurrió un error al remover el empleado del evento.'
        });
    }
};

export const updateEmployeeAssignmentStatus = async (req: Request, res: Response) => {
    try {
        const { id_evento, empleado_evento } = req.params;
        const { estado_empevento } = req.body;

        const asignacion = await EmpleadoEvento.findOne({
            where: {
                id_evento: id_evento,
                empleado_evento: empleado_evento
            }
        });

        if (!asignacion) {
            return res.status(404).json({
                error: 'Asignación no encontrada',
                mensaje: 'No se encontró la asignación de empleado para este evento.'
            });
        }

        asignacion.estado_empevento = estado_empevento;
        await asignacion.save();

        res.json({
            mensaje: 'Estado de asignación actualizado exitosamente',
            asignacion: asignacion
        });

    } catch (error) {
        console.error('Error al actualizar estado de asignación de empleado:', error);
        res.status(500).json({
            error: 'Error al actualizar estado de asignación',
            mensaje: error instanceof Error ? error.message : 'Ocurrió un error al actualizar el estado de la asignación.'
        });
    }
};

export const updateEventStatus = async (req: Request, res: Response) => {
  try {
    const { id_evento } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({
        error: 'Estado requerido',
        mensaje: 'Se requiere especificar el nuevo estado del evento'
      });
    }

    const evento = await Evento.findByPk(id_evento);

    if (!evento) {
      return res.status(404).json({
        error: 'Evento no encontrado',
        mensaje: `No existe un evento con el ID: ${id_evento}`
      });
    }

    await evento.update({ estado_solicitud: estado });

    res.json({
      mensaje: 'Estado del evento actualizado exitosamente',
      evento: {
        id_evento: evento.id_evento,
        estado_solicitud: evento.estado_solicitud
      }
    });

  } catch (error) {
    console.error('Error al actualizar estado del evento:', error);
    res.status(500).json({
      error: 'Error al actualizar estado del evento',
      mensaje: 'Ocurrió un error al actualizar el estado del evento'
    });
  }
};

// Obtener todos los empleados asignados a los eventos de un cliente, filtrable por estado, evento y puesto
export const getEmpleadosByClienteEventos = async (req: Request, res: Response) => {
  try {
    const { cedula_cliente } = req.params;
    const { estado_empevento, id_evento, puesto_evento } = req.query;

    // Buscar todos los eventos del cliente
    const eventos = await Evento.findAll({
      where: { cedula_cliente },
      attributes: ['id_evento', 'fecha_evento', 'hora_evento', 'espacio_evento', 'estado_solicitud'],
    });
    const eventosIds = eventos.map(e => e.id_evento);
    if (eventosIds.length === 0) {
      return res.status(200).json([]); // No hay eventos, devolver array vacío
    }

    // Construir filtros dinámicos
    const empleadoEventoWhere: any = {
      id_evento: id_evento ? id_evento : { [Op.in]: eventosIds }
    };
    if (estado_empevento) empleadoEventoWhere.estado_empevento = estado_empevento;
    if (puesto_evento) empleadoEventoWhere.puesto_evento = puesto_evento;

    // Buscar empleados asignados a los eventos del cliente
    const empleadosAsignados = await EmpleadoEvento.findAll({
      where: empleadoEventoWhere,
      include: [
        {
          model: Usuario,
          as: 'empleado',
          attributes: ['cedula_usuario', 'nombre_usuario', 'apellido_usuario']
        },
        {
          model: Evento,
          as: 'evento',
          attributes: ['id_evento', 'fecha_evento', 'hora_evento', 'espacio_evento', 'estado_solicitud'],
        }
      ],
      order: [[{ model: Evento, as: 'evento' }, 'fecha_evento', 'DESC']]
    });

    res.json(empleadosAsignados);
  } catch (error) {
    console.error('Error al obtener empleados de los eventos del cliente:', error);
    res.status(500).json({
      error: 'Error al obtener empleados de los eventos del cliente',
      mensaje: 'Ocurrió un error al cargar los empleados asignados a los eventos del cliente.'
    });
  }
};


