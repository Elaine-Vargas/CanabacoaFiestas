import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './database/database';
import { syncDatabase } from './config/syncDatabase';
import path from 'path';
import morgan from 'morgan';

import elementoRoutes from './routes/elementoRoutes';
import authRoutes from './routes/authRoutes';
import comentarioRoutes from './routes/comentarioRoutes';
import usersRoutes from './routes/usersRoutes';
import eventoRoutes from './routes/eventoRoutes';
import alquilerRoutes from './routes/alquilerRoutes';
import decoracionRoutes from './routes/decoracionRoutes';
import cateringRoutes from './routes/cateringRoutes';
import menuRoutes from './routes/MenuRoutes';
import platoRoutes from './routes/platoRoutes';
import menuCateringRoutes from './routes/menuCateringRoutes';


import direccionRoutes from './routes/direccionRoutes'
import transporteRoutes from './routes/transporteRoutes';
import supervisionRoutes from './routes/supervisionRoutes'
import vehiculoRoutes from './routes/supervisionRoutes';
import compraRoutes from './routes/compraRoutes';
import costoAgregadoRoutes from './routes/costoAgregadoRoutes';
import pagoRoutes from './routes/pagoRoutes';
import proveedorRoutes from './routes/proveedorRoutes';
import reporteRoutes from './routes/reporteRoutes';
import { verificarToken } from './middlewares/authMiddleware';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.FRONTEND_URL || '0.0.0.0';

// Configuración de CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://canabacoafiestas-production.up.railway.app/',
  process.env.FRONTEND_URL
].filter((origin): origin is string => Boolean(origin));

const corsOptions = {
  origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middlewares
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());

// Servir archivos estáticos desde el directorio uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Servir frontend compilado
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Agrupar todas las rutas API en un router
const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/elemento', elementoRoutes);
apiRouter.use('/comentario', comentarioRoutes);
apiRouter.use('/usuario', usersRoutes);
apiRouter.use('/evento', eventoRoutes);
apiRouter.use('/alquiler', alquilerRoutes);
apiRouter.use('/decoracion', decoracionRoutes);
apiRouter.use('/direccion', direccionRoutes);
apiRouter.use('/transporte', transporteRoutes);
apiRouter.use('/supervision', supervisionRoutes);
apiRouter.use('/catering', cateringRoutes);
apiRouter.use('/menucatering', menuCateringRoutes);
apiRouter.use('/menu', menuRoutes);
apiRouter.use('/plato', platoRoutes);
apiRouter.use('/compra', compraRoutes);
apiRouter.use('/costo-agregado', costoAgregadoRoutes);
apiRouter.use('/pago', pagoRoutes);
apiRouter.use('/proveedor', proveedorRoutes);
apiRouter.use('/vehiculo', vehiculoRoutes);
apiRouter.use('/reporte', reporteRoutes);

// Usar el router agrupado bajo /api
app.use('/api', apiRouter);

// Ruta de prueba
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

// Catch-all para rutas que NO sean de API (SPA React Router)
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

// Middleware de manejo de errores global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
    await syncDatabase();
    console.log('Base de datos sincronizada correctamente');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  }
});

// Verificar conexión DB
async function testDbConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos exitosa');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
    throw error;
  }
}

export default app;
