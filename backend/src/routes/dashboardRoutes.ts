import { Router } from 'express';
import { getDashboardStats, getEventosRealizados } from '../controllers/dashboardController';

const router = Router();

// Obtener estadísticas del dashboard
router.get('/stats', async (req, res) => {
  await getDashboardStats(req, res);
});

// Obtener eventos realizados del cliente
router.get('/eventos/realizados', async (req, res) => {
  await getEventosRealizados(req, res);
});

export default router; 