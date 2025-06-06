import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import {
    // Catering controllers
    createCatering,
    getAllCaterings,
    getCateringById,
    editCatering,
    deleteCatering,
    // Menu controllers
    createMenu,
    getAllMenus,
    getMenuByCatering,
    editMenu,
    deleteMenu,
    // MenuCatering controllers
    addMenuToCatering,
    removeMenuFromCatering,
    getMenusByCatering,
    getMenuCatalog,
    // Plato controllers
    getAllPlatos,
    getPlatoById,
    createPlato,
    updatePlato,
    deletePlato
} from '../controllers/cateringController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

// Middleware de autenticación para todas las rutas
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    verificarToken(req, res, next);
};

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Rutas para Catering
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

// Rutas para Menu
// Crear un nuevo menú
router.post('/menu', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await createMenu(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener todos los menús
router.get('/menu', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getAllMenus(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener menús por catering
router.get('/menu/catering/:id_catering', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getMenuByCatering(req, res);
    } catch (error) {
        next(error);
    }
});

// Editar un menú
router.put('/menu/:id_menu', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await editMenu(req, res);
    } catch (error) {
        next(error);
    }
});

// Eliminar un menú (borrado lógico)
router.delete('/menu/:id_menu', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await deleteMenu(req, res);
    } catch (error) {
        next(error);
    }
});

// Rutas para MenuCatering
// Agregar un menú a un catering
router.post('/menu/catering', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await addMenuToCatering(req, res);
    } catch (error) {
        next(error);
    }
});

// Remover un menú de un catering
router.delete('/menu/catering/:id_catering/:id_menu', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await removeMenuFromCatering(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener todos los menús de un catering
router.get('/menu/catering/:id_catering/menus', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getMenusByCatering(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener catálogo de menús
router.get('/menu/catalogo', getMenuCatalog);

// Rutas para Plato
// Obtener todos los platos
router.get('/plato', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getAllPlatos(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener un plato por ID
router.get('/plato/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getPlatoById(req, res);
    } catch (error) {
        next(error);
    }
});

// Crear un nuevo plato
router.post('/plato', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await createPlato(req, res);
    } catch (error) {
        next(error);
    }
});

// Actualizar un plato
router.put('/plato/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await updatePlato(req, res);
    } catch (error) {
        next(error);
    }
});

// Eliminar un plato
router.delete('/plato/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await deletePlato(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;
