import { Router, RequestHandler } from 'express';
import { 
  createMontajeDesmontaje,
  editMontajeDesmontaje,
  getMontajesDesmontajes,
  deleteMontajeDesmontaje
} from '../controllers/montajeDesmontajeController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(verificarToken as RequestHandler);

// Obtener todos los servicios de montaje/desmontaje
router.get('/', (req, res, next) => {
  getMontajesDesmontajes(req, res).catch(next);
});

// Crear un nuevo servicio de montaje/desmontaje
router.post('/', (req, res, next) => {
  createMontajeDesmontaje(req, res).catch(next);
});

// Editar un servicio de montaje/desmontaje
router.put('/:id_montdes', (req, res, next) => {
  editMontajeDesmontaje(req, res).catch(next);
});

// Eliminar lógicamente un servicio de montaje/desmontaje
router.delete('/:id_montdes', (req, res, next) => {
  deleteMontajeDesmontaje(req, res).catch(next);
});

export default router; 