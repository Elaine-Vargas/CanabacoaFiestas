import { Request, Response } from 'express';
import Comentario from '../models/Comentario_model';
import Evento from '../models/Evento_model';
import Usuario from '../models/Usuario_model';
import { Op } from 'sequelize';

export const getComentarios = async (req: Request, res: Response) => {
    try {
      const comentarios = await Comentario.findAll({
        include: [
          {
            model: Evento,
            include: [{
              model: Usuario,
              as: 'cliente', // Usamos el alias 'cliente' definido en el modelo Evento
              attributes: ['nombre_usuario', 'apellido_usuario']
            }]
          }
        ],
        where: {
          estado_comentario: {
            [Op.ne]: 'Eliminado'
          }
        },
        raw: true, // Para obtener objetos planos
        nest: true // Para anidar correctamente las relaciones
      });
  
      // Transformamos la estructura para facilitar el acceso en el frontend
      const comentariosTransformados = comentarios.map(comentario => ({
        ...comentario,
        usuario: comentario.evento?.cliente // Accedemos al cliente a través del evento
      }));
  
      res.json(comentariosTransformados);
    } catch (error) {
      console.error('Error al obtener comentarios:', error);
      res.status(500).json({ error: 'Error al obtener comentarios' });
    }
  };