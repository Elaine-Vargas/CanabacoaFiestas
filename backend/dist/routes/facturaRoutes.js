"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const facturaController_1 = require("../controllers/facturaController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Middleware de autenticación para todas las rutas
router.use(authMiddleware_1.verificarToken);
// Obtener una factura por ID
router.get('/:id_factura', facturaController_1.getFacturaById);
exports.default = router;
