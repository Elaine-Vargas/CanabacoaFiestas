import { Request, Response } from 'express';
import Comentario from '../models/Comentario_model';
import Evento from '../models/Evento_model';
import Usuario from '../models/Usuario_model';
import { Op } from 'sequelize';

// Crear un nuevo comentario
export const createComentario = async (req: Request, res: Response) => {
  try {
    const { comentario, calificacion, id_evento } = req.body;

    // Verificar que el evento existe
    const evento = await Evento.findByPk(id_evento);
    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    const nuevoComentario = await Comentario.create({
      comentario,
      calificacion,
      id_evento,
      estado_comentario: 'Activo'
    });

    // Obtener el comentario con sus relaciones
    const comentarioCompleto = await Comentario.findByPk(nuevoComentario.id_comentario, {
      include: [
        {
          model: Evento,
          include: [
            {
              model: Usuario,
              as: 'cliente',
              attributes: ['cedula_usuario', 'nombre_usuario', 'apellido_usuario']
            }
          ]
        }
      ]
    });

    res.status(201).json(comentarioCompleto);
  } catch (error) {
    console.error('Error al crear comentario:', error);
    res.status(500).json({ error: 'Error al crear comentario' });
  }
};

// Obtener todos los comentarios
export const getComentarios = async (req: Request, res: Response) => {
  try {
    const comentarios = await Comentario.findAll({
      where: {
        estado_comentario: {
          [Op.ne]: 'Eliminado'
        }
      },
      include: [
        {
          model: Evento,
          include: [
            {
              model: Usuario,
              as: 'cliente',
              attributes: ['cedula_usuario', 'nombre_usuario', 'apellido_usuario']
            }
          ]
        }
      ]
    });

    // 👇 Aquí puedes inspeccionar lo que trae directamente Sequelize
    console.log('Comentarios obtenidos desde la base de datos:');

    const comentariosTransformados = comentarios.map(comentario => ({
      id_comentario: comentario.id_comentario,
      comentario: comentario.comentario,
      calificacion: comentario.calificacion,
      estado_comentario: comentario.estado_comentario,
      id_evento: comentario.id_evento,
      evento: comentario.evento
        ? {
            cliente: comentario.evento.cliente ?? null
          }
        : null
    }));

    res.json(comentariosTransformados);
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    res.status(500).json({ error: 'Error al obtener comentarios' });
  }
};

// Obtener comentarios por evento
export const getComentariosByEvento = async (req: Request, res: Response) => {
  try {
    const { id_evento } = req.params;

    const comentarios = await Comentario.findAll({
      where: {
        id_evento,
        estado_comentario: {
          [Op.ne]: 'Eliminado'
        }
      },
      include: [
        {
          model: Evento,
          include: [
            {
              model: Usuario,
              as: 'cliente',
              attributes: ['cedula_usuario', 'nombre_usuario', 'apellido_usuario']
            }
          ]
        }
      ]
    });

    if (!comentarios || comentarios.length === 0) {
      return res.status(404).json({ error: 'No se encontraron comentarios para este evento' });
    }

    res.json(comentarios);
  } catch (error) {
    console.error('Error al obtener comentarios del evento:', error);
    res.status(500).json({ error: 'Error al obtener comentarios del evento' });
  }
};

// Obtener comentarios por usuario
export const getComentariosByUsuario = async (req: Request, res: Response) => {
  try {
    const { cedula_usuario } = req.params;

    const comentarios = await Comentario.findAll({
      include: [
        {
          model: Evento,
          where: {
            cedula_cliente: cedula_usuario
          },
          include: [
            {
              model: Usuario,
              as: 'cliente',
              attributes: ['cedula_usuario', 'nombre_usuario', 'apellido_usuario']
            }
          ]
        }
      ],
      where: {
        estado_comentario: {
          [Op.ne]: 'Eliminado'
        }
      }
    });

    if (!comentarios || comentarios.length === 0) {
      return res.status(404).json({ error: 'No se encontraron comentarios para este usuario' });
    }

    res.json(comentarios);
  } catch (error) {
    console.error('Error al obtener comentarios del usuario:', error);
    res.status(500).json({ error: 'Error al obtener comentarios del usuario' });
  }
};

// Editar un comentario
export const editComentario = async (req: Request, res: Response) => {
  try {
    const { id_comentario } = req.params;
    const { comentario, calificacion } = req.body;

    const comentarioExistente = await Comentario.findByPk(id_comentario);
    if (!comentarioExistente) {
      return res.status(404).json({ error: 'Comentario no encontrado' });
    }

    await comentarioExistente.update({
      comentario: comentario || comentarioExistente.comentario,
      calificacion: calificacion || comentarioExistente.calificacion,
      estado_comentario: 'Editado'
    });

    // Obtener el comentario actualizado con sus relaciones
    const comentarioActualizado = await Comentario.findByPk(id_comentario, {
      include: [
        {
          model: Evento,
          include: [
            {
              model: Usuario,
              as: 'cliente',
              attributes: ['cedula_usuario', 'nombre_usuario', 'apellido_usuario']
            }
          ]
        }
      ]
    });

    res.json(comentarioActualizado);
  } catch (error) {
    console.error('Error al editar comentario:', error);
    res.status(500).json({ error: 'Error al editar comentario' });
  }
};

// Eliminar lógicamente un comentario
export const deleteComentario = async (req: Request, res: Response) => {
  try {
    const { id_comentario } = req.params;

    const comentario = await Comentario.findByPk(id_comentario);
    if (!comentario) {
      return res.status(404).json({ error: 'Comentario no encontrado' });
    }

    await comentario.update({
      estado_comentario: 'Eliminado'
    });

    res.json({ message: 'Comentario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    res.status(500).json({ error: 'Error al eliminar comentario' });
  }
};

