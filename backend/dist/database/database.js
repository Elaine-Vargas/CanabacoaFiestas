"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.sequelize = new sequelize_typescript_1.Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'canabacoa_fiestas',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 42272, // <--- agrega esta línea
    logging: false,
    models: [__dirname + '/../models'],
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 60000
    }
});
exports.default = exports.sequelize;
