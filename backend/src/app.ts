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
import direccionRoutes from './routes/direccionRoutes'
import transporteRoutes from './routes/transporteRoutes';
import supervisionRoutes from './routes/supervisionRoutes'
import tarjetaRoutes from './routes/tarjetaRoutes';
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

// Configuración de CORS
const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middlewares
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());

// Servir archivos estáticos desde el directorio uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/elemento', elementoRoutes);
app.use('/api/comentario', comentarioRoutes);
app.use('/api/usuario', usersRoutes);
app.use('/api/evento', eventoRoutes);
app.use('/api/alquiler', alquilerRoutes);
app.use('/api/decoracion', decoracionRoutes);
app.use('/api/direccion', direccionRoutes);
app.use('/api/tarjeta', tarjetaRoutes);
app.use('/api/transporte',transporteRoutes);
app.use('/api/supervision',supervisionRoutes);
app.use('/api/catering', cateringRoutes);
app.use('/api/compra', compraRoutes);
app.use('/api/costo-agregado', costoAgregadoRoutes);  
app.use('/api/pago', pagoRoutes);
app.use('/api/proveedor', proveedorRoutes);
app.use('/api/vehiculo', vehiculoRoutes);
app.use('/api/reporte', reporteRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
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
app.listen(PORT, async () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
  
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
