import { Router, Request, Response, NextFunction } from 'express';
import {
  createSupervision,
  getSupervisiones,
  editSupervision,
  deleteSupervision
} from '../controllers/supervisionController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

// Middleware de autenticación para todas las rutas
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  verificarToken(req, res, next);
};

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Crear un nuevo servicio de supervisión
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createSupervision(req, res);
  } catch (error) {
    next(error);
  }
});

// Obtener todos los servicios de supervisión
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getSupervisiones(req, res);
  } catch (error) {
    next(error);
  }
});

// Editar un servicio de supervisión
router.put('/:id_supervision', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await editSupervision(req, res);
  } catch (error) {
    next(error);
  }
});

// Eliminar un servicio de supervisión
router.delete('/:id_supervision', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteSupervision(req, res);
  } catch (error) {
    next(error);
  }
});

export default router; 