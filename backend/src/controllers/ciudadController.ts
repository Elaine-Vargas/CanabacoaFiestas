import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Ciudad from '../models/Ciudad_model';
import Provincia from '../models/Provincia_model';

// Obtener todas las ciudades
export const getCiudades = async (req: Request, res: Response) => {
  try {
    const ciudades = await Ciudad.findAll({
      include: [
        {
          model: Provincia,
          attributes: ['id_provincia', 'nombre_provincia']
        }
      ],
      order: [['nombre_ciudad', 'ASC']]
    });

    if (!ciudades || ciudades.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontraron ciudades',
        mensaje: 'No hay ciudades registradas'
      });
    }

    res.json(ciudades);
  } catch (error) {
    console.error('Error al obtener ciudades:', error);
    res.status(500).json({ 
      error: 'Error al obtener las ciudades',
      mensaje: 'Ocurrió un error al cargar las ciudades'
    });
  }
};

// Obtener ciudades por provincia
export const getCiudadesByProvincia = async (req: Request, res: Response) => {
  try {
    const { id_provincia } = req.params;

    // Verificar que la provincia existe
    const provincia = await Provincia.findByPk(id_provincia);
    if (!provincia) {
      return res.status(404).json({ error: 'Provincia no encontrada' });
    }

    const ciudades = await Ciudad.findAll({
      where: { id_provincia },
      include: [
        {
          model: Provincia,
          attributes: ['id_provincia', 'nombre_provincia']
        }
      ],
      order: [['nombre_ciudad', 'ASC']]
    });

    if (!ciudades || ciudades.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontraron ciudades',
        mensaje: 'No hay ciudades registradas para esta provincia'
      });
    }

    res.json(ciudades);
  } catch (error) {
    console.error('Error al obtener ciudades de la provincia:', error);
    res.status(500).json({ 
      error: 'Error al obtener las ciudades de la provincia',
      mensaje: 'Ocurrió un error al cargar las ciudades'
    });
  }
};

// Buscar ciudades
export const searchCiudades = async (req: Request, res: Response) => {
  try {
    const { nombre, id_provincia } = req.query;

    const whereClause: any = {};

    if (nombre) {
      whereClause.nombre_ciudad = {
        [Op.like]: `%${nombre}%`
      };
    }

    if (id_provincia) {
      whereClause.id_provincia = id_provincia;
    }

    const ciudades = await Ciudad.findAll({
      where: whereClause,
      include: [
        {
          model: Provincia,
          attributes: ['id_provincia', 'nombre_provincia']
        }
      ],
      order: [['nombre_ciudad', 'ASC']]
    });

    if (!ciudades || ciudades.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontraron ciudades',
        mensaje: 'No hay ciudades que coincidan con los criterios de búsqueda'
      });
    }

    res.json(ciudades);
  } catch (error) {
    console.error('Error al buscar ciudades:', error);
    res.status(500).json({ 
      error: 'Error al buscar ciudades',
      mensaje: 'Ocurrió un error al realizar la búsqueda'
    });
  }
}; 