"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const menuCateringController_1 = require("../controllers/menuCateringController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Middleware de autenticación para todas las rutas
const authMiddleware = (req, res, next) => {
    (0, authMiddleware_1.verificarToken)(req, res, next);
};
// Aplicar autenticación a todas las rutas
router.use(authMiddleware);
// Rutas para MenuCatering
// Agregar un menú a un catering
router.post('/', async (req, res, next) => {
    try {
        await (0, menuCateringController_1.addMenuToCatering)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Remover un menú de un catering
router.delete('/:id_catering/:id_menu', async (req, res, next) => {
    try {
        await (0, menuCateringController_1.removeMenuFromCatering)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Obtener todos los menús de un catering
router.get('/:id_catering/menus', async (req, res, next) => {
    try {
        await (0, menuCateringController_1.getMenusByCateringId)(req, res);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
