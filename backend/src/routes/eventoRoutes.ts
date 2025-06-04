import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import {
    createEvent,
    showAllEvents,
    showEventsByStatus,
    showEventsByClient,
    showEventsByAsesor,
    editEvent,
    deleteEvent,
    getTiposEventos
} from '../controllers/eventoController';
import { verificarToken } from '../middlewares/authMiddleware';

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


export default router;