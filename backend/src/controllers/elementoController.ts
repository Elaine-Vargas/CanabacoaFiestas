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
      ],
      where: {
        estado_elemento: {
          [Op.ne]: 'Eliminado'
        }
      }
    });

    console.log('Elementos encontrados:', elementos.length);

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
    const { id } = req.params;
    const idElemento = parseInt(id, 10);
    
    if (isNaN(idElemento)) {
      return res.status(400).json({ 
        error: 'ID inválido',
        mensaje: 'El ID del elemento debe ser un número válido'
      });
    }

    const elemento = await Elemento.findOne({
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
      ],
      where: {
        id_elemento: idElemento,
        estado_elemento: {
          [Op.ne]: 'Eliminado'
        }
      }
    });
    
    if (!elemento) {
      return res.status(404).json({ 
        error: 'Elemento no encontrado',
        mensaje: 'No se encontró el elemento solicitado'
      });
    }
    
    res.json(elemento);
  } catch (error) {
    console.error('Error al obtener elemento:', error);
    res.status(500).json({ 
      error: 'Error al obtener el elemento',
      mensaje: 'Ocurrió un error al cargar el elemento. Por favor, intente más tarde.'
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

    console.log('Categorías encontradas:', categorias.length);

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

    console.log('Colores encontrados:', colores.length);

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
