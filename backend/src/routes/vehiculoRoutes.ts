import { Router, RequestHandler } from 'express';
import { 
  getVehiculos,
  searchVehiculos,
  createVehiculo,
  editVehiculo,
  deleteVehiculo
} from '../controllers/vehiculoController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(verificarToken as RequestHandler);

// Obtener todos los vehículos
router.get('/', getVehiculos as RequestHandler);

// Buscar vehículos
router.get('/search', searchVehiculos as RequestHandler);

// Crear un nuevo vehículo
router.post('/', createVehiculo as RequestHandler);

// Editar un vehículo
router.put('/:matricula_vehiculo', editVehiculo as RequestHandler);

// Eliminar lógicamente un vehículo
router.delete('/:matricula_vehiculo', deleteVehiculo as RequestHandler);

export default router;