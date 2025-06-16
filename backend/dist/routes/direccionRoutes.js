"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const direccionController_1 = require("../controllers/direccionController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Middleware de autenticación para todas las rutas
router.use(authMiddleware_1.verificarToken);
// Obtener todas las direcciones
router.get('/', direccionController_1.getDirecciones);
// Obtener todas las provincias
router.get('/provincias', direccionController_1.getProvincias);
// Obtener todas las ciudades
router.get('/ciudades', direccionController_1.getCiudades);
// Obtener ciudades por provincia
router.get('/ciudades/provincia/:id_provincia', direccionController_1.getCiudadesByProvincia);
// Buscar direcciones
router.get('/search', direccionController_1.searchDirecciones);
// Crear una nueva dirección
router.post('/', direccionController_1.createDireccion);
// Obtener una dirección por ID
router.get('/:id_direccion', direccionController_1.getDireccionById);
// Editar una dirección
router.put('/:id_direccion', direccionController_1.editDireccion);
// Eliminar una dirección
router.delete('/:id_direccion', direccionController_1.deleteDireccion);
exports.default = router;
