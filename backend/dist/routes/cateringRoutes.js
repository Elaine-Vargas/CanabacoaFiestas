"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cateringController_1 = require("../controllers/cateringController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Middleware de autenticación para todas las rutas
const authMiddleware = (req, res, next) => {
    (0, authMiddleware_1.verificarToken)(req, res, next);
};
// Aplicar autenticación a todas las rutas
router.use(authMiddleware);
// Rutas para Catering
// Crear un nuevo servicio de catering
router.post('/', async (req, res, next) => {
    try {
        await (0, cateringController_1.createCatering)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Obtener todos los servicios de catering
router.get('/', async (req, res, next) => {
    try {
        await (0, cateringController_1.getAllCaterings)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Obtener un servicio de catering por ID
router.get('/:id_catering', async (req, res, next) => {
    try {
        await (0, cateringController_1.getCateringById)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Editar un servicio de catering
router.put('/:id_catering', async (req, res, next) => {
    try {
        await (0, cateringController_1.editCatering)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Eliminar un servicio de catering (borrado lógico)
router.delete('/:id_catering', async (req, res, next) => {
    try {
        await (0, cateringController_1.deleteCatering)(req, res);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
