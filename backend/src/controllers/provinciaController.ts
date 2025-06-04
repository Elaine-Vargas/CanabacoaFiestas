import { Request, Response } from 'express';
import Provincia from '../models/Provincia_model';

// Obtener todas las provincias
export const getProvincias = async (req: Request, res: Response) => {
  try {
    const provincias = await Provincia.findAll({
      attributes: ['id_provincia', 'nombre_provincia']
    });

    if (!provincias || provincias.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontraron provincias',
        mensaje: 'No hay provincias registradas'
      });
    }

    res.json(provincias);
  } catch (error) {
    console.error('Error al obtener provincias:', error);
    res.status(500).json({ 
      error: 'Error al obtener las provincias',
      mensaje: 'Ocurrió un error al cargar las provincias'
    });
  }
}; 