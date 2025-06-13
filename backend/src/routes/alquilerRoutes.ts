import { Router, Request, Response, NextFunction } from 'express';
import {
    createAlquilerServicio,
    getAllAlquileres,
    getAlquileresByEvento,
    getAlquileresByElemento,
    editAlquilerServicio,
    deleteAlquilerServicio,
    getAlquilerById,
    getElementosAlquiler,
    getAlquileresByUsuario
} from '../controllers/alquilerServicioController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

// Middleware de autenticación para todas las rutas
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    verificarToken(req, res, next);
};

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Crear un nuevo alquiler
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await createAlquilerServicio(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener todos los alquileres
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getAllAlquileres(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener un alquiler por ID
router.get('/:id_alquiler', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getAlquilerById(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener alquileres por evento
router.get('/evento/:id_evento', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getAlquileresByEvento(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener alquileres por elemento (debe ir antes de las rutas con parámetros genéricos)
router.get('/elemento/:id_elemento', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getAlquileresByElemento(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener elementos de un alquiler específico
router.get('/:id_alquiler/elementos', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getElementosAlquiler(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener alquileres por usuario
router.get('/usuario/:cedula_usuario', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getAlquileresByUsuario(req, res);
    } catch (error) {
        next(error);
    }
});

// Editar un alquiler
router.patch('/:id_alquiler', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await editAlquilerServicio(req, res);
    } catch (error) {
        next(error);
    }
});

// Eliminar un alquiler (borrado lógico)
router.delete('/:id_alquiler', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await deleteAlquilerServicio(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;
