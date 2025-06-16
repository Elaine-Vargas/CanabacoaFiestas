"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/reporte.routes.ts
const express_1 = require("express");
const usuarioReport_1 = require("../reports/usuarioReport");
const eventoReport_1 = require("../reports/eventoReport");
const elementoReport_1 = require("../reports/elementoReport");
const proveedorReport_1 = require("../reports/proveedorReport");
const facturaReport_1 = require("../reports/facturaReport");
const compraReport_1 = require("../reports/compraReport");
const alquilerReport_1 = require("../reports/alquilerReport");
const router = (0, express_1.Router)();
router.get('/usuario/rol/:id_rol/estado/:estado_usuario', usuarioReport_1.ReporteUsuariosPorRolYEstado);
router.get('/eventos', eventoReport_1.generarReporteEventos);
router.get('/eventos/cliente/:cedula_cliente', eventoReport_1.generarReporteEventosCliente);
router.get('/eventos/asesor/:cedula_asesor', eventoReport_1.generarReporteEventosAsesor);
router.get('/eventos/personal/:cedula_personal', eventoReport_1.generarReporteEventosPersonal);
router.get('/equipos', eventoReport_1.generarReporteEquipos);
router.get('/equipos/asesor/:cedula_asesor', eventoReport_1.generarReporteEquipos);
router.get('/elementos', elementoReport_1.generarReporteCatalogo);
router.get('/elementos/alquiler/todos', elementoReport_1.generarReporteDetalleAlquiler);
// Ruta general para reporte de proveedores
router.get('/proveedores', proveedorReport_1.ReporteProveedoresPorTipoYEstado);
// Ruta específica para reporte de proveedores por tipo y estado
router.get('/proveedores/filtro/tipo/:tipo_proveedor/estado/:estado_proveedor', proveedorReport_1.ReporteProveedoresPorTipoYEstado);
// Ruta para reporte de factura de evento
router.get('/factura/evento/:id_evento', facturaReport_1.ReporteFacturaEvento);
router.get('/compras/:id_compra', compraReport_1.ReporteCompraDetalle);
// Ruta para reporte de alquiler
router.get('/alquiler/:id_alquiler', alquilerReport_1.ReporteAlquilerDetalle);
exports.default = router;
