import { Request, Response } from 'express';
import Espacio from '../models/Espacio_model';
import Direccion from '../models/Direccion_model';
import { Op } from 'sequelize';

// Crear un nuevo espacio
export const createEspacio = async (req: Request, res: Response) => {
  try {
    const {
      nombre_espacio,
      tel_espacio,
      id_direccion,
      estado_espacio
    } = req.body;

    // Verificar que la dirección existe
    const direccion = await Direccion.findByPk(id_direccion);
    if (!direccion) {
      return res.status(404).json({ error: 'Dirección no encontrada' });
    }

    // Crear el espacio
    const espacio = await Espacio.create({
      nombre_espacio,
      tel_espacio,
      id_direccion,
      estado_espacio: estado_espacio || 'Activo'
    });

    // Obtener el espacio con su dirección
    const espacioCompleto = await Espacio.findByPk(espacio.id_espacio, {
      include: [
        {
          model: Direccion
        }
      ]
    });

    res.status(201).json(espacioCompleto);
  } catch (error) {
    console.error('Error al crear espacio:', error);
    res.status(500).json({ error: 'Error al crear espacio' });
  }
};

// Obtener todos los espacios
export const getEspacios = async (req: Request, res: Response) => {
  try {
    const espacios = await Espacio.findAll({
      include: [
        {
          model: Direccion
        }
      ],
      where: {
        estado_espacio: {
          [Op.ne]: 'Eliminado'
        }
      }
    });

    res.json(espacios);
  } catch (error) {
    console.error('Error al obtener espacios:', error);
    res.status(500).json({ error: 'Error al obtener espacios' });
  }
};

// Buscar espacios por nombre
export const searchEspacios = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Se requiere un término de búsqueda' });
    }

    const espacios = await Espacio.findAll({
      where: {
        [Op.and]: [
          {
            nombre_espacio: { [Op.like]: `%${query}%` }
          },
          {
            estado_espacio: {
              [Op.ne]: 'Eliminado'
            }
          }
        ]
      },
      include: [
        {
          model: Direccion
        }
      ]
    });

    res.json(espacios);
  } catch (error) {
    console.error('Error al buscar espacios:', error);
    res.status(500).json({ error: 'Error al buscar espacios' });
  }
};

// Obtener un espacio por ID
export const getEspacioById = async (req: Request, res: Response) => {
  try {
    const { id_espacio } = req.params;

    const espacio = await Espacio.findByPk(id_espacio, {
      include: [
        {
          model: Direccion
        }
      ]
    });

    if (!espacio) {
      return res.status(404).json({ error: 'Espacio no encontrado' });
    }

    if (espacio.estado_espacio === 'Eliminado') {
      return res.status(404).json({ error: 'Espacio no encontrado' });
    }

    res.json(espacio);
  } catch (error) {
    console.error('Error al obtener espacio:', error);
    res.status(500).json({ error: 'Error al obtener espacio' });
  }
};

// Editar un espacio
export const editEspacio = async (req: Request, res: Response) => {
  try {
    const { id_espacio } = req.params;
    const {
      nombre_espacio,
      tel_espacio,
      id_direccion,
      estado_espacio
    } = req.body;

    const espacio = await Espacio.findByPk(id_espacio);
    if (!espacio) {
      return res.status(404).json({ error: 'Espacio no encontrado' });
    }

    if (espacio.estado_espacio === 'Eliminado') {
      return res.status(404).json({ error: 'Espacio no encontrado' });
    }

    // Verificar que la dirección existe si se proporciona
    if (id_direccion) {
      const direccion = await Direccion.findByPk(id_direccion);
      if (!direccion) {
        return res.status(404).json({ error: 'Dirección no encontrada' });
      }
    }

    // Actualizar el espacio
    await espacio.update({
      nombre_espacio: nombre_espacio || espacio.nombre_espacio,
      tel_espacio: tel_espacio || espacio.tel_espacio,
      id_direccion: id_direccion || espacio.id_direccion,
      estado_espacio: estado_espacio || espacio.estado_espacio
    });

    // Obtener el espacio actualizado con su dirección
    const espacioActualizado = await Espacio.findByPk(id_espacio, {
      include: [
        {
          model: Direccion
        }
      ]
    });

    res.json(espacioActualizado);
  } catch (error) {
    console.error('Error al editar espacio:', error);
    res.status(500).json({ error: 'Error al editar espacio' });
  }
};

// Eliminar lógicamente un espacio
export const deleteEspacio = async (req: Request, res: Response) => {
  try {
    const { id_espacio } = req.params;

    const espacio = await Espacio.findByPk(id_espacio);
    if (!espacio) {
      return res.status(404).json({ error: 'Espacio no encontrado' });
    }

    if (espacio.estado_espacio === 'Eliminado') {
      return res.status(404).json({ error: 'Espacio no encontrado' });
    }

    // Eliminar lógicamente el espacio
    await espacio.update({ estado_espacio: 'Eliminado' });

    res.json({ message: 'Espacio eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar espacio:', error);
    res.status(500).json({ error: 'Error al eliminar espacio' });
  }
}; 