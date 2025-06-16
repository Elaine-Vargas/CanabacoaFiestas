"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// import {
//   createMontajeDesmontaje,
//   editMontajeDesmontaje,
//   getMontajesDesmontajes,
//   deleteMontajeDesmontaje
// } from '../controllers/montajeDesmontajeController';
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Middleware de autenticación para todas las rutas
router.use(authMiddleware_1.verificarToken);
// Obtener todos los servicios de montaje/desmontaje
// router.get('/', (req, res, next) => {
//   getMontajesDesmontajes(req, res).catch(next);
// });
// Crear un nuevo servicio de montaje/desmontaje
// router.post('/', (req, res, next) => {
//   createMontajeDesmontaje(req, res).catch(next);
// });
// Editar un servicio de montaje/desmontaje
// router.put('/:id_montdes', (req, res, next) => {
//   editMontajeDesmontaje(req, res).catch(next);
// });
// Eliminar lógicamente un servicio de montaje/desmontaje
// router.delete('/:id_montdes', (req, res, next) => {
//   deleteMontajeDesmontaje(req, res).catch(next);
// });
exports.default = router;
// Las rutas relacionadas con montajeDesmontajeController han sido comentadas/eliminadas para evitar errores de compilación.
