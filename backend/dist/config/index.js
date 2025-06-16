"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const sequelize_typescript_1 = require("sequelize-typescript");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sequelize = new sequelize_typescript_1.Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'canabacoa_fiestas',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 42272, // <--- aquí también
    models: [__dirname + '/../models'],
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 60000
    },
    logging: false,
});
exports.default = sequelize;
