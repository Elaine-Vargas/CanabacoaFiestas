"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pagoController_1 = require("../controllers/pagoController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Middleware de autenticación para todas las rutas
router.use(authMiddleware_1.verificarToken);
// Obtener todos los pagos
router.get('/', pagoController_1.getPagos);
// Buscar pagos con filtros (estado, tipo, fecha_inicio, fecha_fin, id_evento, id_tarjeta)
router.get('/search', pagoController_1.searchPagos);
// Crear un nuevo pago
router.post('/', pagoController_1.createPago);
// Obtener un pago por ID
router.get('/:id_pago', pagoController_1.getPagoById);
// Editar un pago
router.put('/:id_pago', pagoController_1.editPago);
// Cambiar estado de un pago
router.patch('/:id_pago/estado', pagoController_1.cambiarEstadoPago);
// Eliminar lógicamente un pago
router.delete('/:id_pago', pagoController_1.deletePago);
exports.default = router;
