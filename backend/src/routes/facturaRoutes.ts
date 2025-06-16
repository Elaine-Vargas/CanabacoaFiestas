import { Router, RequestHandler } from 'express';
import { 
  getFacturaById, 
} from '../controllers/facturaController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(verificarToken as RequestHandler);

// Obtener una factura por ID
router.get('/:id_factura', getFacturaById as RequestHandler);

export default router;