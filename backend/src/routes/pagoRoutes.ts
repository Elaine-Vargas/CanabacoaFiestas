import { Router, RequestHandler } from 'express';
import { 
  getPagos, 
  getPagoById, 
  searchPagos,
  createPago,
  editPago,
  cambiarEstadoPago,
  deletePago
} from '../controllers/pagoController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(verificarToken as RequestHandler);

// Obtener todos los pagos
router.get('/', getPagos as RequestHandler);

// Buscar pagos con filtros (estado, tipo, fecha_inicio, fecha_fin, id_evento, id_tarjeta)
router.get('/search', searchPagos as RequestHandler);

// Crear un nuevo pago
router.post('/', createPago as RequestHandler);

// Obtener un pago por ID
router.get('/:id_pago', getPagoById as RequestHandler);

// Editar un pago
router.put('/:id_pago', editPago as RequestHandler);

// Cambiar estado de un pago
router.patch('/:id_pago/estado', cambiarEstadoPago as RequestHandler);

// Eliminar lógicamente un pago
router.delete('/:id_pago', deletePago as RequestHandler);

export default router; 