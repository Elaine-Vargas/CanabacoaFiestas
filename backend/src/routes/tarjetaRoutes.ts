import { Router, Request, Response, NextFunction } from 'express';
import {
  createTarjeta,
  getTarjetas,
  getTarjetasByCliente
} from '../controllers/tarjetaController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

// Middleware de autenticación para todas las rutas
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  verificarToken(req, res, next);
};

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Crear una nueva tarjeta
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createTarjeta(req, res);
  } catch (error) {
    next(error);
  }
});

// Obtener todas las tarjetas
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getTarjetas(req, res);
  } catch (error) {
    next(error);
  }
});

// Obtener tarjetas por cliente
router.get('/cliente/:usuario_creador', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getTarjetasByCliente(req, res);
  } catch (error) {
    next(error);
  }
});

export default router; 