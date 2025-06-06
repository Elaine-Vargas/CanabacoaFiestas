import { Router, Request, Response, NextFunction } from 'express';
import {
  createCostoAgregado,
  getCostosByEvento,
  editCostoAgregado,
  deleteCostoAgregado,
  getAllCostosAgregados
} from '../controllers/costoAgregadoController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

// Middleware de autenticación para todas las rutas
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  verificarToken(req, res, next);
};

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Obtener todos los costos agregados
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getAllCostosAgregados(req, res);
  } catch (error) {
    next(error);
  }
});

// Crear un nuevo costo agregado
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createCostoAgregado(req, res);
  } catch (error) {
    next(error);
  }
});

// Obtener todos los costos agregados de un evento
router.get('/evento/:id_evento', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getCostosByEvento(req, res);
  } catch (error) {
    next(error);
  }
});

// Editar un costo agregado
router.put('/:id_costo_agregado', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await editCostoAgregado(req, res);
  } catch (error) {
    next(error);
  }
});

// Eliminar un costo agregado
router.delete('/:id_costo_agregado', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteCostoAgregado(req, res);
  } catch (error) {
    next(error);
  }
});

export default router; 