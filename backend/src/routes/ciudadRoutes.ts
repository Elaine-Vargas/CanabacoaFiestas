import { Router, RequestHandler } from 'express';
import { 
  getCiudades, 
  getCiudadesByProvincia,
  searchCiudades
} from '../controllers/ciudadController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(verificarToken as RequestHandler);

// Obtener todas las ciudades
router.get('/', getCiudades as RequestHandler);

// Buscar ciudades
router.get('/search', searchCiudades as RequestHandler);

// Obtener ciudades por provincia
router.get('/provincia/:id_provincia', getCiudadesByProvincia as RequestHandler);

export default router; 