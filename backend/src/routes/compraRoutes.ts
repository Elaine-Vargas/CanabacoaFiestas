import { Router, Request, Response, NextFunction } from 'express';
import {
  createCompra,
  getCompras,
  getDetallesByCompra,
  getComprasByElemento,
  editCompra,
  deleteCompra,
  deleteDetalleCompra,
  createDetalleCompra
} from '../controllers/compraController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

// Middleware de autenticación para todas las rutas
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  verificarToken(req, res, next);
};

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Crear una nueva compra
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createCompra(req, res);
  } catch (error) {
    next(error);
  }
});

// Obtener todas las compras
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getCompras(req, res);
  } catch (error) {
    next(error);
  }
});

// Obtener detalles de una compra específica
router.get('/:id_compra/detalles', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getDetallesByCompra(req, res);
  } catch (error) {
    next(error);
  }
});

// Obtener compras por elemento
router.get('/elemento/:id_elemento', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getComprasByElemento(req, res);
  } catch (error) {
    next(error);
  }
});

// Editar una compra
router.put('/:id_compra', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await editCompra(req, res);
  } catch (error) {
    next(error);
  }
});

// Eliminar lógicamente una compra
router.delete('/:id_compra', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteCompra(req, res);
  } catch (error) {
    next(error);
  }
});

// Eliminar un detalle de compra
router.delete('/detalle/:id_detalle_compra', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteDetalleCompra(req, res);
  } catch (error) {
    next(error);
  }
});

// Crear un detalle de compra individual
router.post('/detalle', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createDetalleCompra(req, res);
  } catch (error) {
    next(error);
  }
});

export default router; 