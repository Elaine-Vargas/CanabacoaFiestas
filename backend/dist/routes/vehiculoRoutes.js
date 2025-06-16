"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vehiculoController_1 = require("../controllers/vehiculoController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Middleware de autenticación para todas las rutas
router.use(authMiddleware_1.verificarToken);
// Obtener todos los vehículos
router.get('/', vehiculoController_1.getVehiculos);
// Buscar vehículos
router.get('/search', vehiculoController_1.searchVehiculos);
// Crear un nuevo vehículo
router.post('/', vehiculoController_1.createVehiculo);
// Editar un vehículo
router.put('/:matricula_vehiculo', vehiculoController_1.editVehiculo);
// Eliminar lógicamente un vehículo
router.delete('/:matricula_vehiculo', vehiculoController_1.deleteVehiculo);
exports.default = router;
