"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const menuController_1 = require("../controllers/menuController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Middleware de autenticación para todas las rutas
const authMiddleware = (req, res, next) => {
    (0, authMiddleware_1.verificarToken)(req, res, next);
};
// Aplicar autenticación a todas las rutas
router.use(authMiddleware);
// Rutas para Menu
// Crear un nuevo menú
router.post('/', async (req, res, next) => {
    try {
        await (0, menuController_1.createMenu)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Obtener todos los menús
router.get('/', async (req, res, next) => {
    try {
        await (0, menuController_1.getMenuCatalog)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Obtener un menú por ID
router.get('/:id', async (req, res, next) => {
    try {
        await (0, menuController_1.getMenuById)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Editar un menú
router.put('/:id', async (req, res, next) => {
    try {
        await (0, menuController_1.updateMenu)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Eliminar un menú (borrado lógico)
router.delete('/:id', async (req, res, next) => {
    try {
        await (0, menuController_1.deleteMenu)(req, res);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
