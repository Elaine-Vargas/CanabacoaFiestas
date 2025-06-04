import { Router, RequestHandler } from 'express';
import { 
  getElementos, 
  getElementoById, 
  getCategorias,
  getColores,
  getMateriales,
  createElemento,
  searchElementos,
  editElemento,
  deleteElemento
} from '../controllers/elementoController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

// Rutas públicas (GET)
// Obtener todas las categorías
router.get('/categorias/list', getCategorias as RequestHandler);

// Obtener todos los colores
router.get('/colores/list', getColores as RequestHandler);

// Obtener todos los materiales
router.get('/materiales/list', getMateriales as RequestHandler);

// Buscar elementos
router.get('/search', searchElementos as RequestHandler);

// Obtener un elemento por ID
router.get('/:id_elemento', getElementoById as RequestHandler);

// Obtener todos los elementos
router.get('/', getElementos as RequestHandler);

// Obtener elementos filtrados
router.get('/filtrados', getElementos as RequestHandler);

// Middleware de autenticación para rutas protegidas
router.use(verificarToken as RequestHandler);

// Rutas protegidas (POST, PUT, DELETE)
// Crear un nuevo elemento
router.post('/', createElemento as RequestHandler);

// Editar un elemento
router.put('/:id_elemento', editElemento as RequestHandler);

// Eliminar un elemento
router.delete('/:id_elemento', deleteElemento as RequestHandler);

export default router; 