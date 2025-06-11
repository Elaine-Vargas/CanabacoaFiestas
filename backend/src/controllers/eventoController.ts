import { Request, Response } from 'express';
import Evento from '../models/Evento_model';
import Usuario from '../models/Usuario_model';
import { Op } from 'sequelize';
import TipoEvento from '../models/TipoEvento_model';
import EmpleadoEvento from '../models/EmpleadoEvento_model';
import Direccion from '../models/Direccion_model';
import Ciudad from '../models/Ciudad_model';
import Provincia from '../models/Provincia_model';
 
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
                    as: 'cliente',
                    attributes: ['cedula_usuario', 'nombre_usuario', 'apellido_usuario']
                },
                {
                    model: Usuario,
                    as: 'asesor',
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
                    as: 'cliente',
                    attributes: ['nombre_usuario', 'apellido_usuario']
                },
                { 
                    model: Usuario, 
                    as: 'asesor',
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
                { model: Usuario, as: 'cliente' },
                { model: Usuario, as: 'asesor' },
                { model: TipoEvento, as: 'tipo_evento' }
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
                { model: Usuario, as: 'cliente' },
                { model: Usuario, as: 'asesor' },
                { model: TipoEvento, as: 'tipo_evento' }
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
                { model: Usuario, as: 'cliente' },
                { model: Usuario, as: 'asesor' },
                { model: TipoEvento, as: 'tipo_evento' }
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
            subtotal_evento,
            itbis_evento,
            total_evento
        } = req.body;

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

        await evento.update({
            cedula_cliente: cedula_cliente || evento.cedula_cliente,
            cedula_asesor: cedula_asesor || evento.cedula_asesor,
            fecha_evento: fecha_evento || evento.fecha_evento,
            hora_evento: hora_evento || evento.hora_evento,
            id_direccion: id_direccion || evento.id_direccion,
            espacio_evento: espacio_evento || evento.espacio_evento,
            id_tipo_evento: id_tipo_evento || evento.id_tipo_evento,
            estado_solicitud: estado_solicitud || evento.estado_solicitud,
            desea_supervision: desea_supervision !== undefined ? desea_supervision : evento.desea_supervision,
            nota_cliente: nota_cliente || evento.nota_cliente,
            subtotal_evento: subtotal_evento || evento.subtotal_evento,
            itbis_evento: itbis_evento || evento.itbis_evento,
            total_evento: total_evento || evento.total_evento
        });

        res.json(evento);
    } catch (error) {
        console.error('Error al editar evento:', error);
        res.status(500).json({ 
            error: 'Error al editar el evento',
            mensaje: 'Ocurrió un error al actualizar el evento'
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
                empleado_evento: empleado_evento
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
            puesto_evento
        }, {
            fields: ['id_evento', 'empleado_evento', 'puesto_evento']
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
            where: { id_evento },
            include: [
                { model: Usuario, as: 'empleado' }
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

export const updateEmployeeRole = async (req: Request, res: Response) => {
    try {
        const { id_evento, empleado_evento } = req.params;
        const { puesto_evento } = req.body;

        const empleadoEvento = await EmpleadoEvento.findOne({
            where: { id_evento, empleado_evento }
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

        const empleadoEvento = await EmpleadoEvento.findOne({
            where: { id_evento, empleado_evento }
        });

        if (!empleadoEvento) {
            return res.status(404).json({
                error: 'Asignación no encontrada',
                mensaje: 'No se encontró la asignación del empleado al evento'
            });
        }

        await empleadoEvento.destroy();

        res.json({
            error: null,
            mensaje: 'Empleado removido del evento correctamente'
        });
    } catch (error) {
        console.error('Error al remover empleado del evento:', error);
        res.status(500).json({
            error: 'Error al remover empleado',
            mensaje: 'Ocurrió un error al remover el empleado del evento'
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

  
