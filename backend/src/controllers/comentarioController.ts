import { Request, Response } from 'express';
import Comentario from '../models/Comentario_model';
import Evento from '../models/Evento_model';
import Usuario from '../models/Usuario_model';
import { Op } from 'sequelize';

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
    comentarios.forEach(c => {
      console.log({
        id: c.id_comentario,
        calificacion: c.calificacion,
        comentario: c.comentario,
        cliente: c.evento?.cliente?.nombre_usuario
      });
    });

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

