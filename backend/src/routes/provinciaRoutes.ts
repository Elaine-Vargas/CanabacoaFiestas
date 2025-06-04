import { Router, RequestHandler } from 'express';
import { getProvincias } from '../controllers/provinciaController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(verificarToken as RequestHandler);

// Obtener todas las provincias
router.get('/', getProvincias as RequestHandler);

export default router; 