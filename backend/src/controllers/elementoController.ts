import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Elemento from '../models/Elemento_model';
import SubcategoriaElemento from '../models/SubcategoriaElemento_model';
import ColorElemento from '../models/ColorElemento_model';
import CategoriaElemento from '../models/CategoriaElemento_model';
import MaterialElemento from '../models/MaterialElemento_model';

export const getElementos = async (req: Request, res: Response) => {
  try {
    console.log('Intentando obtener elementos...');
    const elementos = await Elemento.findAll({
      attributes: [
        'id_elemento',
        'nombre_elemento',
        'precio_elemento',
        'imagen_url',
        'cantidad_total',
        'cantidad_disponible',
        'estado_elemento'
      ],
      include: [
        {
          model: SubcategoriaElemento,
          as: 'subcategoria',
          include: [{
            model: CategoriaElemento,
            as: 'categoria'
          }]
        },
        {
          model: ColorElemento,
          as: 'color'
        },
        {
          model: MaterialElemento,
          as: 'material',
          attributes: ['id_material', 'nombre_material']
        }
      ],
      where: {
        estado_elemento: {
          [Op.ne]: 'Eliminado'
        }
      }
    });

    console.log('Elementos encontrados:', elementos.length);
    if (elementos.length > 0) {
      console.log('Primer elemento:', JSON.stringify(elementos[0].toJSON(), null, 2));
    }

    if (!elementos || elementos.length === 0) {
      console.log('No se encontraron elementos');
      return res.status(404).json({ 
        error: 'No se encontraron elementos',
        mensaje: 'No hay elementos disponibles en el catálogo'
      });
    }

    res.json(elementos);
  } catch (error) {
    console.error('Error detallado al obtener elementos:', error);
    res.status(500).json({ 
      error: 'Error al obtener los elementos',
      mensaje: 'Ocurrió un error al cargar el catálogo. Por favor, intente más tarde.'
    });
  }
};

export const getElementoById = async (req: Request, res: Response) => {
  try {
    console.log('Buscando elemento con ID:', req.params.id);
    
    const elemento = await Elemento.findByPk(req.params.id, {
      attributes: [
        'id_elemento',
        'nombre_elemento',
        'precio_elemento',
        'imagen_url',
        'cantidad_total',
        'cantidad_disponible',
        'estado_elemento'
      ],
      include: [
        {
          model: SubcategoriaElemento,
          as: 'subcategoria',
          include: [{
            model: CategoriaElemento,
            as: 'categoria'
          }]
        },
        {
          model: ColorElemento,
          as: 'color'
        },
        {
          model: MaterialElemento,
          as: 'material'
        }
      ]
    });

    console.log('Elemento encontrado:', elemento);

    if (!elemento) {
      console.log('Elemento no encontrado');
      return res.status(404).json({
        error: 'Elemento no encontrado',
        mensaje: 'No se encontró el elemento solicitado'
      });
    }

    res.json(elemento);
  } catch (error) {
    console.error('Error al buscar elemento por ID:', error);
    res.status(500).json({
      error: 'Error al buscar elemento',
      mensaje: 'Ocurrió un error al buscar el elemento'
    });
  }
};

export const getCategorias = async (req: Request, res: Response) => {
  try {
    console.log('Intentando obtener categorías...');
    const categorias = await CategoriaElemento.findAll({
      include: [{
        model: SubcategoriaElemento,
        as: 'subcategorias'
      }]
    });

    if (!categorias || categorias.length === 0) {
      console.log('No se encontraron categorías');
      return res.status(404).json({ 
        error: 'No se encontraron categorías',
        mensaje: 'No hay categorías disponibles'
      });
    }

    res.json(categorias);
  } catch (error) {
    console.error('Error detallado al obtener categorías:', error);
    res.status(500).json({ 
      error: 'Error al obtener las categorías',
      mensaje: 'Ocurrió un error al cargar las categorías. Por favor, intente más tarde.'
    });
  }
};

export const getColores = async (req: Request, res: Response) => {
  try {
    console.log('Intentando obtener colores...');
    const colores = await ColorElemento.findAll();

    if (!colores || colores.length === 0) {
      console.log('No se encontraron colores');
      return res.status(404).json({ 
        error: 'No se encontraron colores',
        mensaje: 'No hay colores disponibles'
      });
    }

    res.json(colores);
  } catch (error) {
    console.error('Error detallado al obtener colores:', error);
    res.status(500).json({ 
      error: 'Error al obtener los colores',
      mensaje: 'Ocurrió un error al cargar los colores. Por favor, intente más tarde.'
    });
  }
};

