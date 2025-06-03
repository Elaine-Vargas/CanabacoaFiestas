import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController';

const router = Router();

// Obtener estadísticas del dashboard
router.get('/stats', getDashboardStats);

export default router; 