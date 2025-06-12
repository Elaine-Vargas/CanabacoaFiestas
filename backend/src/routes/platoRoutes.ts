import { Router, Request, Response, NextFunction } from 'express';
import {
    // Plato controllers
    createPlato,
    getAllPlatos,
    getPlatoById,
    updatePlato,
    
} from '../controllers/platoController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

// Middleware de autenticación para todas las rutas
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    verificarToken(req, res, next);
};

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Rutas para Plato
// Crear un nuevo plato
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await createPlato(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener todos los platos
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getAllPlatos(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener un plato por ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getPlatoById(req, res);
    } catch (error) {
        next(error);
    }
});

// Editar un plato
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await updatePlato(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;