export const getMateriales = async (req: Request, res: Response) => {
  try {
    console.log('Intentando obtener materiales...');
    const materiales = await MaterialElemento.findAll({
      attributes: ['id_material', 'nombre_material']
    });

    if (!materiales || materiales.length === 0) {
      console.log('No se encontraron materiales');
      return res.status(404).json({ 
        error: 'No se encontraron materiales',
        mensaje: 'No hay materiales disponibles'
      });
    }

    res.json(materiales);
  } catch (error) {
    console.error('Error detallado al obtener materiales:', error);
    res.status(500).json({ 
      error: 'Error al obtener los materiales',
      mensaje: 'Ocurrió un error al cargar los materiales. Por favor, intente más tarde.'
    });
  }
};

// Obtener todas las subcategorías
export const getSubcategorias = async (req: Request, res: Response) => {
  try {
    console.log('Intentando obtener subcategorías...');
    const subcategorias = await SubcategoriaElemento.findAll({
      include: [{
        model: CategoriaElemento,
        as: 'categoria'
      }]
    });

    if (!subcategorias || subcategorias.length === 0) {
      console.log('No se encontraron subcategorías');
      return res.status(404).json({ 
        error: 'No se encontraron subcategorías',
        mensaje: 'No hay subcategorías disponibles'
      });
    }

    res.json(subcategorias);
  } catch (error) {
    console.error('Error detallado al obtener subcategorías:', error);
    res.status(500).json({ 
      error: 'Error al obtener las subcategorías',
      mensaje: 'Ocurrió un error al cargar las subcategorías. Por favor, intente más tarde.'
    });
  }
};

// Obtener subcategorías por categoría
export const getSubcategoriasByCategoria = async (req: Request, res: Response) => {
  try {
    const { id_categoria } = req.params;
    console.log('Intentando obtener subcategorías para la categoría:', id_categoria);

    const subcategorias = await SubcategoriaElemento.findAll({
      where: {
        id_categoria: id_categoria
      },
      include: [{
        model: CategoriaElemento,
        as: 'categoria'
      }]
    });

    if (!subcategorias || subcategorias.length === 0) {
      console.log('No se encontraron subcategorías para la categoría especificada');
      return res.status(404).json({ 
        error: 'No se encontraron subcategorías',
        mensaje: 'No hay subcategorías disponibles para esta categoría'
      });
    }

    res.json(subcategorias);
  } catch (error) {
    console.error('Error detallado al obtener subcategorías por categoría:', error);
    res.status(500).json({ 
      error: 'Error al obtener las subcategorías',
      mensaje: 'Ocurrió un error al cargar las subcategorías. Por favor, intente más tarde.'
    });
  }
};

// Crear un nuevo elemento
export const createElemento = async (req: Request, res: Response) => {
  try {
    const {
      nombre_elemento,
      id_subcategoria,
      id_material,
      id_color,
      precio_elemento,
      cantidad_total,
      cantidad_disponible,
      imagen_url,
      estado_elemento
    } = req.body;

    // Verificar que la subcategoría existe
    const subcategoria = await SubcategoriaElemento.findByPk(id_subcategoria);
    if (!subcategoria) {
      return res.status(404).json({ error: 'Subcategoría no encontrada' });
    }

    // Verificar que el material existe
    const material = await MaterialElemento.findByPk(id_material);
    if (!material) {
      return res.status(404).json({ error: 'Material no encontrado' });
    }

    // Verificar que el color existe
    const color = await ColorElemento.findByPk(id_color);
    if (!color) {
      return res.status(404).json({ error: 'Color no encontrado' });
    }

    // Crear el elemento
    const elemento = await Elemento.create({
      nombre_elemento,
      id_subcategoria,
      id_material,
      id_color,
      precio_elemento,
      cantidad_total: cantidad_total || 0,
      cantidad_disponible: cantidad_disponible || cantidad_total || 0,
      imagen_url,
      estado_elemento: estado_elemento || 'Activo'
    });

    // Obtener el elemento con sus relaciones
    const elementoCompleto = await Elemento.findByPk(elemento.id_elemento, {
      include: [
        {
          model: SubcategoriaElemento,
          as: 'subcategoria',
          include: [{
            model: CategoriaElemento,
            as: 'categoria'
          }]
        },
        {
          model: ColorElemento,
          as: 'color'
        },
        {
          model: MaterialElemento,
          as: 'material'
        }
      ]
    });

    res.status(201).json(elementoCompleto);
  } catch (error) {
    console.error('Error al crear elemento:', error);
    res.status(500).json({ error: 'Error al crear elemento' });
  }
};

