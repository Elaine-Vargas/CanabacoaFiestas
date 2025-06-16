"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificarToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Usuario_model_1 = __importDefault(require("../models/Usuario_model"));
// Middleware de autenticación
const verificarToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'w3r9Gv!72JkpX%lQs@8bZ&hMfT0^nAy');
        console.log('Token decodificado:', decoded);
        // Check if decoded token has the cedula_usuario property
        if (typeof decoded === 'string' || !decoded.cedula_usuario) {
            res.status(400).json({ error: 'Invalid token payload: cedula_usuario missing' });
            return;
        }
        const cedulaFromToken = decoded.cedula_usuario;
        console.log('Cédula de usuario del token:', cedulaFromToken);
        // Fetch the user from the database using cedula_usuario from the token
        const usuario = await Usuario_model_1.default.findByPk(cedulaFromToken);
        console.log('Resultado de Usuario.findByPk:', usuario);
        if (!usuario) {
            console.error('Usuario no encontrado para la cédula:', cedulaFromToken);
            res.status(404).json({ error: 'User not found' });
            return;
        }
        req.user = decoded;
        req.usuario = usuario;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({ error: 'Token expired' });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
        console.error('Authentication error:', error);
        res.status(500).json({ error: 'Authentication error' });
        return;
    }
};
exports.verificarToken = verificarToken;
