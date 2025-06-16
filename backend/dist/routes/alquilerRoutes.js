"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const alquilerServicioController_1 = require("../controllers/alquilerServicioController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Middleware de autenticación para todas las rutas
const authMiddleware = (req, res, next) => {
    (0, authMiddleware_1.verificarToken)(req, res, next);
};
// Aplicar autenticación a todas las rutas
router.use(authMiddleware);
// Crear un nuevo alquiler
router.post('/', async (req, res, next) => {
    try {
        await (0, alquilerServicioController_1.createAlquilerServicio)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Obtener todos los alquileres
router.get('/', async (req, res, next) => {
    try {
        await (0, alquilerServicioController_1.getAllAlquileres)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Obtener un alquiler por ID
router.get('/:id_alquiler', async (req, res, next) => {
    try {
        await (0, alquilerServicioController_1.getAlquilerById)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Obtener alquileres por evento
router.get('/evento/:id_evento', async (req, res, next) => {
    try {
        await (0, alquilerServicioController_1.getAlquileresByEvento)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Obtener alquileres por elemento (debe ir antes de las rutas con parámetros genéricos)
router.get('/elemento/:id_elemento', async (req, res, next) => {
    try {
        await (0, alquilerServicioController_1.getAlquileresByElemento)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Obtener elementos de un alquiler específico
router.get('/:id_alquiler/elementos', async (req, res, next) => {
    try {
        await (0, alquilerServicioController_1.getElementosAlquiler)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Obtener alquileres por usuario
router.get('/usuario/:cedula_usuario', async (req, res, next) => {
    try {
        await (0, alquilerServicioController_1.getAlquileresByUsuario)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Editar un alquiler
router.patch('/:id_alquiler', async (req, res, next) => {
    try {
        await (0, alquilerServicioController_1.editAlquilerServicio)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Eliminar un alquiler (borrado lógico)
router.delete('/:id_alquiler', async (req, res, next) => {
    try {
        await (0, alquilerServicioController_1.deleteAlquilerServicio)(req, res);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
