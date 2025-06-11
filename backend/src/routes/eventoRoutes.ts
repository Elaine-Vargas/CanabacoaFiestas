import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import {
    createEvent,
    showAllEvents,
    showEventsByStatus,
    showEventsByClient,
    showEventsByAsesor,
    editEvent,
    deleteEvent,
    getTiposEventos,
    assignEmployeeToEvent,
    getEventEmployees,
    updateEmployeeRole,
    removeEmployeeFromEvent,
    updateEventStatus
} from '../controllers/eventoController';
import { verificarToken } from '../middlewares/authMiddleware';
import EmpleadoEvento from '../models/EmpleadoEvento_model';
import Evento from '../models/Evento_model';
import Usuario from '../models/Usuario_model';

const router = Router();

// Middleware de autenticación para todas las rutas
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    verificarToken(req, res, next);
};

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Crear un nuevo evento (requiere validación)
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await createEvent(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener todos los eventos
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await showAllEvents(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener eventos por estado
router.get('/estado/:estado', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await showEventsByStatus(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener eventos por cliente
router.get('/cliente/:cedula_cliente', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await showEventsByClient(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener eventos por asesor
router.get('/asesor/:cedula_asesor', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await showEventsByAsesor(req, res);
    } catch (error) {
        next(error);
    }
});

// Editar un evento (requiere validación)
router.put('/:id_evento', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await editEvent(req, res);
    } catch (error) {
        next(error);
    }
});

// Eliminar un evento (borrado lógico)
router.delete('/:id_evento', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await deleteEvent(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/tipo-eventos/list', getTiposEventos as RequestHandler);

// Rutas para empleado-evento
// Obtener todas las asignaciones de empleados
router.get('/asignar-empleados', async (req, res, next) => {
    try {
        console.log('Intentando obtener asignaciones de empleados...');
        const asignaciones = await EmpleadoEvento.findAll({
            include: [
                { 
                    model: Evento, 
                    as: 'evento',
                    attributes: ['id_evento', 'fecha_evento', 'hora_evento'],
                    include: [
                        { 
                            model: Usuario, 
                            as: 'cliente',
                            attributes: ['nombre_usuario', 'apellido_usuario']
                        }
                    ]
                },
                { 
                    model: Usuario, 
                    as: 'empleado',
                    attributes: ['cedula_usuario', 'nombre_usuario', 'apellido_usuario']
                }
            ],
            logging: console.log
        });
        console.log('Asignaciones encontradas:', asignaciones.length);
        res.json(asignaciones);
    } catch (error) {
        console.error('Error detallado al obtener asignaciones:', error);
        next(error);
    }
});

// Asignar empleado a un evento
router.post('/asignar-empleados', async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log('Datos recibidos para asignación:', req.body);
        await assignEmployeeToEvent(req, res);
    } catch (error) {
        console.error('Error detallado al asignar empleado:', error);
        next(error);
    }
});

// Obtener empleados de un evento
router.get('/:id_evento/empleados', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await getEventEmployees(req, res);
    } catch (error) {
        next(error);
    }
});

// Actualizar rol de empleado en un evento
router.put('/:id_evento/empleados/:empleado_evento', async (req: Request, res: Response, next: NextFunction) => {
    console.log('Datos recibidos para actualizar rol de empleado:', req.body);
    try {
        await updateEmployeeRole(req, res);
    } catch (error) {
        next(error);
    }
});

// Remover empleado de un evento
router.delete('/:id_evento/empleados/:empleado_evento', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await removeEmployeeFromEvent(req, res);
    } catch (error) {
        next(error);
    }
});

// Actualizar estado de un evento
router.patch('/:id_evento/estado', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await updateEventStatus(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;