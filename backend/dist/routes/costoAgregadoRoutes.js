"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const costoAgregadoController_1 = require("../controllers/costoAgregadoController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Middleware de autenticación para todas las rutas
const authMiddleware = (req, res, next) => {
    (0, authMiddleware_1.verificarToken)(req, res, next);
};
// Aplicar autenticación a todas las rutas
router.use(authMiddleware);
// Obtener todos los costos agregados
router.get('/', async (req, res, next) => {
    try {
        await (0, costoAgregadoController_1.getAllCostosAgregados)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Crear un nuevo costo agregado
router.post('/', async (req, res, next) => {
    try {
        await (0, costoAgregadoController_1.createCostoAgregado)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Obtener todos los costos agregados de un evento
router.get('/evento/:id_evento', async (req, res, next) => {
    try {
        await (0, costoAgregadoController_1.getCostosByEvento)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Editar un costo agregado
router.put('/:id_costo_agregado', async (req, res, next) => {
    try {
        await (0, costoAgregadoController_1.editCostoAgregado)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Eliminar un costo agregado
router.delete('/:id_costo_agregado', async (req, res, next) => {
    try {
        await (0, costoAgregadoController_1.deleteCostoAgregado)(req, res);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
