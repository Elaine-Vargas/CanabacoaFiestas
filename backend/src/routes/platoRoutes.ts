import { Router, Request, Response, NextFunction } from 'express';
import {
    getAllPlatos,
    getPlatoById,
    createPlato,
    updatePlato,
    deletePlato
} from '../controllers/platoController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

// Middleware de autenticación para todas las rutas
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    verificarToken(req, res, next);
};

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Get all platos
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getAllPlatos(req, res);
    } catch (error) {
        next(error);
    }
});

// Get plato by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getPlatoById(req, res);
    } catch (error) {
        next(error);
    }
});

// Create new plato
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await createPlato(req, res);
    } catch (error) {
        next(error);
    }
});

// Update plato
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await updatePlato(req, res);
    } catch (error) {
        next(error);
    }
});

// Delete plato
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await deletePlato(req, res);
    } catch (error) {
        next(error);
    }
});

export default router; 