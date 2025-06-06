import { Request, Response } from 'express';
import Tarjeta from '../models/Tarjeta_model';
import Usuario from '../models/Usuario_model';
import Banco from '../models/Banco_model';

// Crear una nueva tarjeta
export const createTarjeta = async (req: Request, res: Response) => {
  try {
    const {
      usuario_creador,
      tipo_tarjeta,
      banco_tarjeta,
      num_tarjeta,
      titular_tarjeta,
      venc_tarjeta,
      cvv_tarjeta
    } = req.body;

    // Verificar que el usuario existe
    const usuario = await Usuario.findByPk(usuario_creador);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar que el banco existe
    const banco = await Banco.findByPk(banco_tarjeta);
    if (!banco) {
      return res.status(404).json({ error: 'Banco no encontrado' });
    }

    // Crear la tarjeta
    const tarjeta = await Tarjeta.create({
      usuario_creador,
      tipo_tarjeta,
      banco_tarjeta,
      num_tarjeta,
      titular_tarjeta,
      venc_tarjeta,
      cvv_tarjeta,
      estado_tarjeta: 'Activa',
      creacion_tarjeta: new Date()
    });

    // Obtener la tarjeta con sus relaciones
    const tarjetaCompleta = await Tarjeta.findByPk(tarjeta.id_tarjeta, {
      include: [
        {
          model: Usuario,
          as: 'usuario'
        },
        {
          model: Banco,
          as: 'banco'
        }
      ]
    });

    res.status(201).json(tarjetaCompleta);
  } catch (error) {
    console.error('Error al crear tarjeta:', error);
    res.status(500).json({ error: 'Error al crear tarjeta' });
  }
};

// Obtener todas las tarjetas
export const getTarjetas = async (req: Request, res: Response) => {
  try {
    const tarjetas = await Tarjeta.findAll({
      include: [
        {
          model: Usuario,
          as: 'usuario'
        },
        {
          model: Banco,
          as: 'banco'
        }
      ],
      where: {
        estado_tarjeta: 'Activa'
      },
      order: [['creacion_tarjeta', 'DESC']]
    });

    res.json(tarjetas);
  } catch (error) {
    console.error('Error al obtener tarjetas:', error);
    res.status(500).json({ error: 'Error al obtener tarjetas' });
  }
};

// Obtener tarjetas por cliente
export const getTarjetasByCliente = async (req: Request, res: Response) => {
  try {
    const { usuario_creador } = req.params;

    // Verificar que el usuario existe
    const usuario = await Usuario.findByPk(usuario_creador);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const tarjetas = await Tarjeta.findAll({
      where: {
        usuario_creador,
        estado_tarjeta: 'Activa'
      },
      include: [
        {
          model: Usuario,
          as: 'usuario'
        },
        {
          model: Banco,
          as: 'banco'
        }
      ],
      order: [['creacion_tarjeta', 'DESC']]
    });

    res.json(tarjetas);
  } catch (error) {
    console.error('Error al obtener tarjetas del cliente:', error);
    res.status(500).json({ error: 'Error al obtener tarjetas del cliente' });
  }
}; 

// Obtener todos los bancos
export const getBancos = async (req: Request, res: Response) => {
  try {
    const bancos = await Banco.findAll({
      order: [['banco', 'ASC']]
    });

    res.json(bancos);
  } catch (error) {
    console.error('Error al obtener bancos:', error);
    res.status(500).json({ error: 'Error al obtener bancos' });
  }
}; 