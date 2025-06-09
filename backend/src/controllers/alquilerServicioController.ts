import { Request, Response } from 'express';
import AlquilerServicio from '../models/AlquilerServicio_model';
import Elemento from '../models/Elemento_model';
import Evento from '../models/Evento_model';
import DetalleAlquiler from '../models/DetalleAlquiler_model';
import { Op, Transaction } from 'sequelize';
import { sequelize } from '../database/database';
import SubcategoriaElemento from '../models/SubcategoriaElemento_model';
import CategoriaElemento from '../models/CategoriaElemento_model';

export const createAlquilerServicio = async (req: Request, res: Response) => {
  const t: Transaction = await sequelize.transaction();
  try {
    const {
      id_evento,
      cant_elementos_alquiler,
      precioneto_alquiler,
      itbis_alquiler,
      total_alquiler,
      estado_alquiler,
      elementos
    } = req.body;

    // Verificar que el evento existe
    const evento = await Evento.findByPk(id_evento);
    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    // Crear el alquiler
    const alquiler = await AlquilerServicio.create({
      id_evento,
      cant_elementos_alquiler,
      precioneto_alquiler,
      itbis_alquiler,
      total_alquiler,
      estado_alquiler
    }, { transaction: t });

    // Crear los detalles del alquiler
    if (elementos && elementos.length > 0) {
      await Promise.all(elementos.map(async (elem: any) => {
        await DetalleAlquiler.create({
          id_alquiler: alquiler.id_alquiler,
          id_elemento: elem.id_elemento,
          cantidad_alquiler: elem.cantidad,
          precio_unitario: elem.precio_unitario,
          total_alquiler: elem.subtotal
        }, { transaction: t });
      }));
    }

    await t.commit();
    res.status(201).json(alquiler);
  } catch (error) {
    await t.rollback();
    console.error('Error al crear alquiler:', error);
    res.status(500).json({ error: 'Error al crear alquiler' });
  }
};

export const getAllAlquileres = async (req: Request, res: Response) => {
  try {
    const alquileres = await AlquilerServicio.findAll({
      include: [
        {
          model: Evento,
          as: 'evento'
        }
      ],
      order: [['id_alquiler', 'DESC']]
    });
    res.json(alquileres);
  } catch (error) {
    console.error('Error al obtener alquileres:', error);
    res.status(500).json({ error: 'Error al obtener alquileres' });
  }
};

export const getAlquilerById = async (req: Request, res: Response) => {
  try {
    const { id_alquiler } = req.params;
    const alquiler = await AlquilerServicio.findByPk(id_alquiler, {
      include: [
        {
          model: Evento,
          as: 'evento'
        }
      ]
    });

    if (!alquiler) {
      return res.status(404).json({ 
        error: 'Alquiler no encontrado',
        mensaje: 'No existe un alquiler con el ID proporcionado'
      });
    }

    res.json(alquiler);
  } catch (error) {
    console.error('Error al obtener alquiler:', error);
    res.status(500).json({ 
      error: 'Error al obtener el alquiler',
      mensaje: 'Ocurrió un error al cargar el alquiler'
    });
  }
};

export const getAlquileresByEvento = async (req: Request, res: Response) => {
  try {
    const { id_evento } = req.params;

    // Verificar si el evento existe
    const evento = await Evento.findByPk(id_evento);
    if (!evento) {
      return res.status(404).json({
        error: 'Evento no encontrado',
        mensaje: `No se encontró el evento con ID ${id_evento}`
      });
    }

    const alquileres = await AlquilerServicio.findAll({
      where: { id_evento },
      include: [
        {
          model: Evento,
          as: 'evento',
          attributes: ['id_evento', 'nombre_evento', 'fecha_evento']
        }
      ],
      order: [['id_alquiler', 'DESC']]
    });

    if (!alquileres || alquileres.length === 0) {
      return res.status(404).json({
        error: 'No se encontraron alquileres',
        mensaje: 'No hay alquileres registrados para este evento'
      });
    }

    res.json(alquileres);
  } catch (error) {
    console.error('Error al obtener alquileres por evento:', error);
    res.status(500).json({
      error: 'Error al obtener los alquileres',
      mensaje: 'Ocurrió un error al cargar los alquileres del evento'
    });
  }
};

export const getAlquileresByElemento = async (req: Request, res: Response) => {
  try {
    const { id_elemento } = req.params;

    // Verificar si el elemento existe
    const elemento = await Elemento.findByPk(id_elemento);
    if (!elemento) {
      return res.status(404).json({
        error: 'Elemento no encontrado',
        mensaje: `No se encontró el elemento con ID ${id_elemento}`
      });
    }

    // Buscar todos los detalles de alquiler que contengan este elemento
    const detallesAlquiler = await DetalleAlquiler.findAll({
      where: { 
        id_elemento,
        estado_detalquiler: 'Aceptado'
      },
      include: [
        {
          model: AlquilerServicio,
          as: 'alquiler',
          include: [
            {
              model: Evento,
              as: 'evento',
              attributes: ['id_evento', 'nombre_evento', 'fecha_evento']
            }
          ]
        }
      ],
      order: [[{ model: AlquilerServicio, as: 'alquiler' }, 'id_alquiler', 'DESC']]
    });

    if (!detallesAlquiler || detallesAlquiler.length === 0) {
      return res.status(404).json({
        error: 'No se encontraron alquileres',
        mensaje: 'No hay alquileres registrados para este elemento'
      });
    }

    // Transformar la respuesta para que sea más útil
    const alquileres = detallesAlquiler
      .filter(detalle => detalle.alquiler !== null && detalle.alquiler !== undefined)
      .map(detalle => {
        const alquilerData = (detalle.alquiler as AlquilerServicio).get();
        return {
          ...alquilerData,
          cantidad_alquilada: detalle.cantidad_alquiler,
          precio_unitario: detalle.precio_unitario,
          subtotal: detalle.total_alquiler
        };
      });

    res.json(alquileres);
  } catch (error) {
    console.error('Error al obtener alquileres por elemento:', error);
    res.status(500).json({
      error: 'Error al obtener los alquileres',
      mensaje: 'Ocurrió un error al cargar los alquileres del elemento'
    });
  }
};

