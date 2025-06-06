import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario_model';
import Rol from '../models/Rol_model';

// Interfaz para extender Request con el usuario
declare global {
  namespace Express {
    interface Request {
      usuario?: Usuario;
    }
  }
}

// Middleware de autenticación
export const verificarToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ 
        error: 'No se proporcionó token de autenticación',
        mensaje: 'Se requiere un token de autenticación para acceder a este recurso'
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'w3r9Gv!72JkpX%lQs@8bZ&hMfT0^nAy') as { cedula_usuario: string };
    const usuario = await Usuario.findByPk(decoded.cedula_usuario, {
      include: [{ 
        model: Rol,
        as: 'rol'
      }]
    });

    if (!usuario) {
      res.status(401).json({ 
        error: 'Usuario no encontrado',
        mensaje: 'El usuario asociado al token no existe en el sistema'
      });
      return;
    }

    if (usuario.estado_usuario !== 'Activo') {
      res.status(401).json({ 
        error: 'Usuario inactivo',
        mensaje: 'El usuario se encuentra inactivo o eliminado'
      });
      return;
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ 
        error: 'Token inválido',
        mensaje: 'El token proporcionado no es válido o ha expirado'
      });
    } else {
      res.status(500).json({ 
        error: 'Error de autenticación',
        mensaje: 'Ocurrió un error al procesar la autenticación'
      });
    }
  }
};

// Middleware de autorización
export const verificarPermiso = (permisoRequerido: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const usuario = req.usuario;
      
      if (!usuario) {
        res.status(401).json({ 
          error: 'Usuario no autenticado',
          mensaje: 'Se requiere autenticación para acceder a este recurso'
        });
        return;
      }

      const tienePermiso = await verificarPermisoUsuario(usuario.id_rol, permisoRequerido);

      if (!tienePermiso) {
        res.status(403).json({ 
          error: 'Permiso denegado',
          mensaje: 'No tiene los permisos necesarios para realizar esta acción'
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ 
        error: 'Error al verificar permisos',
        mensaje: 'Ocurrió un error al verificar los permisos del usuario'
      });
    }
  };
};

// Función auxiliar para verificar permisos
async function verificarPermisoUsuario(idRol: number, permisoRequerido: string): Promise<boolean> {
  try {
    const rol = await Rol.findByPk(idRol);
    
    if (!rol) {
      return false;
    }

    // Verificar si el rol tiene el permiso requerido
    return rol.permisos.includes(permisoRequerido);
  } catch (error) {
    console.error('Error al verificar permisos:', error);
    return false;
  }
} 