import { Request, Response } from 'express';
import Banco from '../models/Banco_model';

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