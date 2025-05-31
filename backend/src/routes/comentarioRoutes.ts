import { Router, RequestHandler } from 'express';
import { 
  getComentarios, 
} from '../controllers/comentarioController';

const router = Router();

// Obtener todos los comentarios
router.get('/', getComentarios as RequestHandler);

export default router; 