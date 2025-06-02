import 'reflect-metadata';
import { Sequelize } from 'sequelize-typescript';
import { config } from 'dotenv';

config(); // Cargar variables del .env

const {
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  NODE_ENV
} = process.env;

// Validar que todas las variables necesarias estén presentes
if (!DB_NAME || !DB_USER || !DB_PASSWORD || !DB_HOST || !DB_PORT) {
  throw new Error('Faltan variables de entorno para la configuración de la base de datos');
}

const sequelize = new Sequelize({
  database: DB_NAME,
  username: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  dialect: 'mysql',
  models: [__dirname + '/../models/*.ts'],
  logging: false,
  pool: {
    max: 5,        // Máximo de conexiones permitidas
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: NODE_ENV === 'production' ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {}
});

export default sequelize;
