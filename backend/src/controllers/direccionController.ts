import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Direccion from '../models/Direccion_model';
import Ciudad from '../models/Ciudad_model';
import Provincia from '../models/Provincia_model';

// Obtener todas las direcciones
export const getDirecciones = async (req: Request, res: Response) => {
  try {
    const direcciones = await Direccion.findAll({
      include: [
        {
          model: Ciudad,
          attributes: ['id_ciudad', 'nombre_ciudad'],
          include: [
            {
              model: Provincia,
              attributes: ['id_provincia', 'nombre_provincia']
            }
          ]
        }
      ]
    });

    if (!direcciones || direcciones.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontraron direcciones',
        mensaje: 'No hay direcciones registradas'
      });
    }

    res.json(direcciones);
  } catch (error) {
    console.error('Error al obtener direcciones:', error);
    res.status(500).json({ 
      error: 'Error al obtener las direcciones',
      mensaje: 'Ocurrió un error al cargar las direcciones'
    });
  }
};

// Obtener una dirección por ID
export const getDireccionById = async (req: Request, res: Response) => {
  try {
    const { id_direccion } = req.params;
    
    const direccion = await Direccion.findByPk(id_direccion, {
      include: [
        {
          model: Ciudad,
          attributes: ['id_ciudad', 'nombre_ciudad'],
          include: [
            {
              model: Provincia,
              attributes: ['id_provincia', 'nombre_provincia']
            }
          ]
        }
      ]
    });

    if (!direccion) {
      return res.status(404).json({
        error: 'Dirección no encontrada',
        mensaje: 'No se encontró la dirección solicitada'
      });
    }

    res.json(direccion);
  } catch (error) {
    console.error('Error al buscar dirección:', error);
    res.status(500).json({
      error: 'Error al buscar dirección',
      mensaje: 'Ocurrió un error al buscar la dirección'
    });
  }
};

// Buscar direcciones
export const searchDirecciones = async (req: Request, res: Response) => {
  try {
    const { sector, calle, ciudad } = req.query;

    const whereClause: any = {};

    if (sector) {
      whereClause.sector = {
        [Op.like]: `%${sector}%`
      };
    }

    if (calle) {
      whereClause.calle = {
        [Op.like]: `%${calle}%`
      };
    }

    if (ciudad) {
      whereClause['$ciudad.nombre_ciudad$'] = {
        [Op.like]: `%${ciudad}%`
      };
    }

    const direcciones = await Direccion.findAll({
      where: whereClause,
      include: [
        {
          model: Ciudad,
          attributes: ['id_ciudad', 'nombre_ciudad'],
          include: [
            {
              model: Provincia,
              attributes: ['id_provincia', 'nombre_provincia']
            }
          ]
        }
      ]
    });

    if (!direcciones || direcciones.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontraron direcciones',
        mensaje: 'No hay direcciones que coincidan con los criterios de búsqueda'
      });
    }

    res.json(direcciones);
  } catch (error) {
    console.error('Error al buscar direcciones:', error);
    res.status(500).json({ 
      error: 'Error al buscar direcciones',
      mensaje: 'Ocurrió un error al realizar la búsqueda'
    });
  }
};

// Crear una nueva dirección
export const createDireccion = async (req: Request, res: Response) => {
  try {
    const { id_ciudad, sector, calle, detalles } = req.body;

    // Verificar que la ciudad existe
    const ciudad = await Ciudad.findByPk(id_ciudad);
    if (!ciudad) {
      return res.status(404).json({ error: 'Ciudad no encontrada' });
    }

    // Crear la dirección
    const direccion = await Direccion.create({
      id_ciudad,
      sector,
      calle,
      detalles: detalles || null
    });

    // Obtener la dirección con sus relaciones
    const direccionCompleta = await Direccion.findByPk(direccion.id_direccion, {
      include: [
        {
          model: Ciudad,
          attributes: ['id_ciudad', 'nombre_ciudad'],
          include: [
            {
              model: Provincia,
              attributes: ['id_provincia', 'nombre_provincia']
            }
          ]
        }
      ]
    });

    res.status(201).json(direccionCompleta);
  } catch (error) {
    console.error('Error al crear dirección:', error);
    res.status(500).json({ 
      error: 'Error al crear dirección',
      mensaje: 'Ocurrió un error al crear la dirección'
    });
  }
};

// Editar una dirección
export const editDireccion = async (req: Request, res: Response) => {
  try {
    const { id_direccion } = req.params;
    const { id_ciudad, sector, calle, detalles } = req.body;

    const direccion = await Direccion.findByPk(id_direccion);
    if (!direccion) {
      return res.status(404).json({ error: 'Dirección no encontrada' });
    }

    // Verificar que la ciudad existe si se proporciona
    if (id_ciudad) {
      const ciudad = await Ciudad.findByPk(id_ciudad);
      if (!ciudad) {
        return res.status(404).json({ error: 'Ciudad no encontrada' });
      }
    }

    // Actualizar la dirección
    await direccion.update({
      id_ciudad: id_ciudad || direccion.id_ciudad,
      sector: sector || direccion.sector,
      calle: calle || direccion.calle,
      detalles: detalles || direccion.detalles
    });

    // Obtener la dirección actualizada con sus relaciones
    const direccionActualizada = await Direccion.findByPk(id_direccion, {
      include: [
        {
          model: Ciudad,
          attributes: ['id_ciudad', 'nombre_ciudad'],
          include: [
            {
              model: Provincia,
              attributes: ['id_provincia', 'nombre_provincia']
            }
          ]
        }
      ]
    });

    res.json(direccionActualizada);
  } catch (error) {
    console.error('Error al editar dirección:', error);
    res.status(500).json({ 
      error: 'Error al editar dirección',
      mensaje: 'Ocurrió un error al actualizar la dirección'
    });
  }
};

// Eliminar lógicamente una dirección
export const deleteDireccion = async (req: Request, res: Response) => {
  try {
    const { id_direccion } = req.params;

    const direccion = await Direccion.findByPk(id_direccion);
    if (!direccion) {
      return res.status(404).json({ error: 'Dirección no encontrada' });
    }

    // Eliminar lógicamente la dirección
    await direccion.destroy();

    res.json({ mensaje: 'Dirección eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar dirección:', error);
    res.status(500).json({ 
      error: 'Error al eliminar dirección',
      mensaje: 'Ocurrió un error al eliminar la dirección'
    });
  }
}; 

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