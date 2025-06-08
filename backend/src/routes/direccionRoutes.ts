import { Router, RequestHandler } from 'express';
import { 
  getDirecciones, 
  getDireccionById, 
  searchDirecciones,
  createDireccion,
  editDireccion,
  deleteDireccion,
  getCiudades,
  getCiudadesByProvincia,
  getProvincias
} from '../controllers/direccionController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(verificarToken as RequestHandler);

// Obtener todas las direcciones
router.get('/', getDirecciones as RequestHandler);

// Obtener todas las provincias
router.get('/provincias', getProvincias as RequestHandler);

// Obtener todas las ciudades
router.get('/ciudades', getCiudades as RequestHandler);

// Obtener ciudades por provincia
router.get('/ciudades/provincia/:id_provincia', getCiudadesByProvincia as RequestHandler);

// Buscar direcciones
router.get('/search', searchDirecciones as RequestHandler);

// Crear una nueva dirección
router.post('/', createDireccion as RequestHandler);

// Obtener una dirección por ID
router.get('/:id_direccion', getDireccionById as RequestHandler);

// Editar una dirección
router.put('/:id_direccion', editDireccion as RequestHandler);

// Eliminar una dirección
router.delete('/:id_direccion', deleteDireccion as RequestHandler);

export default router; 