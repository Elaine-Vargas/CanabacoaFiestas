"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const elementoController_1 = require("../controllers/elementoController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Rutas públicas (GET)
// Obtener todas las categorías
router.get('/categorias/list', elementoController_1.getCategorias);
// Obtener todas las subcategorías
router.get('/subcategorias/list', elementoController_1.getSubcategorias);
// Obtener subcategorías por categoría
router.get('/subcategorias/categoria/:id_categoria', elementoController_1.getSubcategoriasByCategoria);
// Obtener todos los colores
router.get('/colores/list', elementoController_1.getColores);
// Obtener todos los materiales
router.get('/materiales/list', elementoController_1.getMateriales);
// Buscar elementos
router.get('/search', elementoController_1.searchElementos);
// Obtener un elemento por ID
router.get('/:id_elemento', elementoController_1.getElementoById);
// Obtener todos los elementos
router.get('/', elementoController_1.getElementos);
// Obtener elementos filtrados
router.get('/filtrados', elementoController_1.getElementos);
// Middleware de autenticación para rutas protegidas
router.use(authMiddleware_1.verificarToken);
// Rutas protegidas (POST, PUT, DELETE)
// Crear un nuevo elemento
router.post('/', elementoController_1.createElemento);
// Editar un elemento
router.put('/:id_elemento', elementoController_1.editElemento);
// Eliminar un elemento
router.delete('/:id_elemento', elementoController_1.deleteElemento);
exports.default = router;
