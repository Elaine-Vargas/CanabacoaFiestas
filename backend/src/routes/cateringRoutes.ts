import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import {
    createCatering,
    getAllCaterings,
    getCateringById,
    editCatering,
    deleteCatering
} from '../controllers/cateringController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

// Middleware de autenticación para todas las rutas
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    verificarToken(req, res, next);
};

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Crear un nuevo servicio de catering
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await createCatering(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener todos los servicios de catering
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getAllCaterings(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener un servicio de catering por ID
router.get('/:id_catering', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getCateringById(req, res);
    } catch (error) {
        next(error);
    }
});

// Editar un servicio de catering
router.put('/:id_catering', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await editCatering(req, res);
    } catch (error) {
        next(error);
    }
});

// Eliminar un servicio de catering (borrado lógico)
router.delete('/:id_catering', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await deleteCatering(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;
