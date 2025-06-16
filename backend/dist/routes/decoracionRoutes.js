"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const decoracionController_1 = require("../controllers/decoracionController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Middleware de autenticación para todas las rutas
const authMiddleware = (req, res, next) => {
    (0, authMiddleware_1.verificarToken)(req, res, next);
};
// Aplicar autenticación a todas las rutas
router.use(authMiddleware);
// Crear un nuevo servicio de decoración
router.post('/', async (req, res, next) => {
    try {
        await (0, decoracionController_1.createDecoracion)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Obtener todos los servicios de decoración
router.get('/', async (req, res, next) => {
    try {
        await (0, decoracionController_1.getAllDecoraciones)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Editar un servicio de decoración
router.put('/:id_decoracion', async (req, res, next) => {
    try {
        await (0, decoracionController_1.editDecoracion)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Eliminar un servicio de decoración (borrado lógico)
router.delete('/:id_decoracion', async (req, res, next) => {
    try {
        await (0, decoracionController_1.deleteDecoracion)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Rutas para detalles de decoración
// Crear un detalle de decoración
router.post('/detalle', async (req, res, next) => {
    try {
        await (0, decoracionController_1.createDetalleDecoracion)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Obtener todos los detalles de una decoración específica
router.get('/detalle/:id_decoracion', async (req, res, next) => {
    try {
        await (0, decoracionController_1.getDetallesByDecoracion)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Obtener todos los detalles de decoración activos
router.get('/detalles', async (req, res, next) => {
    try {
        await (0, decoracionController_1.getAllDetallesDecoracion)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Eliminar un detalle de decoración (borrado lógico)
router.delete('/detalle/:id_detalle_decoracion', async (req, res, next) => {
    try {
        await (0, decoracionController_1.deleteDetalleDecoracion)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Obtener decoraciones filtradas por cliente, estado y evento
router.get('/cliente/:cedula_usuario', async (req, res, next) => {
    try {
        await (0, decoracionController_1.getDecoracionesByCliente)(req, res);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
