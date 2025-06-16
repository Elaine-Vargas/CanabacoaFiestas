import nodemailer from 'nodemailer';
import { Request, Response } from 'express';
import Usuario from '../models/Usuario_model';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';

// Validación de variables de entorno al iniciar
const requiredEnvVars = ['JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASS', 'FRONTEND_FULL_URL', 'EMAIL_SERVICE'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`ERROR CRÍTICO: La variable de entorno ${envVar} no está definida o está vacía. Por favor, verifica tu archivo .env.`);
  }
}

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false // Permite la conexión a servidores con certificados auto-firmados (útil en desarrollo)
  }
});

export const sendVerificationEmail = async (correo_usuario: string, verificationCode: string, isUpdate: boolean = false): Promise<string> => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: correo_usuario,
    subject: isUpdate ? 'Verificación de Nuevo Correo Electrónico' : 'Verificación de Correo Electrónico',
    html: `
      <div style="font-family: 'Century Gothic', sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #c49a44;">Verificación de Correo Electrónico</h2>
        <p>Hola,</p>
        <p>${isUpdate
          ? 'Has solicitado actualizar tu correo electrónico. Para confirmar el cambio, por favor usa el siguiente código de verificación:'
          : 'Gracias por registrarte. Para completar tu registro, por favor usa el siguiente código de verificación:'
        }</p>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #c49a44; margin: 0; font-size: 32px;">${verificationCode}</h1>
        </div>
        <p><small>Este código es válido por 15 minutos.</small></p>
        <p style="color:rgb(100, 100, 100); font-size: 0.9em;">
          Si no solicitaste esta verificación, por favor ignora este correo.
        </p>
        <p>Saludos cordiales,</p>
        <p>El equipo de Canabacoa Fiestas</p>
      </div>
    `,
  };

  try {
    console.log(`[Verification] Solicitud de verificación para: ${correo_usuario}`);
    await transporter.sendMail(mailOptions);
    console.log(`[Verification] Correo de verificación enviado a: ${correo_usuario}`);
    return "Correo de verificación enviado exitosamente";
  } catch (error) {
    console.error(`[Verification] Error al enviar correo de verificación a ${correo_usuario}:`, error);
    throw new Error("Error al enviar correo de verificación");
  }
};

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
        <div style="font-family: 'Century Gothic', sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #c49a44;">¡Hola!, ${usuario.nombre_usuario},</h2>
          <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
          <p>Haz clic en el siguiente enlace para continuar:</p>
          <p style="margin: 20px 0;">
            <a href="${recoveryUrl}" 
               style="background-color: #e0c55a; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
               Restablecer contraseña
            </a>
          </p>
          <p><small>Este enlace expirará en 15 minutos.</small></p>
          <p style="color:rgb(100, 100, 100); font-size: 0.9em;">
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
  const { token, nueva_contrasena } = req.body;

  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string, correo: string };
    
    const usuario = await Usuario.findOne({ 
      where: { 
        cedula_usuario: decoded.id,
        correo_usuario: decoded.correo
      } 
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    try {
      // Intentar actualizar la contraseña
      await usuario.update({ 
        contrasena_login: nueva_contrasena, 
        codigo_recuperacion: null, 
        expiracion_codigo: null 
      });

      res.status(200).json({ 
        success: true,
        message: 'Contraseña restablecida exitosamente' 
      });
    } catch (updateError: any) {
      // Si el error es de validación de contraseña, devolver un mensaje más específico
      if (updateError.message.includes('contraseña')) {
        return res.status(400).json({ 
          error: updateError.message,
          details: 'La contraseña debe cumplir con los requisitos de seguridad'
        });
      }
      throw updateError; // Re-lanzar otros tipos de errores
    }

  } catch (error) {
    console.error('Error en resetPassword:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }
    res.status(500).json({ error: 'Error al restablecer contraseña' });
  }
};

export const sendWelcomeEmail = async (req: Request, res: Response) => {
  const { correo_usuario } = req.body;
  console.log('[Welcome] Correo de Bienvenida para:', correo_usuario);

  if (!correo_usuario) {
    console.log('[Welcome] Error: Correo no proporcionado');
    return res.status(400).json({ error: 'El correo es requerido' });
  }

  try {
    // Buscar usuario activo (case-insensitive)
    console.log('[Welcome] Buscando usuario en BD...');
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
      console.log('[Welcome] Usuario no encontrado o inactivo');
      return res.status(404).json({ 
        error: 'No existe una cuenta activa con ese correo electrónico',
        details: 'Verifica que el correo esté correctamente escrito'
      });
    }

    console.log('[Welcome] Usuario encontrado:', usuario.cedula_usuario);

    // Verificar conexión con el servicio de correo
    try {
      await transporter.verify();
      console.log('[Welcome] Servicio de correo verificado correctamente');
    } catch (mailError) {
      console.error('[Welcome] Error al verificar servicio de correo:', mailError);
      throw new Error('Error al conectar con el servicio de correo');
    }

    // Configurar el correo
    const mailOptions = {
      from: `"Canabacoa Fiestas" <${process.env.EMAIL_USER}>`,
      to: correo_usuario,
      subject: '¡Bienvenido/a a Canabacoa Fiestas!',
      html: `
        <div style="font-family: 'Century Gothic', sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #c49a44;">¡Hola, ${usuario.nombre_usuario}!</h2>
          <p>¡Bienvenido/a a Canabacoa Fiestas! Estamos encantados de tenerte con nosotros.</p>
          <p>Ahora puedes iniciar sesión y comenzar a explorar todos nuestros servicios.</p>
          <p style="margin: 20px 0;">
            <a href="${process.env.FRONTEND_URL}Login" 
               style="background-color: #e0c55a; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
               Ir a la página de inicio de sesión
            </a>
          </p>
          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
          <p>Saludos cordiales,</p>
          <p>El equipo de Canabacoa Fiestas</p>
        </div>
      `
    };

    // Enviar el correo
    const info = await transporter.sendMail(mailOptions);
    console.log('[Welcome] Correo enviado con ID:', info.messageId);

    return res.json({ 
      success: true,
      message: 'Correo de bienvenida enviado con éxito',
      email: correo_usuario // Solo para desarrollo, quitar en producción
    });

  } catch (error) {
    console.error('[Welcome] Error completo:', error);
    return res.status(500).json({ 
      error: 'Ocurrió un error al intentar enviar el correo de bienvenida',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

export const verifyEmailCode = async (req: Request, res: Response) => {
  const { correo_usuario, codigo } = req.body;

  try {
    const usuario = await Usuario.findOne({ where: { correo_usuario } });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (usuario.codigo_recuperacion !== codigo || !usuario.expiracion_codigo || Date.now() > usuario.expiracion_codigo) {
      return res.status(400).json({ error: 'Código inválido o expirado' });
    }

    res.status(200).json({ message: 'Código verificado exitosamente' });

  } catch (error) {
    console.error('Error en verifyEmailCode:', error);
    res.status(500).json({ error: 'Error al verificar código' });
  }
};
