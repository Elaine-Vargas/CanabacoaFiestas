import { Request, Response } from 'express';
import Rol from '../models/Rol_model';

export const getPermissionsByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        const rol = await Rol.findByPk(id);

        if (!rol) {
            res.status(404).json({ message: 'Rol no encontrado' });
            return;
        }

        const permisos = rol.permisos || [];
        res.json(permisos);
    } catch (error) {
        console.error('Error al obtener permisos:', error);
        res.status(500).json({ message: 'Error al obtener permisos' });
    }
}; 