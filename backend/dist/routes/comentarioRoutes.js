"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comentarioController_1 = require("../controllers/comentarioController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Middleware de autenticación para rutas protegidas
const authMiddleware = (req, res, next) => {
    (0, authMiddleware_1.verificarToken)(req, res, next);
};
// Obtener todos los comentarios (sin autenticación)
router.get('/', async (req, res, next) => {
    try {
        await (0, comentarioController_1.getComentarios)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Aplicar autenticación al resto de las rutas
router.use(authMiddleware);
// Crear un nuevo comentario
router.post('/', async (req, res, next) => {
    try {
        await (0, comentarioController_1.createComentario)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Obtener comentarios por evento
router.get('/evento/:id_evento', async (req, res, next) => {
    try {
        await (0, comentarioController_1.getComentariosByEvento)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Obtener comentarios por usuario
router.get('/usuario/:cedula_usuario', async (req, res, next) => {
    try {
        await (0, comentarioController_1.getComentariosByUsuario)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Editar un comentario
router.put('/:id_comentario', async (req, res, next) => {
    try {
        await (0, comentarioController_1.editComentario)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Eliminar lógicamente un comentario
router.delete('/:id_comentario', async (req, res, next) => {
    try {
        await (0, comentarioController_1.deleteComentario)(req, res);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
