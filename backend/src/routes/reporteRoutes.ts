// routes/reporte.routes.ts
import { Router, RequestHandler } from 'express';
import { Request, Response } from 'express';
import { ReporteUsuariosPorRolYEstado } from '../reports/usuarioReport';
import {
  generarReporteEventos,
  generarReporteEventosCliente,
  generarReporteEventosAsesor,
  generarReporteEventosPersonal,
  generarReporteEquipos
} from '../reports/eventoReport';

const router = Router();

router.get('/usuario/rol/:id_rol/estado/:estado_usuario', ReporteUsuariosPorRolYEstado as RequestHandler);

router.get('/eventos', generarReporteEventos as RequestHandler);
router.get('/eventos/cliente/:cedula_cliente', generarReporteEventosCliente as RequestHandler);
router.get('/eventos/asesor/:cedula_asesor', generarReporteEventosAsesor as RequestHandler);
router.get('/eventos/personal/:cedula_personal', generarReporteEventosPersonal as RequestHandler);
router.get('/equipos', generarReporteEquipos as RequestHandler);

export default router;