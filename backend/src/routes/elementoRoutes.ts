import { Router, RequestHandler } from 'express';
import { 
  getElementos, 
  getElementoById, 
  getCategorias,
  getColores,
  getMateriales
} from '../controllers/elementoController';

const router = Router();

// Obtener todas las categorías
router.get('/categorias/list', getCategorias as RequestHandler);

// Obtener todos los colores
router.get('/colores/list', getColores as RequestHandler);

// Obtener todos los materiales
router.get('/materiales/list', getMateriales as RequestHandler);

// Obtener elementos filtrados
router.get('/filtrados', getElementos as RequestHandler);

// Obtener un elemento por ID
router.get('/elemento/:id', getElementoById as RequestHandler);

// Obtener todos los elementos
router.get('/', getElementos as RequestHandler);

export default router; 