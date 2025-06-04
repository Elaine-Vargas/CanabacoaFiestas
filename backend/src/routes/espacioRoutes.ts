import { Router, Request, Response, NextFunction } from 'express';
import {
  createEspacio,
  getEspacios,
  searchEspacios,
  getEspacioById,
  editEspacio,
  deleteEspacio
} from '../controllers/espacioController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

// Middleware de autenticación para todas las rutas
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  verificarToken(req, res, next);
};

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Crear un nuevo espacio
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createEspacio(req, res);
  } catch (error) {
    next(error);
  }
});

// Obtener todos los espacios
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getEspacios(req, res);
  } catch (error) {
    next(error);
  }
});

// Buscar espacios
router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await searchEspacios(req, res);
  } catch (error) {
    next(error);
  }
});

// Obtener un espacio por ID
router.get('/:id_espacio', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getEspacioById(req, res);
  } catch (error) {
    next(error);
  }
});

// Editar un espacio
router.put('/:id_espacio', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await editEspacio(req, res);
  } catch (error) {
    next(error);
  }
});

// Eliminar un espacio
router.delete('/:id_espacio', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteEspacio(req, res);
  } catch (error) {
    next(error);
  }
});

export default router; 