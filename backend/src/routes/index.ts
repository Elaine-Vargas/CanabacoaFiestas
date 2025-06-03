import { Router } from 'express';
import alquilerServicioRoutes from './alquilerServicioRoutes';
import dashboardRoutes from './dashboardRoutes';

const router = Router();

router.use('/alquiler-servicio', alquilerServicioRoutes);
router.use('/api/dashboard', dashboardRoutes);

export default router; 