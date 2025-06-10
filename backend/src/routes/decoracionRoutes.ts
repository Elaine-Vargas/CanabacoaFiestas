import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import {
    createDecoracion,
    getAllDecoraciones,
    editDecoracion,
    deleteDecoracion,
    createDetalleDecoracion,
    deleteDetalleDecoracion,
    getDetallesByDecoracion,
    getAllDetallesDecoracion
} from '../controllers/decoracionController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

// Middleware de autenticación para todas las rutas
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    verificarToken(req, res, next);
};

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Crear un nuevo servicio de decoración
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await createDecoracion(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener todos los servicios de decoración
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getAllDecoraciones(req, res);
    } catch (error) {
        next(error);
    }
});

// Editar un servicio de decoración
router.put('/:id_decoracion', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await editDecoracion(req, res);
    } catch (error) {
        next(error);
    }
});

// Eliminar un servicio de decoración (borrado lógico)
router.delete('/:id_decoracion', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await deleteDecoracion(req, res);
    } catch (error) {
        next(error);
    }
});

// Rutas para detalles de decoración
// Crear un detalle de decoración
router.post('/detalle', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await createDetalleDecoracion(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener todos los detalles de una decoración específica
router.get('/detalle/:id_decoracion', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getDetallesByDecoracion(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener todos los detalles de decoración activos
router.get('/detalles', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getAllDetallesDecoracion(req, res);
    } catch (error) {
        next(error);
    }
});

// Eliminar un detalle de decoración (borrado lógico)
router.delete('/detalle/:id_detalle_decoracion', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await deleteDetalleDecoracion(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;
