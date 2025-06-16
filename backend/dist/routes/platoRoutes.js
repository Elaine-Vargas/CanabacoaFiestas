"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const platoController_1 = require("../controllers/platoController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Middleware de autenticación para todas las rutas
const authMiddleware = (req, res, next) => {
    (0, authMiddleware_1.verificarToken)(req, res, next);
};
// Aplicar autenticación a todas las rutas
router.use(authMiddleware);
// Rutas para Plato
// Crear un nuevo plato
router.post('/', async (req, res, next) => {
    try {
        await (0, platoController_1.createPlato)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Obtener todos los platos
router.get('/', async (req, res, next) => {
    try {
        await (0, platoController_1.getAllPlatos)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Obtener un plato por ID
router.get('/:id', async (req, res, next) => {
    try {
        await (0, platoController_1.getPlatoById)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Editar un plato
router.put('/:id', async (req, res, next) => {
    try {
        await (0, platoController_1.updatePlato)(req, res);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
