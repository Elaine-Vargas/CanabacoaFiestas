// routes/reporte.routes.ts
import { Router, RequestHandler } from 'express';
import { Request, Response } from 'express';
import { ReporteGeneralUsuarios, ReporteUsuariosPorRol } from '../controllers/reports/usuarioReport';
import { 
generarReporteEventos,
  generarReporteEventosCliente, 
  generarReporteEventosAsesor, 
  generarReporteEventosPersonal 
} from '../controllers/reports/eventoReport';

const router = Router();

router.get('/usuario', ReporteGeneralUsuarios as RequestHandler);
router.get('/usuario/rol/:id_rol', ReporteUsuariosPorRol as RequestHandler);

router.get('/eventos', generarReporteEventos as RequestHandler);
router.get('/eventos/cliente/:id_cliente', generarReporteEventosCliente as unknown as RequestHandler);
router.get('/eventos/asesor/:id_asesor', generarReporteEventosAsesor as unknown as RequestHandler);
router.get('/eventos/personal/:id_personal', generarReporteEventosPersonal as unknown as RequestHandler);

export default router;
