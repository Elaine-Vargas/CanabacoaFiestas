"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// import {
//   createEspacio,
//   getEspacios,
//   searchEspacios,
//   getEspacioById,
//   editEspacio,
//   deleteEspacio
// } from '../controllers/espacioController';
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Middleware de autenticación para todas las rutas
const authMiddleware = (req, res, next) => {
    (0, authMiddleware_1.verificarToken)(req, res, next);
};
// Aplicar autenticación a todas las rutas
router.use(authMiddleware);
// Crear un nuevo espacio
router.post('/', async (req, res, next) => {
    try {
        // await createEspacio(req, res);
        res.status(501).json({ message: 'Not Implemented' });
    }
    catch (error) {
        next(error);
    }
});
// Obtener todos los espacios
router.get('/', async (req, res, next) => {
    try {
        // await getEspacios(req, res);
        res.status(501).json({ message: 'Not Implemented' });
    }
    catch (error) {
        next(error);
    }
});
// Buscar espacios
router.get('/search', async (req, res, next) => {
    try {
        // await searchEspacios(req, res);
        res.status(501).json({ message: 'Not Implemented' });
    }
    catch (error) {
        next(error);
    }
});
// Obtener un espacio por ID
router.get('/:id_espacio', async (req, res, next) => {
    try {
        // await getEspacioById(req, res);
        res.status(501).json({ message: 'Not Implemented' });
    }
    catch (error) {
        next(error);
    }
});
// Editar un espacio
router.put('/:id_espacio', async (req, res, next) => {
    try {
        // await editEspacio(req, res);
        res.status(501).json({ message: 'Not Implemented' });
    }
    catch (error) {
        next(error);
    }
});
// Eliminar un espacio
router.delete('/:id_espacio', async (req, res, next) => {
    try {
        // await deleteEspacio(req, res);
        res.status(501).json({ message: 'Not Implemented' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
// Las rutas relacionadas con espacioController han sido comentadas/eliminadas para evitar errores de compilación.
