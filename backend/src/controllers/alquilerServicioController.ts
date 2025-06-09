import { Request, Response } from 'express';
import AlquilerServicio from '../models/AlquilerServicio_model';
import Elemento from '../models/Elemento_model';
import Evento from '../models/Evento_model';
import DetalleAlquiler from '../models/DetalleAlquiler_model';
import { Op } from 'sequelize';

export const createAlquilerServicio = async (req: Request, res: Response) => {
  try {
    const {
      id_evento,
      cant_elementos_alquiler,
      precioneto_alquiler,
      itbis_alquiler,
      total_alquiler,
      estado_alquiler
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
    const alquileres = await AlquilerServicio.findAll({
      where: { id_evento },
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

    if (!alquileres || alquileres.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontraron alquileres',
        mensaje: 'No hay alquileres registrados para este elemento'
      });
    }

    res.json(alquileres);
  } catch (error) {
    console.error('Error al obtener alquileres:', error);
    res.status(500).json({ 
      error: 'Error al obtener los alquileres',
      mensaje: 'Ocurrió un error al cargar los alquileres'
    });
  }
};

export const editAlquilerServicio = async (req: Request, res: Response) => {
  try {
    const { id_alquiler } = req.params;
    const {
      cant_elementos_alquiler,
      precioneto_alquiler,
      itbis_alquiler,
      total_alquiler,
      estado_alquiler
    } = req.body;

    const alquiler = await AlquilerServicio.findByPk(id_alquiler);
    if (!alquiler) {
      return res.status(404).json({ error: 'Alquiler no encontrado' });
    }

    // Actualizar el alquiler
    await alquiler.update({
      cant_elementos_alquiler: cant_elementos_alquiler || alquiler.cant_elementos_alquiler,
      precioneto_alquiler: precioneto_alquiler || alquiler.precioneto_alquiler,
      itbis_alquiler: itbis_alquiler || alquiler.itbis_alquiler,
      total_alquiler: total_alquiler || alquiler.total_alquiler,
      estado_alquiler: estado_alquiler || alquiler.estado_alquiler
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

    // Borrado lógico - marcar como cancelado
    await alquiler.update({
      estado_alquiler: 'Cancelado'
    });

    res.json({ message: 'Alquiler cancelado correctamente' });
  } catch (error) {
    console.error('Error al eliminar alquiler:', error);
    res.status(500).json({ error: 'Error al eliminar alquiler' });
  }
}; 