import { Router, Request, Response, NextFunction } from 'express';
import { 
  createComentario,
  getComentarios,
  getComentariosByEvento,
  getComentariosByUsuario,
  editComentario,
  deleteComentario
} from '../controllers/comentarioController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

// Middleware de autenticación para todas las rutas
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  verificarToken(req, res, next);
};

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Crear un nuevo comentario
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createComentario(req, res);
  } catch (error) {
    next(error);
  }
});

// Obtener todos los comentarios
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getComentarios(req, res);
  } catch (error) {
    next(error);
  }
});

// Obtener comentarios por evento
router.get('/evento/:id_evento', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getComentariosByEvento(req, res);
  } catch (error) {
    next(error);
  }
});

// Obtener comentarios por usuario
router.get('/usuario/:cedula_usuario', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getComentariosByUsuario(req, res);
  } catch (error) {
    next(error);
  }
});

// Editar un comentario
router.put('/:id_comentario', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await editComentario(req, res);
  } catch (error) {
    next(error);
  }
});

// Eliminar lógicamente un comentario
router.delete('/:id_comentario', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteComentario(req, res);
  } catch (error) {
    next(error);
  }
});

export default router; 