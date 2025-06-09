import { Router } from 'express';
import { generarReporteEventos, generarReporteEventosCliente, generarReporteEventosAsesor, generarReporteEventosPersonal } from '../reports/eventoReport';
import { generarReporteCatalogo, generarReporteDetalleAlquiler } from '../reports/catalogoReport';

const router = Router();

// Rutas de reportes de eventos
router.get('/eventos', generarReporteEventos);
router.get('/eventos/cliente/:cedula_cliente', generarReporteEventosCliente);
router.get('/eventos/asesor/:cedula_asesor', generarReporteEventosAsesor);
router.get('/eventos/personal/:id_personal', generarReporteEventosPersonal);

// Rutas de reportes de catálogo
router.get('/elementos', generarReporteCatalogo);
router.get('/elementos/alquiler/:id_elemento', generarReporteDetalleAlquiler);

export default router; 