export const getElementosAlquiler = async (req: Request, res: Response) => {
  try {
    const { id_alquiler } = req.params;
    console.log('Buscando elementos para el alquiler:', id_alquiler);
    
    // Primero verificar si el alquiler existe
    const alquilerExists = await AlquilerServicio.findByPk(id_alquiler);
    if (!alquilerExists) {
      console.log('Alquiler no encontrado:', id_alquiler);
      return res.status(404).json({ 
        error: 'Alquiler no encontrado',
        mensaje: `No se encontró el alquiler con ID ${id_alquiler}`
      });
    }
    console.log('Alquiler encontrado:', alquilerExists.toJSON());

    const detalles = await DetalleAlquiler.findAll({
      where: { 
        id_alquiler
      },
      include: [
        {
          model: Elemento,
          as: 'elemento',
          attributes: ['id_elemento', 'nombre_elemento', 'precio_elemento', 'cantidad_disponible', 'imagen_url']
        }
      ]
    });
    console.log('Detalles encontrados:', JSON.stringify(detalles, null, 2));

    if (!detalles || detalles.length === 0) {
      console.log('No se encontraron detalles para el alquiler:', id_alquiler);
      return res.status(404).json({ 
        error: 'No se encontraron elementos',
        mensaje: 'Este alquiler no tiene elementos asociados'
      });
    }

    // Transformar la respuesta para incluir solo la información necesaria
    const elementosFormateados = detalles.map(detalle => {
      const elemento = detalle.elemento;
      if (!elemento) {
        console.log(`Elemento no encontrado para el detalle ${detalle.id_detalle}`);
        return null;
      }
      
      return {
        id_elemento: elemento.id_elemento,
        nombre_elemento: elemento.nombre_elemento,
        precio_elemento: elemento.precio_elemento,
        cantidad_disponible: elemento.cantidad_disponible,
        imagen_url: elemento.imagen_url,
        cantidad_alquiler: detalle.cantidad_alquiler,
        precio_unitario: detalle.precio_unitario,
        total_alquiler: detalle.total_alquiler,
        estado_detalquiler: detalle.estado_detalquiler
      };
    }).filter(elemento => elemento !== null);

    console.log('Elementos formateados:', JSON.stringify(elementosFormateados, null, 2));
    res.json(elementosFormateados);
  } catch (error) {
    console.error('Error detallado al obtener elementos del alquiler:', error);
    if (error instanceof Error) {
      console.error('Mensaje de error:', error.message);
      console.error('Stack trace:', error.stack);
    }
    res.status(500).json({ 
      error: 'Error al obtener elementos del alquiler',
      mensaje: 'Ocurrió un error interno al procesar la solicitud',
      detalles: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const editAlquilerServicio = async (req: Request, res: Response) => {
  const t: Transaction = await sequelize.transaction();
  try {
    const { id_alquiler } = req.params;
    const {
      cant_elementos_alquiler,
      precioneto_alquiler,
      itbis_alquiler,
      total_alquiler,
      estado_alquiler,
      elementos
    } = req.body;

    const alquiler = await AlquilerServicio.findByPk(id_alquiler);
    if (!alquiler) {
      return res.status(404).json({ error: 'Alquiler no encontrado' });
    }

    // Actualizar el alquiler
    await alquiler.update({
      cant_elementos_alquiler,
      precioneto_alquiler,
      itbis_alquiler,
      total_alquiler,
      estado_alquiler
    }, { transaction: t });

    // Marcar todos los detalles existentes como cancelados
    await DetalleAlquiler.update(
      { estado_detalquiler: 'Cancelado' },
      { 
        where: { id_alquiler },
        transaction: t
      }
    );

    // Crear los nuevos detalles
    if (elementos && elementos.length > 0) {
      await Promise.all(elementos.map(async (elem: any) => {
        await DetalleAlquiler.create({
          id_alquiler,
          id_elemento: elem.id_elemento,
          cantidad_alquiler: elem.cantidad,
          precio_unitario: elem.precio_unitario,
          total_alquiler: elem.subtotal,
          estado_detalquiler: 'Aceptado'
        }, { transaction: t });
      }));
    }

    await t.commit();
    res.json(alquiler);
  } catch (error) {
    await t.rollback();
    console.error('Error al editar alquiler:', error);
    res.status(500).json({ error: 'Error al editar alquiler' });
  }
};

export const deleteAlquilerServicio = async (req: Request, res: Response) => {
  const t: Transaction = await sequelize.transaction();
  try {
    const { id_alquiler } = req.params;
    const alquiler = await AlquilerServicio.findByPk(id_alquiler);
    
    if (!alquiler) {
      return res.status(404).json({ error: 'Alquiler no encontrado' });
    }

    // Marcar el alquiler como cancelado
    await alquiler.update({
      estado_alquiler: 'Cancelado'
    }, { transaction: t });

    // Marcar todos los detalles como cancelados
    await DetalleAlquiler.update(
      { estado_detalquiler: 'Cancelado' },
      { 
        where: { id_alquiler },
        transaction: t
      }
    );

    await t.commit();
    res.json({ message: 'Alquiler cancelado correctamente' });
  } catch (error) {
    await t.rollback();
    console.error('Error al eliminar alquiler:', error);
    res.status(500).json({ error: 'Error al eliminar alquiler' });
  }
}; 