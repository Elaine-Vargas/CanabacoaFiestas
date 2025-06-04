import { Router, Request, Response, NextFunction } from 'express';
import { getBancos } from '../controllers/bancoController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

// Middleware de autenticación para todas las rutas
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  verificarToken(req, res, next);
};

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Obtener todos los bancos
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getBancos(req, res);
  } catch (error) {
    next(error);
  }
});

export default router; 