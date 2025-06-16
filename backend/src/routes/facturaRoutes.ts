import { Router, RequestHandler } from 'express';
import { 
  getFacturas, 
  getFacturaById, 
  searchFacturas,
  createFactura,
  editFactura,
  cambiarEstadoFactura,
  deleteFactura
} from '../controllers/facturaController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(verificarToken as RequestHandler);

// Obtener todas las facturas
router.get('/', getFacturas as RequestHandler);

// Buscar facturas
router.get('/search', searchFacturas as RequestHandler);

// Crear una nueva factura
router.post('/', createFactura as RequestHandler);

// Obtener una factura por ID
router.get('/:id_factura', getFacturaById as RequestHandler);

// Editar una factura
router.put('/:id_factura', editFactura as RequestHandler);

// Cambiar estado de una factura
router.patch('/:id_factura/estado', cambiarEstadoFactura as RequestHandler);

// Eliminar lógicamente una factura
router.delete('/:id_factura', deleteFactura as RequestHandler);

export default router;