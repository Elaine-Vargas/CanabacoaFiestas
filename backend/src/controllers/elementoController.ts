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
