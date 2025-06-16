"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transporteController_1 = require("../controllers/transporteController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Middleware de autenticación para todas las rutas
const authMiddleware = (req, res, next) => {
    (0, authMiddleware_1.verificarToken)(req, res, next);
};
// Aplicar autenticación a todas las rutas
router.use(authMiddleware);
// Crear un nuevo servicio de transporte
router.post('/', async (req, res, next) => {
    try {
        await (0, transporteController_1.createTransporte)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Obtener todos los servicios de transporte
router.get('/', async (req, res, next) => {
    try {
        await (0, transporteController_1.getTransportes)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Editar un servicio de transporte
router.put('/:id_transporte', async (req, res, next) => {
    try {
        await (0, transporteController_1.editTransporte)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Eliminar un servicio de transporte
router.delete('/:id_transporte', async (req, res, next) => {
    try {
        await (0, transporteController_1.deleteTransporte)(req, res);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
