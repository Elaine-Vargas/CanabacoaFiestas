"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const proveedorController_1 = require("../controllers/proveedorController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Middleware de autenticación para todas las rutas
router.use(authMiddleware_1.verificarToken);
// Rutas para proveedores
router.get('/', proveedorController_1.getProveedores);
router.get('/search', proveedorController_1.searchProveedores);
router.post('/', proveedorController_1.createProveedor);
router.put('/:id_proveedor', proveedorController_1.editProveedor);
router.delete('/:id_proveedor', proveedorController_1.deleteProveedor);
router.patch('/:id_proveedor/estado', proveedorController_1.updateProveedorEstado);
exports.default = router;
