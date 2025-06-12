import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'canabacoa_fiestas',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 42272,  // <--- agrega esta línea
  logging: false,
  models: [__dirname + '/../models'],
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 60000
  }
});

export default sequelize;
