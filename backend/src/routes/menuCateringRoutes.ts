import { Router, Request, Response, NextFunction } from 'express';
import {
    // MenuCatering controllers
    addMenuToCatering,
    removeMenuFromCatering,
    updateMenuCatering,
    getMenusByCateringId,
} from '../controllers/menuCateringController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

// Middleware de autenticación para todas las rutas
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    verificarToken(req, res, next);
};
// Aplicar autenticación a todas las rutas
router.use(authMiddleware);


// Rutas para MenuCatering
// Agregar un menú a un catering
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await addMenuToCatering(req, res);
    } catch (error) {
        next(error);
    }
});

// Remover un menú de un catering
router.delete('/:id_catering/:id_menu', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await removeMenuFromCatering(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener todos los menús de un catering
router.get('/:id_catering/menus', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getMenusByCateringId(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;
