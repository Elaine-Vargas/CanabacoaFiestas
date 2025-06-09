import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import Usuario from '../models/Usuario_model';
import Rol from '../models/Rol_model';

// Interfaz para extender Request con el usuario
declare global {
  namespace Express {
    interface Request {
      usuario?: typeof Usuario.prototype;
      user?: JwtPayload;
    }
  }
}

// Middleware de autenticación
export const verificarToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'w3r9Gv!72JkpX%lQs@8bZ&hMfT0^nAy') as JwtPayload;
    
    // Check if decoded token has the cedula_usuario property
    if (typeof decoded === 'string' || !decoded.cedula_usuario) {
        res.status(400).json({ error: 'Invalid token payload: cedula_usuario missing' });
        return;
    }

    // Fetch the user from the database using cedula_usuario from the token
    const usuario = await Usuario.findByPk(decoded.cedula_usuario);

    if (!usuario) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    req.user = decoded;
    req.usuario = usuario;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired' });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication error' });
    return;
  }
};
