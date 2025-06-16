"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eventoController_1 = require("../controllers/eventoController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const EmpleadoEvento_model_1 = __importDefault(require("../models/EmpleadoEvento_model"));
const Evento_model_1 = __importDefault(require("../models/Evento_model"));
const Usuario_model_1 = __importDefault(require("../models/Usuario_model"));
const router = (0, express_1.Router)();
// Middleware de autenticación para todas las rutas
const authMiddleware = (req, res, next) => {
    (0, authMiddleware_1.verificarToken)(req, res, next);
};
// Aplicar autenticación a todas las rutas
router.use(authMiddleware);
// Crear un nuevo evento (requiere validación)
router.post('/', async (req, res, next) => {
    try {
        await (0, eventoController_1.createEvent)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Obtener todos los eventos
router.get('/', async (req, res, next) => {
    try {
        await (0, eventoController_1.showAllEvents)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Obtener eventos por estado
router.get('/estado/:estado', async (req, res, next) => {
    try {
        await (0, eventoController_1.showEventsByStatus)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Obtener eventos por cliente
router.get('/cliente/:cedula_cliente', async (req, res, next) => {
    try {
        await (0, eventoController_1.showEventsByClient)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Obtener eventos por asesor
router.get('/asesor/:cedula_asesor', async (req, res, next) => {
    try {
        await (0, eventoController_1.showEventsByAsesor)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Editar un evento (requiere validación)
router.put('/:id_evento', async (req, res, next) => {
    try {
        await (0, eventoController_1.editEvent)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Eliminar un evento (borrado lógico)
router.delete('/:id_evento', async (req, res, next) => {
    try {
        await (0, eventoController_1.deleteEvent)(req, res);
    }
    catch (error) {
        next(error);
    }
});
router.get('/tipo-eventos/list', eventoController_1.getTiposEventos);
// Rutas para empleado-evento
// Obtener todas las asignaciones de empleados
router.get('/asignar-empleados', async (req, res, next) => {
    try {
        console.log('Intentando obtener asignaciones de empleados...');
        const asignaciones = await EmpleadoEvento_model_1.default.findAll({
            include: [
                {
                    model: Evento_model_1.default,
                    as: 'evento',
                    attributes: ['id_evento', 'fecha_evento', 'hora_evento'],
                    include: [
                        {
                            model: Usuario_model_1.default,
                            as: 'cliente',
                            attributes: ['nombre_usuario', 'apellido_usuario']
                        }
                    ]
                },
                {
                    model: Usuario_model_1.default,
                    as: 'empleado',
                    attributes: ['cedula_usuario', 'nombre_usuario', 'apellido_usuario']
                }
            ],
            logging: console.log
        });
        console.log('Asignaciones encontradas:', asignaciones.length);
        res.json(asignaciones);
    }
    catch (error) {
        console.error('Error detallado al obtener asignaciones:', error);
        next(error);
    }
});
// Asignar empleado a un evento
router.post('/asignar-empleados', async (req, res, next) => {
    try {
        console.log('Datos recibidos para asignación:', req.body);
        await (0, eventoController_1.assignEmployeeToEvent)(req, res);
    }
    catch (error) {
        console.error('Error detallado al asignar empleado:', error);
        next(error);
    }
});
// Obtener empleados de un evento
router.get('/:id_evento/empleados', async (req, res, next) => {
    try {
        await (0, eventoController_1.getEventEmployees)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Obtener eventos de un empleado
router.get('/empleado/:id_empleado/eventos', async (req, res, next) => {
    try {
        await (0, eventoController_1.getEmployeeEvents)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Obtener asignaciones de equipo para eventos donde el empleado es asesor
router.get('/asesor/:cedula_asesor/asignaciones-equipo', async (req, res, next) => {
    try {
        await (0, eventoController_1.getAsesorTeamAssignments)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Obtener empleados de todos los eventos de un cliente (filtrable)
router.get('/empleados/cliente/:cedula_cliente', async (req, res, next) => {
    try {
        await (0, eventoController_1.getEmpleadosByClienteEventos)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Actualizar rol de empleado en un evento
router.put('/:id_evento/empleados/:empleado_evento', async (req, res, next) => {
    console.log('Datos recibidos para actualizar rol de empleado:', req.body);
    try {
        await (0, eventoController_1.updateEmployeeRole)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Remover empleado de un evento
router.delete('/:id_evento/empleados/:empleado_evento', async (req, res, next) => {
    try {
        await (0, eventoController_1.removeEmployeeFromEvent)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Actualizar estado de un evento
router.patch('/:id_evento/estado', async (req, res, next) => {
    try {
        await (0, eventoController_1.updateEventStatus)(req, res);
    }
    catch (error) {
        next(error);
    }
});
// Actualizar estado de una asignación de empleado en evento
router.patch('/:id_evento/empleados/:empleado_evento/estado', async (req, res, next) => {
    try {
        await (0, eventoController_1.updateEmployeeAssignmentStatus)(req, res);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
