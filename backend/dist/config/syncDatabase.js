"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncDatabase = void 0;
const index_1 = __importDefault(require("./index"));
const syncDatabase = async () => {
    try {
        await index_1.default.sync({ alter: true });
        console.log('Base de datos sincronizada correctamente');
    }
    catch (error) {
        console.error('Error al sincronizar la base de datos:', error);
        throw error;
    }
};
exports.syncDatabase = syncDatabase;
