import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config';
import { syncDatabase } from './config/syncDatabase';
import path from 'path';

import elementoRoutes from './routes/elementoRoutes';
import authRoutes from './routes/authRoutes';
import comentarioRoutes from './routes/comentarioRoutes';
import usersRoutes from './routes/usersRoutes';
import eventoRoutes from './routes/eventoRoutes';
import alquilerRoutes from './routes/alquilerRoutes';
import decoracionRoutes from './routes/decoracionRoutes';
import cateringRoutes from './routes/cateringRoutes';
import menuRoutes from './routes/menuRoutes';
import provinciaRoutes from './routes/provinciaRoutes';
import direccionRoutes from './routes/direccionRoutes'
import transporteRoutes from './routes/transporteRoutes';
import supervisionRoutes from './routes/supervisionRoutes'
import tarjetaRoutes from './routes/tarjetaRoutes';
import bancoRoutes from './routes/bancoRoutes';
import vehiculoRoutes from './routes/supervisionRoutes';
import compraRoutes from './routes/compraRoutes';
import costoAgregadoRoutes from './routes/costoAgregadoRoutes';
import espacioRoutes from './routes/espacioRoutes';
import montajeDesmontajeRoutes from './routes/montajeDesmontajeRoutes';
import pagoRoutes from './routes/pagoRoutes';
import proveedorRoutes from './routes/proveedorRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());

// Servir archivos estáticos desde el directorio uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/elemento', elementoRoutes);
app.use('/api/comentarios', comentarioRoutes);
app.use('/api/usuarios', usersRoutes);
app.use('/api/evento', eventoRoutes);
app.use('/api/alquiler', alquilerRoutes);
app.use('/api/decoracion', decoracionRoutes);
app.use('/api/menu', menuRoutes)
app.use('/api/direccion', direccionRoutes);
app.use('/api/provincias', provinciaRoutes);
app.use('/api/tarjeta', tarjetaRoutes);
app.use('/api/transporte',transporteRoutes);
app.use('/api/supervision',supervisionRoutes);
app.use('/api/banco', bancoRoutes);
app.use('/api/catering', cateringRoutes);
app.use('/api/compra', compraRoutes);
app.use('/api/costo-agregado', costoAgregadoRoutes);  
app.use('/api/espacio', espacioRoutes);
app.use('/api/montajedesmontaje', montajeDesmontajeRoutes);
app.use('/api/pago', pagoRoutes);
app.use('/api/proveedor', proveedorRoutes);
app.use('/api/vehiculo', vehiculoRoutes);







// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
  console.log('Rutas disponibles:');
  console.log('- GET /api/elementos/filtrados');
  console.log('- GET /api/elementos/categorias/list');
  console.log('- GET /api/elementos/colores/list');
  console.log('- GET /api/elementos/materiales/list');
  console.log('- GET /api/dashboard/stats');
  console.log('- GET /api/usuarios');
  console.log('- GET /api/usuarios/rol/:id_rol');
  console.log('- GET /api/usuarios/buscar');
  
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
