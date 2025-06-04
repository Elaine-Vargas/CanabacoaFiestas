import { Router, Request, Response, NextFunction } from 'express';
import {
  createTransporte,
  getTransportes,
  editTransporte,
  deleteTransporte
} from '../controllers/transporteController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

// Middleware de autenticación para todas las rutas
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  verificarToken(req, res, next);
};

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Crear un nuevo servicio de transporte
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createTransporte(req, res);
  } catch (error) {
    next(error);
  }
});

// Obtener todos los servicios de transporte
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getTransportes(req, res);
  } catch (error) {
    next(error);
  }
});

// Editar un servicio de transporte
router.put('/:id_transporte', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await editTransporte(req, res);
  } catch (error) {
    next(error);
  }
});

// Eliminar un servicio de transporte
router.delete('/:id_transporte', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteTransporte(req, res);
  } catch (error) {
    next(error);
  }
});

export default router; 