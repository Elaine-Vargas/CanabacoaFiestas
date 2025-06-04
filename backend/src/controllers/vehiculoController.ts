import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Vehiculo from '../models/Vehiculo_model';

// Obtener todos los vehículos
export const getVehiculos = async (req: Request, res: Response) => {
  try {
    const vehiculos = await Vehiculo.findAll({
      where: {
        estado_vehiculo: {
          [Op.ne]: 'Eliminado'
        }
      },
      order: [['marca_vehiculo', 'ASC'], ['modelo_vehiculo', 'ASC']]
    });

    if (!vehiculos || vehiculos.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontraron vehículos',
        mensaje: 'No hay vehículos registrados'
      });
    }

    res.json(vehiculos);
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    res.status(500).json({ 
      error: 'Error al obtener los vehículos',
      mensaje: 'Ocurrió un error al cargar los vehículos'
    });
  }
};

// Buscar vehículos
export const searchVehiculos = async (req: Request, res: Response) => {
  try {
    const { matricula, marca, modelo, tipo, estado } = req.query;

    const whereClause: any = {
      estado_vehiculo: {
        [Op.ne]: 'Eliminado'
      }
    };

    if (matricula) {
      whereClause.matricula_vehiculo = {
        [Op.like]: `%${matricula}%`
      };
    }

    if (marca) {
      whereClause.marca_vehiculo = {
        [Op.like]: `%${marca}%`
      };
    }

    if (modelo) {
      whereClause.modelo_vehiculo = {
        [Op.like]: `%${modelo}%`
      };
    }

    if (tipo) {
      whereClause.tipo_vehiculo = tipo;
    }

    if (estado) {
      whereClause.estado_vehiculo = estado;
    }

    const vehiculos = await Vehiculo.findAll({
      where: whereClause,
      order: [['marca_vehiculo', 'ASC'], ['modelo_vehiculo', 'ASC']]
    });

    if (!vehiculos || vehiculos.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontraron vehículos',
        mensaje: 'No hay vehículos que coincidan con los criterios de búsqueda'
      });
    }

    res.json(vehiculos);
  } catch (error) {
    console.error('Error al buscar vehículos:', error);
    res.status(500).json({ 
      error: 'Error al buscar vehículos',
      mensaje: 'Ocurrió un error al realizar la búsqueda'
    });
  }
};

// Crear un nuevo vehículo
export const createVehiculo = async (req: Request, res: Response) => {
  try {
    const { 
      matricula_vehiculo,
      marca_vehiculo,
      modelo_vehiculo,
      tipo_vehiculo
    } = req.body;

    // Validar tipo de vehículo
    if (!['Automóvil', 'Remolque', 'Máquinas pesadas', 'Montacargas'].includes(tipo_vehiculo)) {
      return res.status(400).json({ error: 'Tipo de vehículo inválido' });
    }

    // Verificar si la matrícula ya existe
    const vehiculoExistente = await Vehiculo.findByPk(matricula_vehiculo);
    if (vehiculoExistente) {
      return res.status(400).json({ 
        error: 'Matrícula duplicada',
        mensaje: 'Ya existe un vehículo con esta matrícula'
      });
    }

    // Crear el vehículo
    const vehiculo = await Vehiculo.create({
      matricula_vehiculo,
      marca_vehiculo,
      modelo_vehiculo,
      tipo_vehiculo,
      estado_vehiculo: 'Activo'
    });

    res.status(201).json(vehiculo);
  } catch (error) {
    console.error('Error al crear vehículo:', error);
    res.status(500).json({ 
      error: 'Error al crear vehículo',
      mensaje: 'Ocurrió un error al crear el vehículo'
    });
  }
};

// Editar un vehículo
export const editVehiculo = async (req: Request, res: Response) => {
  try {
    const { matricula_vehiculo } = req.params;
    const { 
      marca_vehiculo,
      modelo_vehiculo,
      tipo_vehiculo,
      estado_vehiculo
    } = req.body;

    const vehiculo = await Vehiculo.findByPk(matricula_vehiculo);
    if (!vehiculo) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    // Validar tipo de vehículo si se proporciona
    if (tipo_vehiculo && !['Automóvil', 'Remolque', 'Máquinas pesadas', 'Montacargas'].includes(tipo_vehiculo)) {
      return res.status(400).json({ error: 'Tipo de vehículo inválido' });
    }

    // Validar estado si se proporciona
    if (estado_vehiculo && !['Activo', 'Inactivo', 'Eliminado'].includes(estado_vehiculo)) {
      return res.status(400).json({ error: 'Estado de vehículo inválido' });
    }

    // Actualizar el vehículo
    await vehiculo.update({
      marca_vehiculo: marca_vehiculo || vehiculo.marca_vehiculo,
      modelo_vehiculo: modelo_vehiculo || vehiculo.modelo_vehiculo,
      tipo_vehiculo: tipo_vehiculo || vehiculo.tipo_vehiculo,
      estado_vehiculo: estado_vehiculo || vehiculo.estado_vehiculo
    });

    res.json(vehiculo);
  } catch (error) {
    console.error('Error al editar vehículo:', error);
    res.status(500).json({ 
      error: 'Error al editar vehículo',
      mensaje: 'Ocurrió un error al actualizar el vehículo'
    });
  }
};

// Eliminar lógicamente un vehículo
export const deleteVehiculo = async (req: Request, res: Response) => {
  try {
    const { matricula_vehiculo } = req.params;

    const vehiculo = await Vehiculo.findByPk(matricula_vehiculo);
    if (!vehiculo) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    // Verificar si el vehículo ya está eliminado
    if (vehiculo.estado_vehiculo === 'Eliminado') {
      return res.status(400).json({ 
        error: 'Vehículo ya eliminado',
        mensaje: 'El vehículo ya ha sido eliminado anteriormente'
      });
    }

    // Actualizar el estado a 'Eliminado'
    await vehiculo.update({ estado_vehiculo: 'Eliminado' });

    res.json({
      mensaje: 'Vehículo eliminado exitosamente',
      vehiculo
    });
  } catch (error) {
    console.error('Error al eliminar vehículo:', error);
    res.status(500).json({ 
      error: 'Error al eliminar vehículo',
      mensaje: 'Ocurrió un error al eliminar el vehículo'
    });
  }
}; 