import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config';
import { syncDatabase } from './config/syncDatabase';
import authRoutes from './routes/authRoutes';
import elementoRoutes from './routes/elementoRoutes';
import path from 'path';
import comentarioRoutes from './routes/comentarioRoutes';
import { sendRecoveryEmail } from './controllers/mailController';
import dashboardRoutes from './routes/dashboardRoutes';
import usersRoutes from './routes/usersRoutes';

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
app.use('/api/elementos', elementoRoutes);
app.use('/api/comentarios', comentarioRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/usuarios', usersRoutes);

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
