import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario_model';

// Interfaz para extender Request con el usuario
declare global {
  namespace Express {
    interface Request {
      usuario?: any;
    }
  }
}

// Middleware de autenticación
export const verificarToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'w3r9Gv!72JkpX%lQs@8bZ&hMfT0^nAy') as any;
    const usuario = await Usuario.findByPk(decoded.cedula_usuario, {
      include: [{ association: 'rol' }]
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Middleware de autorización
export const verificarPermiso = (permisoRequerido: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const usuario = req.usuario;
      
      if (!usuario) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      // Aquí deberías verificar si el usuario tiene el permiso requerido
      // Esto dependerá de cómo estés manejando los permisos en tu base de datos
      const tienePermiso = await verificarPermisoUsuario(usuario.id_rol, permisoRequerido);

      if (!tienePermiso) {
        return res.status(403).json({ error: 'No tiene permiso para realizar esta acción' });
      }

      next();
    } catch (error) {
      return res.status(500).json({ error: 'Error al verificar permisos' });
    }
  };
};

// Función auxiliar para verificar permisos
async function verificarPermisoUsuario(idRol: number, permisoRequerido: string): Promise<boolean> {
  // Aquí implementarías la lógica para verificar si el rol tiene el permiso
  // Por ejemplo, consultando la tabla rol_permiso
  return true; // Implementar la lógica real
} 