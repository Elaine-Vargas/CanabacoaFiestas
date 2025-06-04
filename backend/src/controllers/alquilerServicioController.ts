import { Request, Response } from 'express';
import AlquilerServicio from '../models/AlquilerServicio_model';
import Elemento from '../models/Elemento_model';
import Evento from '../models/Evento_model';
import { Op } from 'sequelize';

export const createAlquilerServicio = async (req: Request, res: Response) => {
  try {
    const {
      id_evento,
      id_elemento,
      precio_unitario,
      cantidad_alquiler,
      precioneto_alquiler,
      itbis_alquiler,
      total_alquiler
    } = req.body;

    // Verificar que el evento existe
    const evento = await Evento.findByPk(id_evento);
    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    // Verificar que el elemento existe y tiene suficiente stock
    const elemento = await Elemento.findByPk(id_elemento);
    if (!elemento) {
      return res.status(404).json({ error: 'Elemento no encontrado' });
    }

    if (elemento.cantidad_disponible < cantidad_alquiler) {
      return res.status(400).json({ error: 'No hay suficiente stock disponible' });
    }

    // Crear el alquiler
    const alquiler = await AlquilerServicio.create({
      id_evento,
      id_elemento,
      precio_unitario,
      cantidad_alquiler,
      precioneto_alquiler,
      itbis_alquiler,
      total_alquiler
    });

    // Actualizar el stock del elemento
    await elemento.update({
      cantidad_disponible: elemento.cantidad_disponible - cantidad_alquiler
    });

    res.status(201).json(alquiler);
  } catch (error) {
    console.error('Error al crear alquiler:', error);
    res.status(500).json({ error: 'Error al crear alquiler' });
  }
};

export const getAllAlquileres = async (req: Request, res: Response) => {
  try {
    const alquileres = await AlquilerServicio.findAll({
      include: [
        {
          model: Elemento,
          as: 'elemento'
        },
        {
          model: Evento,
          as: 'evento'
        }
      ]
    });
    res.json(alquileres);
  } catch (error) {
    console.error('Error al obtener alquileres:', error);
    res.status(500).json({ error: 'Error al obtener alquileres' });
  }
};

export const getAlquileresByEvento = async (req: Request, res: Response) => {
  try {
    const { id_evento } = req.params;
    const alquileres = await AlquilerServicio.findAll({
      where: { id_evento },
      include: [
        {
          model: Elemento,
          as: 'elemento'
        }
      ]
    });
    res.json(alquileres);
  } catch (error) {
    console.error('Error al obtener alquileres:', error);
    res.status(500).json({ error: 'Error al obtener alquileres' });
  }
};

export const getAlquileresByElemento = async (req: Request, res: Response) => {
  try {
    const { id_elemento } = req.params;
    const alquileres = await AlquilerServicio.findAll({
      where: { id_elemento },
      include: [
        {
          model: Evento,
          as: 'evento'
        }
      ]
    });
    res.json(alquileres);
  } catch (error) {
    console.error('Error al obtener alquileres:', error);
    res.status(500).json({ error: 'Error al obtener alquileres' });
  }
};

export const editAlquilerServicio = async (req: Request, res: Response) => {
  try {
    const { id_alquiler } = req.params;
    const {
      precio_unitario,
      cantidad_alquiler,
      precioneto_alquiler,
      itbis_alquiler,
      total_alquiler
    } = req.body;

    const alquiler = await AlquilerServicio.findByPk(id_alquiler);
    if (!alquiler) {
      return res.status(404).json({ error: 'Alquiler no encontrado' });
    }

    // Si se está modificando la cantidad, verificar stock
    if (cantidad_alquiler && cantidad_alquiler !== alquiler.cantidad_alquiler) {
      const elemento = await Elemento.findByPk(alquiler.id_elemento);
      if (!elemento) {
        return res.status(404).json({ error: 'Elemento no encontrado' });
      }

      const diferenciaStock = alquiler.cantidad_alquiler - cantidad_alquiler;
      if (elemento.cantidad_disponible + diferenciaStock < 0) {
        return res.status(400).json({ error: 'No hay suficiente stock disponible' });
      }

      // Actualizar el stock del elemento
      await elemento.update({
        cantidad_disponible: elemento.cantidad_disponible + diferenciaStock
      });
    }

    // Actualizar el alquiler
    await alquiler.update({
      precio_unitario: precio_unitario || alquiler.precio_unitario,
      cantidad_alquiler: cantidad_alquiler || alquiler.cantidad_alquiler,
      precioneto_alquiler: precioneto_alquiler || alquiler.precioneto_alquiler,
      itbis_alquiler: itbis_alquiler || alquiler.itbis_alquiler,
      total_alquiler: total_alquiler || alquiler.total_alquiler
    });

    res.json(alquiler);
  } catch (error) {
    console.error('Error al editar alquiler:', error);
    res.status(500).json({ error: 'Error al editar alquiler' });
  }
};

export const deleteAlquilerServicio = async (req: Request, res: Response) => {
  try {
    const { id_alquiler } = req.params;
    const alquiler = await AlquilerServicio.findByPk(id_alquiler);
    
    if (!alquiler) {
      return res.status(404).json({ error: 'Alquiler no encontrado' });
    }

    // Restaurar el stock del elemento
    const elemento = await Elemento.findByPk(alquiler.id_elemento);
    if (elemento) {
      await elemento.update({
        cantidad_disponible: elemento.cantidad_disponible + alquiler.cantidad_alquiler
      });
    }

    // Borrado lógico - marcar como eliminado
    await alquiler.update({
      estado: 'Eliminado'
    });

    res.json({ message: 'Alquiler eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar alquiler:', error);
    res.status(500).json({ error: 'Error al eliminar alquiler' });
  }
}; 