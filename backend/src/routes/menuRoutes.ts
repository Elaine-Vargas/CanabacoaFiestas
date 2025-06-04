import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import {
    // Controladores de Menu
    createMenu,
    getAllMenus,
    getMenuByCatering,
    editMenu,
    deleteMenu,
    // Controladores de MenuCatering
    addMenuToCatering,
    removeMenuFromCatering,
    getMenusByCatering
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
        await getAllMenus(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener menús por catering
router.get('/catering/:id_catering/menus', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getMenuByCatering(req, res);
    } catch (error) {
        next(error);
    }
});

// Editar un menú
router.put('/:id_menu', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await editMenu(req, res);
    } catch (error) {
        next(error);
    }
});

// Eliminar un menú (borrado lógico)
router.delete('/:id_menu', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await deleteMenu(req, res);
    } catch (error) {
        next(error);
    }
});

// Rutas para MenuCatering
// Agregar un menú a un catering
router.post('/catering', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await addMenuToCatering(req, res);
    } catch (error) {
        next(error);
    }
});

// Remover un menú de un catering
router.delete('/catering/:id_catering/:id_menu', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await removeMenuFromCatering(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener todos los menús de un catering
router.get('/catering/:id_catering', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getMenusByCatering(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;
