import { Router, Request, Response, NextFunction } from 'express';
import {
    // Menu controllers
    createMenu,
    getMenuCatalog,
    getMenuById,
    updateMenu,
    deleteMenu,
} from '../controllers/menuController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

// Middleware de autenticación para todas las rutas
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    verificarToken(req, res, next);
};

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Rutas para Menu
// Crear un nuevo menú
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await createMenu(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener todos los menús
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getMenuCatalog(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener un menú por ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getMenuById(req, res);
    } catch (error) {
        next(error);
    }
});

// Editar un menú
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await updateMenu(req, res);
    } catch (error) {
        next(error);
    }
});

// Eliminar un menú (borrado lógico)
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await deleteMenu(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;
