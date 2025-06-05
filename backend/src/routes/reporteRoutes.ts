// routes/reporte.routes.ts
import { Router } from 'express';
import { generarReporteEventos, generarReporteUsuarios } from '../controllers/reportesController';

const router = Router();

router.get('/usuarios', generarReporteUsuarios);
router.get('/eventos', generarReporteEventos);

export default router;
