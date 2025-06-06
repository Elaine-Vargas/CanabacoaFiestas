import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Proveedor from '../models/Proveedor_model';
import Direccion from '../models/Direccion_model';

// Obtener todos los proveedores
export const getProveedores = async (req: Request, res: Response) => {
  try {
    const proveedores = await Proveedor.findAll({
      include: [
        {
          model: Direccion,
          attributes: ['id_direccion', 'sector', 'calle', 'detalles']
        }
      ],
      where: {
        estado_proveedor: {
          [Op.ne]: 'Eliminado'
        }
      },
      order: [['nombre_proveedor', 'ASC']]
    });

    if (!proveedores || proveedores.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontraron proveedores',
        mensaje: 'No hay proveedores registrados'
      });
    }

    res.json(proveedores);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({ 
      error: 'Error al obtener los proveedores',
      mensaje: 'Ocurrió un error al cargar los proveedores'
    });
  }
};

// Buscar proveedores por nombre
export const searchProveedores = async (req: Request, res: Response) => {
  try {
    const { nombre, tipo } = req.query;

    const whereClause: any = {
      estado_proveedor: {
        [Op.ne]: 'Eliminado'
      }
    };

    if (nombre) {
      whereClause.nombre_proveedor = {
        [Op.like]: `%${nombre}%`
      };
    }

    if (tipo && ['Catering', 'Elementos'].includes(tipo as string)) {
      whereClause.tipo_proveedor = tipo;
    }

    const proveedores = await Proveedor.findAll({
      where: whereClause,
      include: [
        {
          model: Direccion,
          attributes: ['id_direccion', 'sector', 'calle', 'detalles']
        }
      ],
      order: [['nombre_proveedor', 'ASC']]
    });

    if (!proveedores || proveedores.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontraron proveedores',
        mensaje: 'No hay proveedores que coincidan con la búsqueda'
      });
    }

    res.json(proveedores);
  } catch (error) {
    console.error('Error al buscar proveedores:', error);
    res.status(500).json({ 
      error: 'Error al buscar proveedores',
      mensaje: 'Ocurrió un error al realizar la búsqueda'
    });
  }
};

// Crear un nuevo proveedor
export const createProveedor = async (req: Request, res: Response) => {
  try {
    const { 
      tipo_proveedor, 
      nombre_proveedor, 
      tel_proveedor, 
      correo_proveedor, 
      id_direccion 
    } = req.body;

    // Validar tipo de proveedor
    if (!['Catering', 'Elementos'].includes(tipo_proveedor)) {
      return res.status(400).json({ error: 'Tipo de proveedor inválido' });
    }

    // Verificar que la dirección existe
    const direccion = await Direccion.findByPk(id_direccion);
    if (!direccion) {
      return res.status(404).json({ error: 'Dirección no encontrada' });
    }

    // Crear el proveedor
    const proveedor = await Proveedor.create({
      tipo_proveedor,
      nombre_proveedor,
      tel_proveedor,
      correo_proveedor,
      id_direccion,
      estado_proveedor: 'Activo'
    });

    // Obtener el proveedor con sus relaciones
    const proveedorCompleto = await Proveedor.findByPk(proveedor.id_proveedor, {
      include: [
        {
          model: Direccion,
          attributes: ['id_direccion', 'sector', 'calle', 'detalles']
        }
      ]
    });

    res.status(201).json(proveedorCompleto);
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    res.status(500).json({ 
      error: 'Error al crear proveedor',
      mensaje: 'Ocurrió un error al crear el proveedor'
    });
  }
};

// Editar un proveedor
export const editProveedor = async (req: Request, res: Response) => {
  try {
    const { id_proveedor } = req.params;
    const { 
      tipo_proveedor, 
      nombre_proveedor, 
      tel_proveedor, 
      correo_proveedor, 
      id_direccion,
      estado_proveedor 
    } = req.body;

    const proveedor = await Proveedor.findByPk(id_proveedor);
    if (!proveedor) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    // Validar tipo de proveedor si se proporciona
    if (tipo_proveedor && !['Catering', 'Elementos'].includes(tipo_proveedor)) {
      return res.status(400).json({ error: 'Tipo de proveedor inválido' });
    }

    // Verificar que la dirección existe si se proporciona
    if (id_direccion) {
      const direccion = await Direccion.findByPk(id_direccion);
      if (!direccion) {
        return res.status(404).json({ error: 'Dirección no encontrada' });
      }
    }

    // Validar estado si se proporciona
    if (estado_proveedor && !['Activo', 'Inactivo', 'Eliminado'].includes(estado_proveedor)) {
      return res.status(400).json({ error: 'Estado de proveedor inválido' });
    }

    // Actualizar el proveedor
    await proveedor.update({
      tipo_proveedor: tipo_proveedor || proveedor.tipo_proveedor,
      nombre_proveedor: nombre_proveedor || proveedor.nombre_proveedor,
      tel_proveedor: tel_proveedor || proveedor.tel_proveedor,
      correo_proveedor: correo_proveedor || proveedor.correo_proveedor,
      id_direccion: id_direccion || proveedor.id_direccion,
      estado_proveedor: estado_proveedor || proveedor.estado_proveedor
    });

    // Obtener el proveedor actualizado con sus relaciones
    const proveedorActualizado = await Proveedor.findByPk(id_proveedor, {
      include: [
        {
          model: Direccion,
          attributes: ['id_direccion', 'sector', 'calle', 'detalles']
        }
      ]
    });

    res.json(proveedorActualizado);
  } catch (error) {
    console.error('Error al editar proveedor:', error);
    res.status(500).json({ 
      error: 'Error al editar proveedor',
      mensaje: 'Ocurrió un error al actualizar el proveedor'
    });
  }
};

// Eliminar lógicamente un proveedor
export const deleteProveedor = async (req: Request, res: Response) => {
  try {
    const { id_proveedor } = req.params;

    const proveedor = await Proveedor.findByPk(id_proveedor);
    if (!proveedor) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    // Verificar si el proveedor ya está eliminado
    if (proveedor.estado_proveedor === 'Eliminado') {
      return res.status(400).json({ 
        error: 'Proveedor ya eliminado',
        mensaje: 'El proveedor ya ha sido eliminado anteriormente'
      });
    }

    // Actualizar el estado a 'Eliminado'
    await proveedor.update({ estado_proveedor: 'Eliminado' });

    const proveedorActualizado = await Proveedor.findByPk(id_proveedor, {
      include: [
        {
          model: Direccion,
          attributes: ['id_direccion', 'sector', 'calle', 'detalles']
        }
      ]
    });

    res.json({
      mensaje: 'Proveedor eliminado exitosamente',
      proveedor: proveedorActualizado
    });
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    res.status(500).json({ 
      error: 'Error al eliminar proveedor',
      mensaje: 'Ocurrió un error al eliminar el proveedor'
    });
  }
}; 