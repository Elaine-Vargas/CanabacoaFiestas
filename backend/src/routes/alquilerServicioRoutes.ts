import { Router } from 'express';
import { createAlquilerServicio, getAlquileresByEvento, deleteAlquilerServicio } from '../controllers/alquilerServicioController';

const router = Router();

router.post('/', createAlquilerServicio);
router.get('/evento/:id_evento', getAlquileresByEvento);
router.delete('/:id', deleteAlquilerServicio);

export default router; 