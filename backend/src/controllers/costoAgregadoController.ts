import { Request, Response } from 'express';
import CostoAgregadoEvento from '../models/CostoAgregadoEvento_model';
import Evento from '../models/Evento_model';

// Crear un nuevo costo agregado
export const createCostoAgregado = async (req: Request, res: Response) => {
  try {
    const {
      id_evento,
      descripcion,
      monto,
      tipo_costo,
      desc_costo
    } = req.body;

    // Verificar que el evento existe
    const evento = await Evento.findByPk(id_evento);
    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    // Crear el costo agregado
    const costoAgregado = await CostoAgregadoEvento.create({
      id_evento,
      descripcion,
      monto,
      tipo_costo,
      desc_costo,
      fecha_registro: new Date()
    });

    // Obtener el costo agregado con su evento
    const costoCompleto = await CostoAgregadoEvento.findByPk(costoAgregado.id_costo_agregado, {
      include: [Evento]
    });

    res.status(201).json(costoCompleto);
  } catch (error) {
    console.error('Error al crear costo agregado:', error);
    res.status(500).json({ error: 'Error al crear costo agregado' });
  }
};

// Obtener todos los costos agregados de un evento
export const getCostosByEvento = async (req: Request, res: Response) => {
  try {
    const { id_evento } = req.params;

    // Verificar que el evento existe
    const evento = await Evento.findByPk(id_evento);
    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }

    const costos = await CostoAgregadoEvento.findAll({
      where: { id_evento },
      include: [Evento],
      order: [['fecha_registro', 'DESC']]
    });

    res.json(costos);
  } catch (error) {
    console.error('Error al obtener costos agregados:', error);
    res.status(500).json({ error: 'Error al obtener costos agregados' });
  }
};

// Editar un costo agregado
export const editCostoAgregado = async (req: Request, res: Response) => {
  try {
    const { id_costo_agregado } = req.params;
    const {
      descripcion,
      monto,
      tipo_costo,
      desc_costo
    } = req.body;

    const costo = await CostoAgregadoEvento.findByPk(id_costo_agregado);
    if (!costo) {
      return res.status(404).json({ error: 'Costo agregado no encontrado' });
    }

    // Actualizar el costo agregado
    await costo.update({
      descripcion: descripcion || costo.descripcion,
      monto: monto || costo.monto,
      tipo_costo: tipo_costo || costo.tipo_costo,
      desc_costo: desc_costo || costo.desc_costo
    });

    // Obtener el costo actualizado con su evento
    const costoActualizado = await CostoAgregadoEvento.findByPk(id_costo_agregado, {
      include: [Evento]
    });

    res.json(costoActualizado);
  } catch (error) {
    console.error('Error al editar costo agregado:', error);
    res.status(500).json({ error: 'Error al editar costo agregado' });
  }
};

// Eliminar un costo agregado
export const deleteCostoAgregado = async (req: Request, res: Response) => {
  try {
    const { id_costo_agregado } = req.params;

    const costo = await CostoAgregadoEvento.findByPk(id_costo_agregado);
    if (!costo) {
      return res.status(404).json({ error: 'Costo agregado no encontrado' });
    }

    await costo.destroy();

    res.json({ message: 'Costo agregado eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar costo agregado:', error);
    res.status(500).json({ error: 'Error al eliminar costo agregado' });
  }
}; 