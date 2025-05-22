import 'reflect-metadata';
import { Sequelize } from 'sequelize-typescript';
import { config } from 'dotenv';

config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  dialect: 'mysql',
  models: [__dirname + '/../models/*.ts'],
  logging: false,
  dialectOptions: process.env.NODE_ENV === 'production' ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {}
});

export default sequelize;