// Buscar elementos por nombre o categoría
export const searchElementos = async (req: Request, res: Response) => {
  try {
    const { query, categoria, subcategoria, material, color } = req.query;

    const whereClause: any = {
      estado_elemento: {
        [Op.ne]: 'Eliminado'
      }
    };

    if (query) {
      whereClause.nombre_elemento = {
        [Op.like]: `%${query}%`
      };
    }

    if (categoria) {
      whereClause['$subcategoria.categoria.id_categoria$'] = categoria;
    }

    if (subcategoria) {
      whereClause.id_subcategoria = subcategoria;
    }

    if (material) {
      whereClause.id_material = material;
    }

    if (color) {
      whereClause.id_color = color;
    }

    const elementos = await Elemento.findAll({
      where: whereClause,
      include: [
        {
          model: SubcategoriaElemento,
          as: 'subcategoria',
          include: [{
            model: CategoriaElemento,
            as: 'categoria'
          }]
        },
        {
          model: ColorElemento,
          as: 'color'
        },
        {
          model: MaterialElemento,
          as: 'material'
        }
      ]
    });

    if (!elementos || elementos.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontraron elementos',
        mensaje: 'No hay elementos que coincidan con los criterios de búsqueda'
      });
    }

    res.json(elementos);
  } catch (error) {
    console.error('Error al buscar elementos:', error);
    res.status(500).json({ error: 'Error al buscar elementos' });
  }
};

// Editar un elemento
export const editElemento = async (req: Request, res: Response) => {
  try {
    const { id_elemento } = req.params;
    const {
      nombre_elemento,
      id_subcategoria,
      id_material,
      id_color,
      precio_elemento,
      cantidad_total,
      cantidad_disponible,
      imagen_url,
      estado_elemento
    } = req.body;

    const elemento = await Elemento.findByPk(id_elemento);
    if (!elemento) {
      return res.status(404).json({ error: 'Elemento no encontrado' });
    }

    if (elemento.estado_elemento === 'Eliminado') {
      return res.status(404).json({ error: 'Elemento no encontrado' });
    }

    // Verificar que la subcategoría existe si se proporciona
    if (id_subcategoria) {
      const subcategoria = await SubcategoriaElemento.findByPk(id_subcategoria);
      if (!subcategoria) {
        return res.status(404).json({ error: 'Subcategoría no encontrada' });
      }
    }

    // Verificar que el material existe si se proporciona
    if (id_material) {
      const material = await MaterialElemento.findByPk(id_material);
      if (!material) {
        return res.status(404).json({ error: 'Material no encontrado' });
      }
    }

    // Verificar que el color existe si se proporciona
    if (id_color) {
      const color = await ColorElemento.findByPk(id_color);
      if (!color) {
        return res.status(404).json({ error: 'Color no encontrado' });
      }
    }

    // Actualizar el elemento
    await elemento.update({
      nombre_elemento: nombre_elemento || elemento.nombre_elemento,
      id_subcategoria: id_subcategoria || elemento.id_subcategoria,
      id_material: id_material || elemento.id_material,
      id_color: id_color || elemento.id_color,
      precio_elemento: precio_elemento || elemento.precio_elemento,
      cantidad_total: cantidad_total || elemento.cantidad_total,
      cantidad_disponible: cantidad_disponible || elemento.cantidad_disponible,
      imagen_url: imagen_url || elemento.imagen_url,
      estado_elemento: estado_elemento || elemento.estado_elemento
    });

    // Obtener el elemento actualizado con sus relaciones
    const elementoActualizado = await Elemento.findByPk(id_elemento, {
      include: [
        {
          model: SubcategoriaElemento,
          as: 'subcategoria',
          include: [{
            model: CategoriaElemento,
            as: 'categoria'
          }]
        },
        {
          model: ColorElemento,
          as: 'color'
        },
        {
          model: MaterialElemento,
          as: 'material'
        }
      ]
    });

    res.json(elementoActualizado);
  } catch (error) {
    console.error('Error al editar elemento:', error);
    res.status(500).json({ error: 'Error al editar elemento' });
  }
};

// Eliminar lógicamente un elemento
export const deleteElemento = async (req: Request, res: Response) => {
  try {
    const { id_elemento } = req.params;

    const elemento = await Elemento.findByPk(id_elemento);
    if (!elemento) {
      return res.status(404).json({ error: 'Elemento no encontrado' });
    }

    if (elemento.estado_elemento === 'Eliminado') {
      return res.status(404).json({ error: 'Elemento no encontrado' });
    }

    // Eliminar lógicamente el elemento
    await elemento.update({ estado_elemento: 'Eliminado' });

    res.json({ message: 'Elemento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar elemento:', error);
    res.status(500).json({ error: 'Error al eliminar elemento' });
  }
};
