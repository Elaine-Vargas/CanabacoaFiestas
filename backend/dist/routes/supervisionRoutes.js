"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supervisionController_1 = require("../controllers/supervisionController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Middleware de autenticación para todas las rutas
const authMiddleware = (req, res, next) => {
    (0, authMiddleware_1.verificarToken)(req, res, next);
};
// Aplicar autenticación a todas las rutas
router.use(authMiddleware);
// Crear un nuevo servicio de supervisión
router.post('/', async (req, res, next) => {
    try {
        await (0, supervisionController_1.createSupervision)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Obtener todos los servicios de supervisión
router.get('/', async (req, res, next) => {
    try {
        await (0, supervisionController_1.getSupervisiones)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Editar un servicio de supervisión
router.put('/:id_supervision', async (req, res, next) => {
    try {
        await (0, supervisionController_1.editSupervision)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Eliminar un servicio de supervisión
router.delete('/:id_supervision', async (req, res, next) => {
    try {
        await (0, supervisionController_1.deleteSupervision)(req, res);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
