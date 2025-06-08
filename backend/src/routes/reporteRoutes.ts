// routes/reporte.routes.ts
import { Router, RequestHandler } from 'express';
import { generarReporteEventos } from '../controllers/reports/reportesController';
import {ReporteGeneralUsuarios, ReporteUsuariosPorRol} from '../controllers/reports/usuarioReport'
const router = Router();

router.get('/usuario', ReporteGeneralUsuarios as RequestHandler);
router.get('/usuario/rol/:id_rol', ReporteUsuariosPorRol as RequestHandler);

router.get('/eventos', generarReporteEventos as RequestHandler);

export default router;
