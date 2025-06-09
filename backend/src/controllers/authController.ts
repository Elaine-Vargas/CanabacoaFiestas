import { Request, Response } from 'express';
import Usuario from '../models/Usuario_model';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { sendVerificationEmail } from '../controllers/mailController';

// Variable global para almacenar datos de registro pendientes
declare global {
  var pendingRegistrations: Map<string, PendingRegistration>;
}

// Definir el tipo para los datos de registro pendientes
interface PendingRegistration {
  data: {
    nombre_usuario?: string;
    apellido_usuario?: string;
    cedula_usuario: string;
    correo_usuario: string;
    tel_usuario?: string;
    contrasena_login?: string;
    usuario_login: string;
    id_rol?: number;
  };
  verificationCode: string;
  timestamp: number;
}

export const Login = async (req: Request, res: Response) => {
  const { usuario_login, contrasena } = req.body;

  try {
    // Buscar primero por usuario_login
    let usuario = await Usuario.findOne({
      where: {
        usuario_login,
        estado_usuario: {
          [Op.in]: ['Activo', 'Pendiente'] // Permitir login si está activo o pendiente
        }
      },
      include: [{ association: 'rol' }]
    });

    // Si no encuentra por usuario_login, intenta por cedula_usuario
    if (!usuario) {
      usuario = await Usuario.findOne({
        where: {
          cedula_usuario: usuario_login,
          estado_usuario: {
            [Op.in]: ['Activo', 'Pendiente'] // Permitir login si está activo o pendiente
          }
        },
        include: [{ association: 'rol' }]
      });
    }

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario o contraseña inválidos' });
    }

    // Validar contraseña
    const valido = await usuario.compararContrasena(contrasena);
    if (!valido) {
      return res.status(404).json({ error: 'Usuario o contraseña inválidos' });
    }

    // Verificar si el correo está verificado
    if (!usuario.estado_usuario) {
      return res.status(403).json({ 
        error: 'Correo no verificado',
        message: 'Por favor verifica tu correo electrónico antes de iniciar sesión'
      });
    }

    // Si el usuario está pendiente, actualizar a activo
    if (usuario.estado_usuario === 'Pendiente') {
      await usuario.update({ estado_usuario: 'Activo' });
    }

    // Generar token
    const token = jwt.sign(
      {
        usuario_login: usuario.usuario_login,
        cedula_usuario: usuario.cedula_usuario,
        rol: usuario.id_rol
      },
      process.env.JWT_SECRET || 'w3r9Gv!72JkpX%lQs@8bZ&hMfT0^nAy',
      { expiresIn: '24h' }
    );

    // Mostrar token en consola
    console.log('Token generado:', token);

    // Respuesta exitosa
    res.json({
      mensaje: `Inicio de sesión exitoso, ¡Bienvenido/a ${usuario.nombre_usuario} ${usuario.apellido_usuario}!`,
      token,
      nombre_usuario: usuario.nombre_usuario,
      apellido_usuario: usuario.apellido_usuario,
      usuario_login: usuario.usuario_login,
      rol: usuario.id_rol
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

export const RegisterClient = async (req: Request, res: Response) => {
  const {
    nombre_usuario,
    apellido_usuario,
    cedula_usuario,
    correo_usuario,
    tel_usuario,
    contrasena_login,
    usuario_login,
  } = req.body;

  try {
    // Limpiar registros pendientes expirados (más de 15 minutos)
    if (global.pendingRegistrations) {
      const now = Date.now();
      for (const [email, registration] of global.pendingRegistrations.entries()) {
        if ((now - registration.timestamp) > 15 * 60 * 1000) { // 15 minutos en milisegundos
          global.pendingRegistrations.delete(email);
        }
      }
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({
      where: {
        [Op.or]: [
          { usuario_login },
          { cedula_usuario },
          { correo_usuario }
        ]
      }
    });

    if (usuarioExistente) {
      let errorMessage = 'Ya existe un usuario con ';
      if (usuarioExistente.usuario_login === usuario_login) {
        errorMessage += 'ese nombre de usuario';
      } else if (usuarioExistente.cedula_usuario === cedula_usuario) {
        errorMessage += 'esa cédula';
      } else if (usuarioExistente.correo_usuario === correo_usuario) {
        errorMessage += 'ese correo electrónico';
      }
      return res.status(400).json({ error: errorMessage });
    }

    // Verificar si ya existe un registro pendiente para este correo
    if (global.pendingRegistrations?.has(correo_usuario)) {
      const pendingRegistration = global.pendingRegistrations.get(correo_usuario);
      const now = Date.now();
      
      // Si el registro pendiente ha expirado, eliminarlo
      if (pendingRegistration && (now - pendingRegistration.timestamp) > 15 * 60 * 1000) {
        global.pendingRegistrations.delete(correo_usuario);
      } else {
        return res.status(400).json({ 
          error: 'Ya existe un registro pendiente para este correo',
          details: 'Por favor verifica tu correo electrónico o espera 15 minutos para intentar nuevamente'
        });
      }
    }

    // Verificar si hay registros pendientes con los mismos datos únicos
    for (const [email, registration] of global.pendingRegistrations?.entries() || []) {
      // Verificar si el registro pendiente ha expirado
      const now = Date.now();
      if ((now - registration.timestamp) > 15 * 60 * 1000) {
        global.pendingRegistrations.delete(email);
        continue;
      }

      if (registration.data.usuario_login === usuario_login) {
        return res.status(400).json({ error: 'Ya existe un registro pendiente con ese nombre de usuario' });
      }
      if (registration.data.cedula_usuario === cedula_usuario) {
        return res.status(400).json({ error: 'Ya existe un registro pendiente con esa cédula' });
      }
      if (registration.data.correo_usuario === correo_usuario) {
        return res.status(400).json({ error: 'Ya existe un registro pendiente con ese correo electrónico' });
      }
    }

    // Si todas las validaciones pasan, proceder con el registro
    // Almacenar datos de registro pendientes antes de enviar el correo
    global.pendingRegistrations = global.pendingRegistrations || new Map();
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate code here
    global.pendingRegistrations.set(correo_usuario, {
      data: {
        nombre_usuario,
        apellido_usuario,
        cedula_usuario,
        correo_usuario,
        tel_usuario,
        contrasena_login,
        usuario_login,
        id_rol: 2 // Rol de cliente
      },
      verificationCode: verificationCode, // Set the generated code
      timestamp: Date.now()
    });

    // Enviar correo de verificación
    try {
      await sendVerificationEmail(correo_usuario, verificationCode);
      
      res.status(200).json({
        mensaje: 'Por favor verifica tu correo electrónico para completar el registro.',
        correo_usuario
      });
    } catch (error) {
      // Si falla el envío del correo, eliminar el registro pendiente
      global.pendingRegistrations.delete(correo_usuario);
      console.error('Error al enviar correo de verificación:', error);
      res.status(500).json({ error: 'Error al enviar correo de verificación' });
    }

  } catch (error) {
    console.error('Error en registro de cliente:', error);
    res.status(500).json({ error: 'Error al registrar cliente' });
  }
};

export const RegisterUser = async (req: Request, res: Response) => {
  const {
    nombre_usuario,
    apellido_usuario,
    cedula_usuario,
    correo_usuario,
    tel_usuario,
    contrasena_login,
    usuario_login,
    id_rol
  } = req.body;

  try {
    // Verificar si el usuario_login ya existe
    const usuarioLoginExistente = await Usuario.findOne({
      where: { usuario_login }
    });

    if (usuarioLoginExistente) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }

    // Verificar si la cédula ya existe
    const cedulaExistente = await Usuario.findOne({
      where: { cedula_usuario }
    });

    if (cedulaExistente) {
      return res.status(400).json({ error: 'La cédula ya está registrada' });
    }

    // Verificar si el correo ya existe
    const correoExistente = await Usuario.findOne({
      where: { correo_usuario }
    });

    if (correoExistente) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    }

    // Verificar que el rol sea válido
    if (!id_rol || (id_rol !== 1 && id_rol !== 2 && id_rol !== 3)) {
      return res.status(400).json({ error: 'Rol de usuario inválido' });
    }

    // Crear nuevo usuario
    const nuevoUsuario = await Usuario.create({
      nombre_usuario,
      apellido_usuario,
      cedula_usuario,
      correo_usuario,
      tel_usuario,
      contrasena_login,
      usuario_login,
      id_rol,
      estado_usuario: 'Activo'
    });

    res.status(201).json({
      mensaje: `¡Usuario ${nombre_usuario} ${apellido_usuario} registrado exitosamente!`,
      usuario: {
        nombre_usuario: nuevoUsuario.nombre_usuario,
        apellido_usuario: nuevoUsuario.apellido_usuario,
        usuario_login: nuevoUsuario.usuario_login,
        id_rol: nuevoUsuario.id_rol
      }
    });

  } catch (error) {
    console.error('Error en registro de usuario:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

export const GetUserData = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'w3r9Gv!72JkpX%lQs@8bZ&hMfT0^nAy') as { usuario_login?: string, cedula_usuario?: string };
    
    if (!decoded.usuario_login && !decoded.cedula_usuario) {
      return res.status(400).json({ error: 'Token inválido' });
    }

    const usuario = await Usuario.findOne({
      attributes: [
        'nombre_usuario',
        'apellido_usuario',
        'cedula_usuario',
        'correo_usuario',
        'tel_usuario',
        'usuario_login',
        'id_rol',
        'estado_usuario'
      ],
      where: {
        [Op.or]: [
          { usuario_login: decoded.usuario_login },
          { cedula_usuario: decoded.cedula_usuario }
        ]
      },
      include: [{
        association: 'rol',
        attributes: ['nombre_rol']
      }]
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Enviar datos del usuario
    res.json({
      nombre_usuario: usuario.nombre_usuario,
      apellido_usuario: usuario.apellido_usuario,
      cedula_usuario: usuario.cedula_usuario,
      correo_usuario: usuario.correo_usuario,
      tel_usuario: usuario.tel_usuario,
      usuario_login: usuario.usuario_login,
      id_rol: usuario.id_rol,
      estado_usuario: usuario.estado_usuario,
      rol_nombre: usuario.rol?.nombre_rol
    });

  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    res.status(500).json({ error: 'Error al obtener datos del usuario' });
  }
};

export const sendUpdateEmailVerification = async (req: Request, res: Response) => {
  const { correo_usuario } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  try {
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'w3r9Gv!72JkpX%lQs@8bZ&hMfT0^nAy') as { usuario_login: string, cedula_usuario: string };
    
    if (!decoded.usuario_login && !decoded.cedula_usuario) {
      return res.status(400).json({ error: 'Token inválido' });
    }

    // Limpiar registros pendientes expirados para este correo
    if (global.pendingRegistrations?.has(correo_usuario)) {
      const pendingRegistration = global.pendingRegistrations.get(correo_usuario);
      const now = Date.now();
      if (pendingRegistration && (now - pendingRegistration.timestamp) > 15 * 60 * 1000) { // 15 minutos en milisegundos
        global.pendingRegistrations.delete(correo_usuario);
      }
    }

    // Verificar si el nuevo correo ya existe en la base de datos
    const correoExistente = await Usuario.findOne({
      where: { correo_usuario }
    });

    if (correoExistente) {
      return res.status(400).json({ error: 'El correo electrónico ya está en uso' });
    }

    // Generar código de verificación
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Almacenar datos de actualización pendientes
    global.pendingRegistrations = global.pendingRegistrations || new Map();
    global.pendingRegistrations.set(correo_usuario, {
      data: {
        correo_usuario,
        usuario_login: decoded.usuario_login || '',
        cedula_usuario: decoded.cedula_usuario || '',
        nombre_usuario: '', // Placeholder
        apellido_usuario: '', // Placeholder
        tel_usuario: '', // Placeholder
        contrasena_login: '', // Placeholder
        id_rol: 2 // Default rol for pending updates
      },
      verificationCode,
      timestamp: Date.now()
    });

    // Enviar correo de verificación (la función sendVerificationEmail ya no maneja res directamente)
    try {
      await sendVerificationEmail(correo_usuario, verificationCode);
      
      res.status(200).json({
        mensaje: 'Por favor verifica tu nuevo correo electrónico para completar la actualización.',
        correo_usuario
      });
    } catch (emailError) {
      global.pendingRegistrations.delete(correo_usuario); // Eliminar el registro pendiente si falla el envío
      console.error('Error al enviar correo de verificación:', emailError);
      res.status(500).json({ error: 'Error al enviar correo de verificación' });
    }

  } catch (error) {
    console.error('Error en verificación de correo:', error);
    res.status(500).json({ error: 'Error al verificar correo' });
  }
};

export const verifyUpdateEmail = async (req: Request, res: Response) => {
  const { correo_usuario, codigo } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  try {
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'w3r9Gv!72JkpX%lQs@8bZ&hMfT0^nAy') as { usuario_login?: string, cedula_usuario?: string };
    
    if (!decoded.usuario_login && !decoded.cedula_usuario) {
      return res.status(400).json({ error: 'Token inválido' });
    }

    // Verificar que exista un registro pendiente
    const pendingRegistration = global.pendingRegistrations?.get(correo_usuario);
    
    if (!pendingRegistration) {
      return res.status(400).json({ 
        error: 'No hay actualización pendiente para este correo',
        details: 'Por favor solicita una nueva verificación'
      });
    }

    // Verificar el código
    if (pendingRegistration.verificationCode !== codigo) {
      return res.status(400).json({ 
        error: 'Código de verificación incorrecto',
        details: 'Por favor verifica el código e intenta nuevamente'
      });
    }

    // Verificar si el código ha expirado (15 minutos)
    const now = Date.now();
    if ((now - pendingRegistration.timestamp) > 15 * 60 * 1000) {
      global.pendingRegistrations.delete(correo_usuario);
      return res.status(400).json({ 
        error: 'Código de verificación expirado',
        details: 'Por favor solicita un nuevo código'
      });
    }

    // Buscar usuario (usando los datos del token original para asegurar que el usuario que inició la solicitud es quien actualiza)
    const usuario = await Usuario.findOne({
      where: {
        [Op.or]: [
          { usuario_login: decoded.usuario_login },
          { cedula_usuario: decoded.cedula_usuario }
        ]
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Actualizar correo
    await usuario.update({ correo_usuario });

    // Eliminar el registro pendiente
    global.pendingRegistrations.delete(correo_usuario);

    return res.json({
      success: true,
      message: 'Correo electrónico actualizado exitosamente',
      usuario: {
        correo_usuario: usuario.correo_usuario
      }
    });

  } catch (error) {
    console.error('Error al verificar actualización de correo:', error);
    return res.status(500).json({ 
      error: 'Error al verificar actualización de correo',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

export const UpdateUserData = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'w3r9Gv!72JkpX%lQs@8bZ&hMfT0^nAy') as { usuario_login?: string, cedula_usuario?: string };
    
    if (!decoded.usuario_login && !decoded.cedula_usuario) {
      return res.status(400).json({ error: 'Token inválido' });
    }

    const { tel_usuario, usuario_login, contrasena_login, contrasena_actual } = req.body;

    // Buscar usuario
    const usuario = await Usuario.findOne({
      where: {
        [Op.or]: [
          { usuario_login: decoded.usuario_login },
          { cedula_usuario: decoded.cedula_usuario }
        ]
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const contrasenaValida = await usuario.compararContrasena(contrasena_actual);
    if (!contrasenaValida) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    // Verificar si el nuevo nombre de usuario ya existe (si se está cambiando)
    if (usuario_login && usuario_login !== usuario.usuario_login) {
      const usuarioExistente = await Usuario.findOne({
        where: { usuario_login }
      });
      if (usuarioExistente) {
        return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
      }
    }

    // Actualizar datos
    const updateData: any = {};
    if (tel_usuario) updateData.tel_usuario = tel_usuario;
    if (usuario_login) updateData.usuario_login = usuario_login;
    if (contrasena_login) updateData.contrasena_login = contrasena_login;

    await usuario.update(updateData);

    res.json({
      mensaje: 'Datos actualizados exitosamente',
      usuario: {
        nombre_usuario: usuario.nombre_usuario,
        apellido_usuario: usuario.apellido_usuario,
        correo_usuario: usuario.correo_usuario,
        tel_usuario: usuario.tel_usuario,
        usuario_login: usuario.usuario_login
      }
    });

  } catch (error) {
    console.error('Error al actualizar datos del usuario:', error);
    res.status(500).json({ error: 'Error al actualizar datos del usuario' });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'w3r9Gv!72JkpX%lQs@8bZ&hMfT0^nAy') as { usuario_login?: string, cedula_usuario?: string };
    
    if (!decoded.usuario_login && !decoded.cedula_usuario) {
      return res.status(400).json({ error: 'Token inválido' });
    }

    const usuario = await Usuario.findOne({
      attributes: [
        'nombre_usuario',
        'apellido_usuario',
        'cedula_usuario',
        'correo_usuario',
        'tel_usuario',
        'usuario_login',
        'id_rol',
        'estado_usuario'
      ],
      where: {
        [Op.or]: [
          { usuario_login: decoded.usuario_login },
          { cedula_usuario: decoded.cedula_usuario }
        ]
      },
      include: [{
        association: 'rol',
        attributes: ['nombre_rol']
      }]
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      nombre_usuario: usuario.nombre_usuario,
      apellido_usuario: usuario.apellido_usuario,
      cedula_usuario: usuario.cedula_usuario,
      correo_usuario: usuario.correo_usuario,
      tel_usuario: usuario.tel_usuario,
      usuario_login: usuario.usuario_login,
      id_rol: usuario.id_rol,
      estado_usuario: usuario.estado_usuario,
      rol_nombre: usuario.rol?.nombre_rol
    });

  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    res.status(500).json({ error: 'Error al obtener datos del usuario' });
  }
};

export const completeRegistration = async (req: Request, res: Response) => {
  const { correo_usuario, codigo } = req.body;
  console.log('[CompleteRegistration] Completando registro para:', correo_usuario);

  try {
    // Verificar que exista un registro pendiente
    const pendingRegistration = global.pendingRegistrations?.get(correo_usuario);
    
    if (!pendingRegistration) {
      return res.status(400).json({ 
        error: 'No hay registro pendiente para este correo',
        details: 'Por favor comienza el proceso de registro nuevamente'
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({
      where: {
        [Op.or]: [
          { usuario_login: pendingRegistration.data.usuario_login },
          { cedula_usuario: pendingRegistration.data.cedula_usuario },
          { correo_usuario: pendingRegistration.data.correo_usuario }
        ]
      }
    });

    if (usuarioExistente) {
      // Limpiar el registro pendiente
      global.pendingRegistrations.delete(correo_usuario);
      
      let errorMessage = 'Ya existe un usuario con ';
      if (usuarioExistente.usuario_login === pendingRegistration.data.usuario_login) {
        errorMessage += 'ese nombre de usuario';
      } else if (usuarioExistente.cedula_usuario === pendingRegistration.data.cedula_usuario) {
        errorMessage += 'esa cédula';
      } else if (usuarioExistente.correo_usuario === pendingRegistration.data.correo_usuario) {
        errorMessage += 'ese correo electrónico';
      }
      return res.status(400).json({ error: errorMessage });
    }

    // Verificar el código
    if (pendingRegistration.verificationCode !== codigo) {
      return res.status(400).json({ 
        error: 'Código de verificación incorrecto',
        details: 'Por favor verifica el código e intenta nuevamente'
      });
    }

    // Verificar si el código ha expirado (15 minutos)
    const now = Date.now();
    if ((now - pendingRegistration.timestamp) > 15 * 60 * 1000) {
      global.pendingRegistrations.delete(correo_usuario);
      return res.status(400).json({ 
        error: 'Código de verificación expirado',
        details: 'Por favor solicita un nuevo código'
      });
    }

    // Asegurarse de que id_rol esté presente
    if (!pendingRegistration.data.id_rol) {
      pendingRegistration.data.id_rol = 2; // Establecer rol de cliente por defecto
    }

    // Crear el usuario con los datos guardados
    const usuario = await Usuario.create({
      ...pendingRegistration.data,
      estado_usuario: 'Activo'
    });

    // Eliminar el registro pendiente
    global.pendingRegistrations.delete(correo_usuario);

    // Generar token JWT
    const token = jwt.sign(
      {
        id: usuario.cedula_usuario,
        correo: usuario.correo_usuario,
        rol: usuario.id_rol
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    return res.json({
      success: true,
      message: 'Registro completado exitosamente',
      token,
      usuario: {
        nombre_usuario: usuario.nombre_usuario,
        apellido_usuario: usuario.apellido_usuario,
        usuario_login: usuario.usuario_login,
        rol: usuario.id_rol,
        cedula_usuario: usuario.cedula_usuario,
        correo_usuario: usuario.correo_usuario,
        tel_usuario: usuario.tel_usuario
      }
    });

  } catch (error) {
    console.error('[CompleteRegistration] Error:', error);
    return res.status(500).json({ 
      error: 'Error al completar el registro',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

export const validateRegistration = async (req: Request, res: Response) => {
  const { usuario_login, cedula_usuario, correo_usuario } = req.body;

  try {
    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({
      where: {
        [Op.or]: [
          { usuario_login },
          { cedula_usuario },
          { correo_usuario }
        ]
      }
    });

    if (usuarioExistente) {
      let errorMessage = 'Ya existe un usuario con ';
      if (usuarioExistente.usuario_login === usuario_login) {
        errorMessage += 'ese nombre de usuario';
      } else if (usuarioExistente.cedula_usuario === cedula_usuario) {
        errorMessage += 'esa cédula';
      } else if (usuarioExistente.correo_usuario === correo_usuario) {
        errorMessage += 'ese correo electrónico';
      }
      return res.status(400).json({ error: errorMessage });
    }

    // Verificar si ya existe un registro pendiente para este correo
    if (global.pendingRegistrations?.has(correo_usuario)) {
      return res.status(400).json({ 
        error: 'Ya existe un registro pendiente para este correo',
        details: 'Por favor verifica tu correo electrónico o espera 15 minutos para intentar nuevamente'
      });
    }

    // Verificar si hay registros pendientes con los mismos datos únicos
    for (const [email, registration] of global.pendingRegistrations?.entries() || []) {
      if (registration.data.usuario_login === usuario_login) {
        return res.status(400).json({ error: 'Ya existe un registro pendiente con ese nombre de usuario' });
      }
      if (registration.data.cedula_usuario === cedula_usuario) {
        return res.status(400).json({ error: 'Ya existe un registro pendiente con esa cédula' });
      }
      if (registration.data.correo_usuario === correo_usuario) {
        return res.status(400).json({ error: 'Ya existe un registro pendiente con ese correo electrónico' });
      }
    }

    // Si todas las validaciones pasan
    res.status(200).json({ message: 'Datos válidos para registro' });

  } catch (error) {
    console.error('Error en validación de registro:', error);
    res.status(500).json({ error: 'Error al validar datos de registro' });
  }
};

export default Login;