// routes/reporte.routes.ts
import { Router, RequestHandler } from 'express';
import { generarReporteEventos, generarReporteUsuarios } from '../controllers/reportesController';

const router = Router();

router.get('/usuarios', generarReporteUsuarios as RequestHandler);
router.get('/eventos', generarReporteEventos as RequestHandler);

export default router;
