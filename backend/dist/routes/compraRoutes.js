"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const compraController_1 = require("../controllers/compraController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Middleware de autenticación para todas las rutas
const authMiddleware = (req, res, next) => {
    (0, authMiddleware_1.verificarToken)(req, res, next);
};
// Aplicar autenticación a todas las rutas
router.use(authMiddleware);
// Crear una nueva compra
router.post('/', async (req, res, next) => {
    try {
        await (0, compraController_1.createCompra)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Obtener todas las compras
router.get('/', async (req, res, next) => {
    try {
        await (0, compraController_1.getCompras)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Obtener detalles de una compra específica
router.get('/:id_compra/detalles', async (req, res, next) => {
    try {
        await (0, compraController_1.getDetallesByCompra)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Obtener compras por elemento
router.get('/elemento/:id_elemento', async (req, res, next) => {
    try {
        await (0, compraController_1.getComprasByElemento)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Editar una compra
router.put('/:id_compra', async (req, res, next) => {
    try {
        await (0, compraController_1.editCompra)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Eliminar una compra (borrado lógico)
router.delete('/:id_compra', async (req, res, next) => {
    try {
        await (0, compraController_1.deleteCompra)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Crear un detalle de compra individual
router.post('/detalle', async (req, res, next) => {
    try {
        await (0, compraController_1.createDetalleCompra)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Eliminar un detalle de compra
router.delete('/detalle/:id_detalle_compra', async (req, res, next) => {
    try {
        await (0, compraController_1.deleteDetalleCompra)(req, res);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
