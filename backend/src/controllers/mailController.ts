import nodemailer from 'nodemailer';
import { Request, Response } from 'express';
import Usuario from '../models/Usuario_model';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';

// Validación de variables de entorno al iniciar
const requiredEnvVars = ['JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASS', 'FRONTEND_URL'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`ERROR CRÍTICO: La variable de entorno ${envVar} no está definida`);
  }
}

export const sendRecoveryEmail = async (req: Request, res: Response) => {
  const { correo_usuario } = req.body;
  console.log('[Recovery] Solicitud recibida para:', correo_usuario);

  if (!correo_usuario) {
    console.log('[Recovery] Error: Correo no proporcionado');
    return res.status(400).json({ error: 'El correo es requerido' });
  }

  try {
    // Buscar usuario activo (case-insensitive)
    console.log('[Recovery] Buscando usuario en BD...');
    const usuario = await Usuario.findOne({
      where: {
        correo_usuario: {
          [Op.like]: correo_usuario // Búsqueda insensible a mayúsculas/minúsculas
        },
        estado_usuario: 'Activo'
      },
      logging: console.log // Muestra la consulta SQL en consola
    });

    if (!usuario) {
      console.log('[Recovery] Usuario no encontrado o inactivo');
      return res.status(404).json({ 
        error: 'No existe una cuenta activa con ese correo electrónico',
        details: 'Verifica que el correo esté correctamente escrito'
      });
    }

    console.log('[Recovery] Usuario encontrado:', usuario.cedula_usuario);

    // Generar token JWT (válido por 15 minutos)
    const token = jwt.sign(
      {
        id: usuario.cedula_usuario,
        correo: usuario.correo_usuario
      },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    console.log('[Recovery] Token generado:', token.substring(0, 10) + '...');

    // Configurar transporte de nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false // Solo para desarrollo, quitar en producción
      }
    });

    // Verificar conexión con el servicio de correo
    try {
      await transporter.verify();
      console.log('[Recovery] Servicio de correo verificado correctamente');
    } catch (mailError) {
      console.error('[Recovery] Error al verificar servicio de correo:', mailError);
      throw new Error('Error al conectar con el servicio de correo');
    }

    // URL de recuperación
    const recoveryUrl = `${process.env.FRONTEND_URL}Login/Recuperar-Contrasena/Restablecer?token=${encodeURIComponent(token)}`;
    console.log('[Recovery] URL generada:', recoveryUrl);

    // Configurar el correo
    const mailOptions = {
      from: `"Soporte de Canabacoa Fiestas" <${process.env.EMAIL_USER}>`,
      to: correo_usuario,
      subject: 'Recuperación de contraseña',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Hola ${usuario.nombre_usuario},</h2>
          <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
          <p>Haz clic en el siguiente enlace para continuar:</p>
          <p style="margin: 20px 0;">
            <a href="${recoveryUrl}" 
               style="background-color: #3498db; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
               Restablecer contraseña
            </a>
          </p>
          <p><small>Este enlace expirará en 15 minutos.</small></p>
          <p style="color: #7f8c8d; font-size: 0.9em;">
            Si no solicitaste este cambio, por favor ignora este mensaje y considera cambiar tu contraseña.
          </p>
        </div>
      `
    };

    // Enviar el correo
    const info = await transporter.sendMail(mailOptions);
    console.log('[Recovery] Correo enviado con ID:', info.messageId);

    return res.json({ 
      success: true,
      message: 'Correo de recuperación enviado con éxito',
      email: correo_usuario // Solo para desarrollo, quitar en producción
    });

  } catch (error) {
    console.error('[Recovery] Error completo:', error);
    return res.status(500).json({ 
      error: 'Ocurrió un error al intentar enviar el correo de recuperación',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};
export const resetPassword = async (req: Request, res: Response) => {
    const { token, password } = req.body;
  
    console.log('[Reset] Solicitud recibida con token:', token?.substring(0, 10) + '...');
  
    if (!token || !password) {
      console.log('[Reset] Error: token o contraseña faltante');
      return res.status(400).json({ 
        error: 'Token y nueva contraseña son requeridos',
        details: 'Verifica que ambos campos estén completos'
      });
    }
  
    try {
      // Verifica el token
      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET || 'w3r9Gv!72JkpX%lQs@8bZ&hMfT0^nAy'
      ) as { id: string, correo: string };
  
      console.log('[Reset] Token válido para usuario:', payload.id);
  
      // Busca al usuario
      const usuario = await Usuario.findOne({
        where: {
          cedula_usuario: payload.id,
          correo_usuario: payload.correo,
          estado_usuario: 'Activo'
        }
      });
  
      if (!usuario) {
        console.log('[Reset] Usuario no encontrado o inactivo');
        return res.status(404).json({ 
          error: 'Usuario no encontrado o inactivo',
          details: 'El token puede estar asociado a una cuenta eliminada o desactivada'
        });
      }
  
      // Asigna la nueva contraseña directamente
      usuario.contrasena_login = password;
  
      // Guarda para que se active el hook `hashPassword`
      await usuario.save();
  
      console.log('[Reset] Contraseña restablecida para usuario:', usuario.cedula_usuario);
  
      return res.json({ 
        success: true,
        message: 'Contraseña restablecida con éxito'
      });
  
    } catch (error) {
      console.error('[Reset] Error completo:', error);
  
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ error: 'El enlace ha expirado' });
      }
  
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ error: 'Token inválido' });
      }
  
      return res.status(400).json({ 
        error: 'Error al restablecer la contraseña',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      });
    }
  };
  