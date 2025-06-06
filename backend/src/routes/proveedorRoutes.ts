import { Router, RequestHandler } from 'express';
import {
  getProveedores, 
  searchProveedores,
  createProveedor,
  editProveedor,
  deleteProveedor
} from '../controllers/proveedorController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

// Middleware de autenticación para todas las rutas
router.use(verificarToken as RequestHandler);

// Rutas para proveedores
router.get('/', getProveedores as RequestHandler);
router.get('/search', searchProveedores as RequestHandler);
router.post('/', createProveedor as RequestHandler);
router.put('/:id_proveedor', editProveedor as RequestHandler);
router.delete('/:id_proveedor', deleteProveedor as RequestHandler);

export default router; 