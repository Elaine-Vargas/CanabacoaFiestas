import { Request, Response } from 'express';
import Plato from '../models/Plato_model';

// Get all platos
export const getAllPlatos = async (req: Request, res: Response) => {
    try {
        const platos = await Plato.findAll();
        res.json(platos);
    } catch (error) {
        console.error('Error al obtener platos:', error);
        res.status(500).json({ error: 'Error al obtener platos' });
    }
};

// Get plato by ID
export const getPlatoById = async (req: Request, res: Response) => {
    try {
        const plato = await Plato.findByPk(req.params.id);
        if (!plato) {
            return res.status(404).json({ message: 'Plato no encontrado' });
        }
        res.json(plato);
    } catch (error) {
        console.error('Error al obtener plato:', error);
        res.status(500).json({ message: 'Error al obtener plato' });
    }
};

// Create new plato
export const createPlato = async (req: Request, res: Response) => {
    try {
        const plato = await Plato.create(req.body);
        res.status(201).json(plato);
    } catch (error) {
        console.error('Error al crear plato:', error);
        res.status(500).json({ message: 'Error al crear plato' });
    }
};

// Update plato
export const updatePlato = async (req: Request, res: Response) => {
    try {
        const plato = await Plato.findByPk(req.params.id);
        if (!plato) {
            return res.status(404).json({ message: 'Plato no encontrado' });
        }
        await plato.update(req.body);
        res.json(plato);
    } catch (error) {
        console.error('Error al actualizar plato:', error);
        res.status(500).json({ message: 'Error al actualizar plato' });
    }
};

// Delete plato
export const deletePlato = async (req: Request, res: Response) => {
    try {
        const plato = await Plato.findByPk(req.params.id);
        if (!plato) {
            return res.status(404).json({ message: 'Plato no encontrado' });
        }
        await plato.destroy();
        res.json({ message: 'Plato eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar plato:', error);
        res.status(500).json({ message: 'Error al eliminar plato' });
    }
}; 