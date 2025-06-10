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
import { generarReporteCatalogo, generarReporteDetalleAlquiler } from '../reports/elementoReport';
import { ReporteProveedoresPorTipoYEstado } from '../reports/proveedorReport';
import { ReporteFacturaEvento } from '../reports/facturaReport';
import { ReporteCompraDetalle } from '../reports/compraReport';
import { ReporteAlquilerDetalle } from '../reports/alquilerReport';

const router = Router();

router.get('/usuario/rol/:id_rol/estado/:estado_usuario', ReporteUsuariosPorRolYEstado as RequestHandler);

router.get('/eventos', generarReporteEventos as RequestHandler);
router.get('/eventos/cliente/:cedula_cliente', generarReporteEventosCliente as RequestHandler);
router.get('/eventos/asesor/:cedula_asesor', generarReporteEventosAsesor as RequestHandler);
router.get('/eventos/personal/:cedula_personal', generarReporteEventosPersonal as RequestHandler);
router.get('/equipos', generarReporteEquipos as RequestHandler);

router.get('/elementos', generarReporteCatalogo as RequestHandler);
router.get('/elementos/alquiler/todos', generarReporteDetalleAlquiler as RequestHandler);

// Ruta general para reporte de proveedores
router.get('/proveedores', ReporteProveedoresPorTipoYEstado as RequestHandler);
// Ruta específica para reporte de proveedores por tipo y estado
router.get('/proveedores/filtro/tipo/:tipo_proveedor/estado/:estado_proveedor', ReporteProveedoresPorTipoYEstado as RequestHandler);

// Ruta para reporte de factura de evento
router.get('/factura/evento/:id_evento', ReporteFacturaEvento as RequestHandler);

router.get('/compras/:id_compra', ReporteCompraDetalle);

// Ruta para reporte de alquiler
router.get('/alquiler/:id_alquiler', ReporteAlquilerDetalle as RequestHandler);

export default router;