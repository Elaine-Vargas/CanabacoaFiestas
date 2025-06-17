"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./database/database"));
const syncDatabase_1 = require("./config/syncDatabase");
const path_1 = __importDefault(require("path"));
const morgan_1 = __importDefault(require("morgan"));
const elementoRoutes_1 = __importDefault(require("./routes/elementoRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const comentarioRoutes_1 = __importDefault(require("./routes/comentarioRoutes"));
const usersRoutes_1 = __importDefault(require("./routes/usersRoutes"));
const eventoRoutes_1 = __importDefault(require("./routes/eventoRoutes"));
const alquilerRoutes_1 = __importDefault(require("./routes/alquilerRoutes"));
const decoracionRoutes_1 = __importDefault(require("./routes/decoracionRoutes"));
const cateringRoutes_1 = __importDefault(require("./routes/cateringRoutes"));
const MenuRoutes_1 = __importDefault(require("./routes/MenuRoutes"));
const platoRoutes_1 = __importDefault(require("./routes/platoRoutes"));
const menuCateringRoutes_1 = __importDefault(require("./routes/menuCateringRoutes"));
const direccionRoutes_1 = __importDefault(require("./routes/direccionRoutes"));
const transporteRoutes_1 = __importDefault(require("./routes/transporteRoutes"));
const supervisionRoutes_1 = __importDefault(require("./routes/supervisionRoutes"));
const supervisionRoutes_2 = __importDefault(require("./routes/supervisionRoutes"));
const compraRoutes_1 = __importDefault(require("./routes/compraRoutes"));
const costoAgregadoRoutes_1 = __importDefault(require("./routes/costoAgregadoRoutes"));
const pagoRoutes_1 = __importDefault(require("./routes/pagoRoutes"));
const proveedorRoutes_1 = __importDefault(require("./routes/proveedorRoutes"));
const reporteRoutes_1 = __importDefault(require("./routes/reporteRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const HOST = process.env.FRONTEND_URL || '0.0.0.0';
// Configuración de CORS
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://canabacoafiestas-production.up.railway.app/',
    process.env.FRONTEND_URL
].filter((origin) => Boolean(origin));
const corsOptions = {
    origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
// Middlewares
app.use((0, cors_1.default)(corsOptions));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
// Servir archivos estáticos desde el directorio uploads
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Servir frontend compilado
app.use(express_1.default.static(path_1.default.join(__dirname, '../../frontend/dist')));
// Agrupar todas las rutas API en un router
const apiRouter = express_1.default.Router();
apiRouter.use('/auth', authRoutes_1.default);
apiRouter.use('/elemento', elementoRoutes_1.default);
apiRouter.use('/comentario', comentarioRoutes_1.default);
apiRouter.use('/usuario', usersRoutes_1.default);
apiRouter.use('/evento', eventoRoutes_1.default);
apiRouter.use('/alquiler', alquilerRoutes_1.default);
apiRouter.use('/decoracion', decoracionRoutes_1.default);
apiRouter.use('/direccion', direccionRoutes_1.default);
apiRouter.use('/transporte', transporteRoutes_1.default);
apiRouter.use('/supervision', supervisionRoutes_1.default);
apiRouter.use('/catering', cateringRoutes_1.default);
apiRouter.use('/menucatering', menuCateringRoutes_1.default);
apiRouter.use('/menu', MenuRoutes_1.default);
apiRouter.use('/plato', platoRoutes_1.default);
apiRouter.use('/compra', compraRoutes_1.default);
apiRouter.use('/costo-agregado', costoAgregadoRoutes_1.default);
apiRouter.use('/pago', pagoRoutes_1.default);
apiRouter.use('/proveedor', proveedorRoutes_1.default);
apiRouter.use('/vehiculo', supervisionRoutes_2.default);
apiRouter.use('/reporte', reporteRoutes_1.default);
// Usar el router agrupado bajo /api
app.use('/api', apiRouter);
// Ruta de prueba
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../frontend/dist/index.html'));
});
// Catch-all para rutas que NO sean de API (SPA React Router)
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../frontend/dist/index.html'));
});
// Middleware de manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error en el servidor:', err);
    res.status(500).json({
        error: 'Error interno del servidor',
        mensaje: err.message || 'Ocurrió un error en el servidor'
    });
});
// Iniciar servidor
app.listen(Number(PORT), HOST, async () => {
    console.log(`Servidor escuchando en http://${HOST}:${PORT}`);
    try {
        await testDbConnection();
        await (0, syncDatabase_1.syncDatabase)();
        console.log('Base de datos sincronizada correctamente');
    }
    catch (error) {
        console.error('Error al inicializar la base de datos:', error);
    }
});
// Verificar conexión DB
async function testDbConnection() {
    try {
        await database_1.default.authenticate();
        console.log('Conexión a la base de datos exitosa');
    }
    catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
        throw error;
    }
}
exports.default = app;
